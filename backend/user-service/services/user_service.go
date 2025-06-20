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

	// Insert ke database
	query := `INSERT INTO users (email, name, password_hash, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?)`
	result, err := s.cfg.DB.ExecContext(ctx, query, req.Email, req.Name, hashedPassword, time.Now(), time.Now())
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %v", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("failed to get last insert ID: %v", err)
	}

	user := &models.User{
		ID:        int(id),
		Email:     req.Email,
		Name:      req.Name,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Cache pengguna di Redis
	cacheKey := fmt.Sprintf("user:%d", id)
	userJSON, _ := json.Marshal(user)
	if err := s.cfg.Redis.Set(ctx, cacheKey, userJSON, 10*time.Minute).Err(); err != nil {
		log.Printf("Failed to cache user %d: %v", id, err)
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
	query := `SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?`
	err = s.cfg.DB.QueryRowContext(ctx, query, id).Scan(
		&user.ID, &user.Email, &user.Name, &user.CreatedAt, &user.UpdatedAt,
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