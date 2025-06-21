package models

import "time"

// Concert merepresentasikan data konser
type Concert struct {
	ID             int          `json:"id"`
	Name           string       `json:"name" validate:"required"`
	Artist         string       `json:"artist" validate:"required"`
	Venue          string       `json:"venue" validate:"required"`
	City           string       `json:"city" validate:"required"`
	Date           time.Time    `json:"date" validate:"required"`
	Time           string       `json:"time" validate:"required"`
	TotalSeats     int          `json:"total_seats" validate:"required,gte=0"`
	AvailableSeats int          `json:"available_seats" validate:"required,gte=0"`
	Status         string       `json:"status" validate:"required,oneof=on-sale upcoming sold-out"`
	Image          string       `json:"image_url" validate:"required"`
	Description    string       `json:"description" validate:"required"`
	TicketTypes    []TicketType `json:"ticketTypes" validate:"required"`
	CreatedAt      time.Time    `json:"created_at"`
}

// TicketType merepresentasikan jenis tiket untuk sebuah konser
type TicketType struct {
	ID             int     `json:"id"`
	ConcertID      int     `json:"concert_id"`
	Type           string  `json:"type" validate:"required"`
	Price          float64 `json:"price" validate:"required,gt=0"`
	TotalSeats     int     `json:"total_seats" validate:"required,gte=0"`
	AvailableSeats int     `json:"available_seats" validate:"required,gte=0"`
}
