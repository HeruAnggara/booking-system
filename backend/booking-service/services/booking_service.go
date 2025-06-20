package services

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/user-service/config"
	"github.com/user-service/models"
)

// BookingService menangani logika bisnis untuk pemesanan
type BookingService struct {
	cfg *config.Config
}

// NewBookingService membuat instance baru BookingService
func NewBookingService(cfg *config.Config) *BookingService {
	return &BookingService{cfg: cfg}
}

// CreateBooking membuat pemesanan baru
func (s *BookingService) CreateBooking(ctx context.Context, req *models.BookingCreateRequest) (*models.Booking, error) {
	// Validasi ketersediaan kursi
	var availableSeats int
	err := s.cfg.DB.QueryRowContext(ctx, "SELECT available_seats FROM concerts WHERE id = ?", req.ConcertID).
		Scan(&availableSeats)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("concert not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to check concert availability: %v", err)
	}
	if availableSeats < req.Seats {
		return nil, fmt.Errorf("not enough seats available")
	}

	// Mulai transaksi
	tx, err := s.cfg.DB.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to start transaction: %v", err)
	}
	defer tx.Rollback()

	// Insert pemesanan
	query := `INSERT INTO bookings (user_id, concert_id, seats, status, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?)`
	result, err := tx.ExecContext(ctx, query, req.UserID, req.ConcertID, req.Seats, "pending", time.Now(), time.Now())
	if err != nil {
		return nil, fmt.Errorf("failed to create booking: %v", err)
	}

	bookingID, err := result.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("failed to get last insert ID: %v", err)
	}

	// Update ketersediaan kursi
	updateQuery := `UPDATE concerts SET available_seats = available_seats - ? WHERE id = ?`
	_, err = tx.ExecContext(ctx, updateQuery, req.Seats, req.ConcertID)
	if err != nil {
		return nil, fmt.Errorf("failed to update concert seats: %v", err)
	}

	// Commit transaksi
	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %v", err)
	}

	booking := &models.Booking{
		ID:        int(bookingID),
		UserID:    req.UserID,
		ConcertID: req.ConcertID,
		Seats:     req.Seats,
		Status:    "pending",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Cache pemesanan di Redis
	cacheKey := fmt.Sprintf("booking:%d", bookingID)
	bookingJSON, _ := json.Marshal(booking)
	if err := s.cfg.Redis.Set(ctx, cacheKey, bookingJSON, 10*time.Minute).Err(); err != nil {
		log.Printf("Failed to cache booking %d: %v", bookingID, err)
	}

	return booking, nil
}

// GetBookingByID mengambil pemesanan berdasarkan ID
func (s *BookingService) GetBookingByID(ctx context.Context, id int) (*models.Booking, error) {
	// Cek cache Redis
	cacheKey := fmt.Sprintf("booking:%d", id)
	cached, err := s.cfg.Redis.Get(ctx, cacheKey).Result()
	if err == nil {
		var booking models.Booking
		if err := json.Unmarshal([]byte(cached), &booking); err == nil {
			return &booking, nil
		}
		log.Printf("Failed to unmarshal cached booking %d: %v", id, err)
	}

	// Query database jika tidak ada di cache
	booking := &models.Booking{}
	query := `SELECT id, user_id, concert_id, seats, status, created_at, updated_at 
              FROM bookings WHERE id = ?`
	err = s.cfg.DB.QueryRowContext(ctx, query, id).Scan(
		&booking.ID, &booking.UserID, &booking.ConcertID, &booking.Seats, 
		&booking.Status, &booking.CreatedAt, &booking.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to fetch booking: %v", err)
	}

	// Cache hasil query
	bookingJSON, _ := json.Marshal(booking)
	if err := s.cfg.Redis.Set(ctx, cacheKey, bookingJSON, 10*time.Minute).Err(); err != nil {
		log.Printf("Failed to cache booking %d: %v", id, err)
	}

	return booking, nil
}