package services

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/payment-service/config"
	"github.com/payment-service/models"
)

// PaymentService menangani logika bisnis untuk pembayaran
type PaymentService struct {
	cfg *config.Config
}

// NewPaymentService membuat instance baru PaymentService
func NewPaymentService(cfg *config.Config) *PaymentService {
	return &PaymentService{cfg: cfg}
}

// CreatePayment membuat pembayaran baru
func (s *PaymentService) CreatePayment(ctx context.Context, req *models.PaymentCreateRequest) (*models.Payment, error) {
	// Validasi booking_id
	var bookingExists bool
	err := s.cfg.DB.QueryRowContext(ctx, "SELECT EXISTS (SELECT 1 FROM bookings WHERE id = ?)", req.BookingID).
		Scan(&bookingExists)
	if err != nil {
		return nil, fmt.Errorf("failed to check booking: %v", err)
	}
	if !bookingExists {
		return nil, fmt.Errorf("booking not found")
	}

	// Mulai transaksi
	tx, err := s.cfg.DB.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to start transaction: %v", err)
	}
	defer tx.Rollback()

	// Insert pembayaran
	query := `INSERT INTO payments (booking_id, amount, status, payment_method, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?)`
	result, err := tx.ExecContext(ctx, query, req.BookingID, req.Amount, "pending", req.PaymentMethod, time.Now(), time.Now())
	if err != nil {
		return nil, fmt.Errorf("failed to create payment: %v", err)
	}

	paymentID, err := result.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("failed to get last insert ID: %v", err)
	}

	// Update status booking (contoh: set ke confirmed)
	updateQuery := `UPDATE bookings SET status = ? WHERE id = ?`
	_, err = tx.ExecContext(ctx, updateQuery, "confirmed", req.BookingID)
	if err != nil {
		return nil, fmt.Errorf("failed to update booking status: %v", err)
	}

	// Commit transaksi
	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %v", err)
	}

	payment := &models.Payment{
		ID:            int(paymentID),
		BookingID:     req.BookingID,
		Amount:        req.Amount,
		Status:        "pending",
		PaymentMethod: req.PaymentMethod,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	// Cache pembayaran di Redis
	cacheKey := fmt.Sprintf("payment:%d", paymentID)
	paymentJSON, _ := json.Marshal(payment)
	if err := s.cfg.Redis.Set(ctx, cacheKey, paymentJSON, 10*time.Minute).Err(); err != nil {
		log.Printf("Failed to cache payment %d: %v", paymentID, err)
	}

	return payment, nil
}

// GetPaymentByID mengambil pembayaran berdasarkan ID
func (s *PaymentService) GetPaymentByID(ctx context.Context, id int) (*models.Payment, error) {
	// Cek cache Redis
	cacheKey := fmt.Sprintf("payment:%d", id)
	cached, err := s.cfg.Redis.Get(ctx, cacheKey).Result()
	if err == nil {
		var payment models.Payment
		if err := json.Unmarshal([]byte(cached), &payment); err == nil {
			return &payment, nil
		}
		log.Printf("Failed to unmarshal cached payment %d: %v", id, err)
	}

	// Query database jika tidak ada di cache
	payment := &models.Payment{}
	query := `SELECT id, booking_id, amount, status, payment_method, created_at, updated_at 
              FROM payments WHERE id = ?`
	err = s.cfg.DB.QueryRowContext(ctx, query, id).Scan(
		&payment.ID, &payment.BookingID, &payment.Amount, &payment.Status,
		&payment.PaymentMethod, &payment.CreatedAt, &payment.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to fetch payment: %v", err)
	}

	// Cache hasil query
	paymentJSON, _ := json.Marshal(payment)
	if err := s.cfg.Redis.Set(ctx, cacheKey, paymentJSON, 10*time.Minute).Err(); err != nil {
		log.Printf("Failed to cache payment %d: %v", id, err)
	}

	return payment, nil
}