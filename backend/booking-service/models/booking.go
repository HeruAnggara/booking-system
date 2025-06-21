package models

import "time"

// Booking merepresentasikan data booking
type Booking struct {
	ID          int       `json:"id"`
	UserID      int       `json:"user_id"`
	ConcertID   int       `json:"concert_id"`
	TicketCount int       `json:"ticket_count"`
	TotalPrice  float64   `json:"total_price"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// BookingCreateRequest merepresentasikan payload untuk membuat booking
type BookingCreateRequest struct {
	UserID      int     `json:"user_id"` // Ditambahkan dari JWT
	ConcertID   int     `json:"concert_id" validate:"required"`
	TicketCount int     `json:"ticket_count" validate:"required,gt=0"`
	TotalPrice  float64 `json:"total_price" validate:"required,gt=0"`
}
