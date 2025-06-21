package models

import "time"

// User merepresentasikan struktur data pengguna
type User struct {
	ID          int       `json:"id"`
	Email       string    `json:"email" validate:"required,email"`
	Name        string    `json:"name" validate:"required"`
	Password    string    `json:"password" validate:"required,min=8"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// UserCreateRequest merepresentasikan payload untuk membuat pengguna
type UserCreateRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Name     string `json:"name" validate:"required"`
	Password string `json:"password" validate:"required,min=8"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}