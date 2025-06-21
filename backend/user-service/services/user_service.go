package services

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"
	"os"

	"github.com/HeruAnggara/booking-system/backend/user-service/config"
	"github.com/HeruAnggara/booking-system/backend/user-service/models"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// UserService menangani logika bisnis untuk pengguna
type UserService struct {
	cfg *config.Config
}

// NewUserService membuat instance baru UserService
func NewUserService(cfg *config.Config) *UserService {
	return &UserService{cfg: cfg}
}

// CreateUser membuat pengguna baru
func (s *UserService) CreateUser(ctx context.Context, req *models.UserCreateRequest) (*models.User, error) {
	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %v", err)
	}

	// Insert user ke database
	query := `INSERT INTO users (email, name, password_hash, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?)`
	result, err := s.cfg.DB.ExecContext(ctx, query, req.Email, req.Name, hashedPassword, time.Now(), time.Now())
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %v", err)
	}

	userID, err := result.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("failed to get last insert ID: %v", err)
	}

	user := &models.User{
		ID:           int(userID),
		Email:        req.Email,
		Name:         req.Name,
		Password: string(hashedPassword),
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	// Cache user di Redis
	cacheKey := fmt.Sprintf("user:%d", userID)
	userJSON, _ := json.Marshal(user)
	if err := s.cfg.Redis.Set(ctx, cacheKey, userJSON, 10*time.Minute).Err(); err != nil {
		log.Printf("Failed to cache user %d: %v", userID, err)
	}

	return user, nil
}

// GetUserByID mengambil pengguna berdasarkan ID
func (s *UserService) GetUserByID(ctx context.Context, id int) (*models.User, error) {
	// Cek cache Redis
	cacheKey := fmt.Sprintf("user:%d", id)
	cached, err := s.cfg.Redis.Get(ctx, cacheKey).Result()
	if err == nil {
		var user models.User
		if err := json.Unmarshal([]byte(cached), &user); err == nil {
			return &user, nil
		}
		log.Printf("Failed to unmarshal cached user %d: %v", id, err)
	}

	// Query database jika tidak ada di cache
	user := &models.User{}
	query := `SELECT id, email, name, password_hash, created_at, updated_at 
              FROM users WHERE id = ?`
	err = s.cfg.DB.QueryRowContext(ctx, query, id).Scan(
		&user.ID, &user.Email, &user.Name, &user.Password,
		&user.CreatedAt, &user.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to fetch user: %v", err)
	}

	// Cache hasil query
	userJSON, _ := json.Marshal(user)
	if err := s.cfg.Redis.Set(ctx, cacheKey, userJSON, 10*time.Minute).Err(); err != nil {
		log.Printf("Failed to cache user %d: %v", id, err)
	}

	return user, nil
}

// Login memverifikasi kredensial pengguna dan menghasilkan JWT token
func (s *UserService) Login(ctx context.Context, req *models.LoginRequest) (string, error) {
	// Cari pengguna berdasarkan email
	var user models.User
	query := `SELECT id, email, name, password_hash 
              FROM users WHERE email = ?`
	err := s.cfg.DB.QueryRowContext(ctx, query, req.Email).Scan(
		&user.ID, &user.Email, &user.Name, &user.Password,
	)
	if err == sql.ErrNoRows {
		return "", fmt.Errorf("invalid email or password")
	}
	if err != nil {
		return "", fmt.Errorf("failed to fetch user: %v", err)
	}

	// Verifikasi kata sandi
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return "", fmt.Errorf("invalid email or password")
	}

	// Buat JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"name":    user.Name,
		"exp":     time.Now().Add(time.Hour * 24).Unix(), // Token berlaku 24 jam
	})

	// Tanda tangani token dengan secret key
	secretKey := []byte(os.Getenv("JWT_SECRET")) // Ganti dengan secret key dari env
	tokenString, err := token.SignedString(secretKey)
	if err != nil {
		return "", fmt.Errorf("failed to generate token: %v", err)
	}

	return tokenString, nil
}