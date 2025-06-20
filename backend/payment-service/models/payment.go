package models

import "time"

// Payment merepresentasikan data pembayaran
type Payment struct {
	ID            int       `json:"id"`
	BookingID     int       `json:"booking_id" validate:"required"`
	Amount        float64   `json:"amount" validate:"required,gt=0"`
	Status        string    `json:"status" validate:"required,oneof=pending completed failed"`
	PaymentMethod string    `json:"payment_method" validate:"required,oneof=credit_card bank_transfer e_wallet"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// PaymentCreateRequest merepresentasikan payload untuk membuat pembayaran
type PaymentCreateRequest struct {
	BookingID     int     `json:"booking_id" validate:"required"`
	Amount        float64 `json:"amount" validate:"required,gt=0"`
	PaymentMethod string  `json:"payment_method" validate:"required,oneof=credit_card bank_transfer e_wallet"`
}