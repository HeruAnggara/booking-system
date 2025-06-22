package services

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/HeruAnggara/booking-system/backend/booking-service/config"
	"github.com/HeruAnggara/booking-system/backend/booking-service/models"
)

// BookingService menangani logika bisnis untuk booking
type BookingService struct {
	cfg *config.Config
}

// NewBookingService membuat instance baru BookingService
func NewBookingService(cfg *config.Config) *BookingService {
	return &BookingService{cfg: cfg}
}

// CreateBooking membuat booking baru
func (s *BookingService) CreateBooking(ctx context.Context, req *models.BookingCreateRequest) (*models.Booking, error) {
	cachePendingKey := fmt.Sprintf("pending_bookings:%d", req.UserID)
	if err := s.cfg.Redis.Del(ctx, cachePendingKey).Err(); err != nil {
		log.Printf("Failed to delete pending bookings cache for user %d: %v", req.UserID, err)
	}

	// Contoh: cek available_seats di tabel concerts
	var availableSeats int
	err := s.cfg.DB.QueryRowContext(ctx, "SELECT available_seats FROM concerts WHERE id = ?", req.ConcertID).Scan(&availableSeats)
	if err != nil {
		return nil, fmt.Errorf("failed to check concert: %v", err)
	}
	if availableSeats < req.TicketCount {
		return nil, fmt.Errorf("insufficient tickets available")
	}

	// Update available_seats (opsional)
	_, err = s.cfg.DB.ExecContext(ctx, "UPDATE concerts SET available_seats = available_seats - ? WHERE id = ?", req.TicketCount, req.ConcertID)
	if err != nil {
		return nil, fmt.Errorf("failed to update concert seats: %v", err)
	}

	// Insert booking ke database
	query := `INSERT INTO bookings (user_id, concert_id, ticket_count, total_price, status, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`
	result, err := s.cfg.DB.ExecContext(ctx, query, req.UserID, req.ConcertID, req.TicketCount, req.TotalPrice, "pending", time.Now(), time.Now())
	if err != nil {
		return nil, fmt.Errorf("failed to create booking: %v", err)
	}

	bookingID, err := result.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("failed to get last insert ID: %v", err)
	}

	booking := &models.Booking{
		ID:          int(bookingID),
		UserID:      req.UserID,
		ConcertID:   req.ConcertID,
		TicketCount: req.TicketCount,
		TotalPrice:  req.TotalPrice,
		Status:      "pending",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	// Cache booking di Redis
	cacheKey := fmt.Sprintf("booking:%d:%d", req.UserID, bookingID)
	bookingJSON, _ := json.Marshal(booking)
	if err := s.cfg.Redis.Set(ctx, cacheKey, bookingJSON, 10*time.Minute).Err(); err != nil {
		log.Printf("Failed to cache booking %d: %v", bookingID, err)
	}

	pendingBookings, err := s.GetPendingBookings(ctx, req.UserID)
	if err != nil {
		log.Printf("Failed to fetch pending bookings for cache update: %v", err)
	} else {
		pendingJSON, _ := json.Marshal(pendingBookings)
		if err := s.cfg.Redis.Set(ctx, cachePendingKey, pendingJSON, 10*time.Minute).Err(); err != nil {
			log.Printf("Failed to update pending bookings cache for user %d: %v", req.UserID, err)
		}
	}

	return booking, nil
}

// GetBookingByID mengambil booking berdasarkan ID
func (s *BookingService) GetBookingByID(ctx context.Context, id int, userID int) (*models.Booking, error) {
	// Use cache key including userID to avoid cross-user data leak
	cacheKey := fmt.Sprintf("booking:%d:%d", userID, id)
	cached, err := s.cfg.Redis.Get(ctx, cacheKey).Result()
	if err == nil {
		var booking models.Booking
		if err := json.Unmarshal([]byte(cached), &booking); err == nil {
			if booking.UserID == userID {
				return &booking, nil
			}
			// Booking belongs to another user, return nil explicitly
			return nil, nil
		}
		log.Printf("Failed to unmarshal cached booking %d for user %d: %v", id, userID, err)
	}

	// Query database
	booking := &models.Booking{}
	query := `SELECT id, user_id, concert_id, ticket_count, total_price, status, created_at, updated_at 
              FROM bookings WHERE id = ? AND user_id = ?`
	err = s.cfg.DB.QueryRowContext(ctx, query, id, userID).Scan(
		&booking.ID, &booking.UserID, &booking.ConcertID, &booking.TicketCount,
		&booking.TotalPrice, &booking.Status, &booking.CreatedAt, &booking.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to fetch booking: %v", err)
	}

	// Cache hasil query with userID in key
	bookingJSON, _ := json.Marshal(booking)
	if err := s.cfg.Redis.Set(ctx, cacheKey, bookingJSON, 10*time.Minute).Err(); err != nil {
		log.Printf("Failed to cache booking %d for user %d: %v", id, userID, err)
	}

	return booking, nil
}

