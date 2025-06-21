package services

import (
    "context"
    "database/sql"
    "encoding/json"
    "fmt"
    "log"
    "time"

    "github.com/HeruAnggara/booking-system/backend/payment-service/config"
    "github.com/HeruAnggara/booking-system/backend/payment-service/models"
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
    query := `INSERT INTO payments (user_id, booking_id, amount, status, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?)`
    result, err := s.cfg.DB.ExecContext(ctx, query, req.UserID, req.BookingID, req.Amount, "pending", time.Now(), time.Now())
    if err != nil {
        return nil, fmt.Errorf("failed to create payment: %v", err)
    }

    paymentID, err := result.LastInsertId()
    if err != nil {
        return nil, fmt.Errorf("failed to get last insert ID: %v", err)
    }

    payment := &models.Payment{
        ID:            int(paymentID),
        UserID:        req.UserID,
        BookingID:     req.BookingID,
        Amount:        req.Amount,
        Status:        "pending",
        PaymentMethod: "credit_card",
        CreatedAt:     time.Now(),
        UpdatedAt:     time.Now(),
    }

    cacheKey := fmt.Sprintf("payment:%d", paymentID)
    paymentJSON, _ := json.Marshal(payment)
    if err := s.cfg.Redis.Set(ctx, cacheKey, paymentJSON, 10*time.Minute).Err(); err != nil {
        log.Printf("Failed to cache payment %d: %v", paymentID, err)
    }

    return payment, nil
}

// GetPaymentByID mengambil pembayaran berdasarkan ID
func (s *PaymentService) GetPaymentByID(ctx context.Context, id int, userID int) (*models.Payment, error) {
    cacheKey := fmt.Sprintf("payment:%d", id)
    cached, err := s.cfg.Redis.Get(ctx, cacheKey).Result()
    if err == nil {
        var payment models.Payment
        if err := json.Unmarshal([]byte(cached), &payment); err == nil {
            if payment.UserID == userID {
                return &payment, nil
            }
            return nil, nil
        }
        log.Printf("Failed to unmarshal cached payment %d: %v", id, err)
    }

    payment := &models.Payment{}
    query := `SELECT id, user_id, booking_id, amount, status, created_at, updated_at 
              FROM payments WHERE id = ? AND user_id = ?`
    err = s.cfg.DB.QueryRowContext(ctx, query, id, userID).Scan(
        &payment.ID, &payment.UserID, &payment.BookingID, &payment.Amount,
        &payment.Status, &payment.CreatedAt, &payment.UpdatedAt,
    )
    if err == sql.ErrNoRows {
        return nil, nil
    }
    if err != nil {
        return nil, fmt.Errorf("failed to fetch payment: %v", err)
    }

    paymentJSON, _ := json.Marshal(payment)
    if err := s.cfg.Redis.Set(ctx, cacheKey, paymentJSON, 10*time.Minute).Err(); err != nil {
        log.Printf("Failed to cache payment %d: %v", id, err)
    }

    return payment, nil
}