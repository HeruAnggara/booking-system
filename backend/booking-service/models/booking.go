package models

import "time"

// Concert merepresentasikan data konser
type Concert struct {
	ID             int       `json:"id"`
	Name           string    `json:"name" validate:"required"`
	Venue          string    `json:"venue" validate:"required"`
	Date           time.Time `json:"date" validate:"required"`
	TotalSeats     int       `json:"total_seats" validate:"required,gte=0"`
	AvailableSeats int       `json:"available_seats" validate:"required,gte=0"`
	CreatedAt      time.Time `json:"created_at"`
}

// Booking merepresentasikan data pemesanan
type Booking struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id" validate:"required"`
	ConcertID int       `json:"concert_id" validate:"required"`
	Seats     int       `json:"seats" validate:"required,gt=0"`
	Status    string    `json:"status" validate:"required,oneof=pending confirmed cancelled"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// BookingCreateRequest merepresentasikan payload untuk membuat pemesanan
type BookingCreateRequest struct {
	UserID    int `json:"user_id" validate:"required"`
	ConcertID int `json:"concert_id" validate:"required"`
	Seats     int `json:"seats" validate:"required,gt=0"`
}