func (s *BookingService) DeleteBooking(ctx context.Context, id int, userID int) error {
	// Ambil booking untuk memvalidasi dan mendapatkan ticket_count
	booking, err := s.GetBookingByID(ctx, id, userID)
	if err != nil {
		return fmt.Errorf("failed to fetch booking for deletion: %v", err)
	}
	if booking == nil {
		return fmt.Errorf("booking not found or not owned by user")
	}

	// Kembalikan available_seats ke concert
	_, err = s.cfg.DB.ExecContext(ctx, "UPDATE concerts SET available_seats = available_seats + ? WHERE id = ?", booking.TicketCount, booking.ConcertID)
	if err != nil {
		return fmt.Errorf("failed to update concert seats: %v", err)
	}

	// Hapus booking dari database
	query := `DELETE FROM bookings WHERE id = ? AND user_id = ?`
	result, err := s.cfg.DB.ExecContext(ctx, query, id, userID)
	if err != nil {
		return fmt.Errorf("failed to delete booking: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to check rows affected: %v", err)
	}
	if rowsAffected == 0 {
		return fmt.Errorf("no booking deleted")
	}

	// Hapus cache Redis
	cacheKey := fmt.Sprintf("booking:%d", id)
	if err := s.cfg.Redis.Del(ctx, cacheKey).Err(); err != nil {
		log.Printf("Failed to delete cache for booking %d: %v", id, err)
	}

	// Hapus cache pending
	cachePendingKey := fmt.Sprintf("pending_bookings:%d", userID)
	if err := s.cfg.Redis.Del(ctx, cachePendingKey).Err(); err != nil {
		log.Printf("Failed to delete cache for pending bookings of user %d: %v", userID, err)
	}

	return nil
}

// GetPendingBookings mengambil semua booking yang masih pending untuk user
func (s *BookingService) GetPendingBookings(ctx context.Context, userID int) ([]models.Booking, error) {
	// Cek cache Redis
	cacheKey := fmt.Sprintf("pending_bookings:%d", userID)
	cached, err := s.cfg.Redis.Get(ctx, cacheKey).Result()
	if err == nil {
		var bookings []models.Booking
		if err := json.Unmarshal([]byte(cached), &bookings); err == nil {
			return bookings, nil
		}
		log.Printf("Failed to unmarshal cached pending bookings for user %d: %v", userID, err)
	}

	// Query database
	var bookings []models.Booking
	query := `SELECT id, user_id, concert_id, ticket_count, total_price, status, created_at, updated_at 
              FROM bookings WHERE user_id = ? AND status = ?`
	rows, err := s.cfg.DB.QueryContext(ctx, query, userID, "pending")
	if err != nil {
		return nil, fmt.Errorf("failed to fetch pending bookings: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var booking models.Booking
		err = rows.Scan(
			&booking.ID, &booking.UserID, &booking.ConcertID, &booking.TicketCount,
			&booking.TotalPrice, &booking.Status, &booking.CreatedAt, &booking.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan booking row: %v", err)
		}
		bookings = append(bookings, booking)
	}
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over booking rows: %v", err)
	}

	// Cache hasil query
	bookingsJSON, _ := json.Marshal(bookings)
	if err := s.cfg.Redis.Set(ctx, cacheKey, bookingsJSON, 10*time.Minute).Err(); err != nil {
		log.Printf("Failed to cache pending bookings for user %d: %v", userID, err)
	}

	return bookings, nil
}

// CompleteBooking mengubah status booking menjadi "completed" setelah pembayaran berhasil
func (s *BookingService) CompleteBooking(ctx context.Context, id int, userID int) error {
	// Cek cache Redis
	cacheKey := fmt.Sprintf("pending_bookings:%d", userID)
	cached, err := s.cfg.Redis.Get(ctx, cacheKey).Result()
	if err == nil {
		var booking models.Booking
		if err := json.Unmarshal([]byte(cached), &booking); err == nil {
			if booking.UserID == userID && booking.Status == "pending" {
				// Update status di cache
				booking.Status = "completed"
				bookingJSON, _ := json.Marshal(booking)
				if err := s.cfg.Redis.Set(ctx, cacheKey, bookingJSON, 10*time.Minute).Err(); err != nil {
					log.Printf("Failed to update cache for booking %d: %v", id, err)
				}
				return nil
			}
			return fmt.Errorf("booking not found, not owned by user, or not pending")
		}
		log.Printf("Failed to unmarshal cached booking %d: %v", id, err)
	}

	// Query database untuk validasi
	booking := &models.Booking{}
	query := `SELECT id, user_id, concert_id, ticket_count, total_price, status, created_at, updated_at 
              FROM bookings WHERE status = ? AND user_id = ?`
	err = s.cfg.DB.QueryRowContext(ctx, query, "pending", userID).Scan(
		&booking.ID, &booking.UserID, &booking.ConcertID, &booking.TicketCount,
		&booking.TotalPrice, &booking.Status, &booking.CreatedAt, &booking.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return fmt.Errorf("booking not found or not owned by user")
	}
	if err != nil {
		return fmt.Errorf("failed to fetch booking: %v", err)
	}
	if booking.Status != "pending" {
		return fmt.Errorf("booking status is not pending")
	}

	// Update status di database
	updateQuery := `UPDATE bookings SET status = ?, updated_at = ? WHERE  status = ? AND user_id = ?`
	_, err = s.cfg.DB.ExecContext(ctx, updateQuery, "completed", time.Now(), "pending", userID)
	if err != nil {
		return fmt.Errorf("failed to update booking status: %v", err)
	}

	// Update cache
	booking.Status = "completed"
	bookingJSON, _ := json.Marshal(booking)

	// Hapus cache pending
	if err := s.cfg.Redis.Del(ctx, cacheKey).Err(); err != nil {
		log.Printf("Failed to delete cache for pending bookings of user %d: %v", userID, err)
	}

	bookingCacheKey := fmt.Sprintf("booking:%d", id)
	if err := s.cfg.Redis.Set(ctx, bookingCacheKey, bookingJSON, 10*time.Minute).Err(); err != nil {
		log.Printf("Failed to cache updated booking %d: %v", id, err)
	}

	return nil
}
