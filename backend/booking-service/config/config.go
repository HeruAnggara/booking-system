package config

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/go-sql-driver/mysql"
	"github.com/redis/go-redis/v9"
)

// Config menyimpan koneksi database dan redis
type Config struct {
	DB    *sql.DB
	Redis *redis.Client
}

// LoadConfig menginisialisasi koneksi ke MySQL dan Redis
func LoadConfig() (*Config, error) {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Koneksi ke MySQL
	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")

	db, err := sql.Open("mysql", fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true",
		dbUser, dbPass, dbHost, dbPort, dbName))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to MySQL: %v", err)
	}

	// Test koneksi
	if err := db.Ping(); err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to ping MySQL: %v", err)
	}

	// Koneksi ke Redis
	redisAddr := fmt.Sprintf("%s:%s", os.Getenv("REDIS_HOST"), os.Getenv("REDIS_PORT"))
	rdb := redis.NewClient(&redis.Options{
		Addr: redisAddr,
	})

	// Test koneksi Redis
	_, err = rdb.Ping(context.Background()).Result()
	if err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to connect to Redis: %v", err)
	}

	return &Config{
		DB:    db,
		Redis: rdb,
	}, nil
}

// Close menutup koneksi database dan redis
func (c *Config) Close() {
	if c.DB != nil {
		c.DB.Close()
	}
	if c.Redis != nil {
		c.Redis.Close()
	}
}