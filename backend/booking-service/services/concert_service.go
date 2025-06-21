package services

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/HeruAnggara/booking-system/backend/booking-service/config"
	"github.com/HeruAnggara/booking-system/backend/booking-service/models"
)

// ConcertService menangani logika bisnis untuk concerts
type ConcertService struct {
	cfg *config.Config
}

// NewConcertService membuat instance baru ConcertService
func NewConcertService(cfg *config.Config) *ConcertService {
	return &ConcertService{cfg: cfg}
}

// GetConcerts mengambil daftar konser dengan filter
func (s *ConcertService) GetConcerts(ctx context.Context, searchTerm, statusFilter, cityFilter string) ([]models.Concert, error) {
	// Cek cache Redis
	cacheKey := fmt.Sprintf("concerts:%s:%s:%s", searchTerm, statusFilter, cityFilter)
	cached, err := s.cfg.Redis.Get(ctx, cacheKey).Result()
	if err == nil {
		var concerts []models.Concert
		if err := json.Unmarshal([]byte(cached), &concerts); err == nil {
			return concerts, nil
		}
		log.Printf("Failed to unmarshal cached concerts: %v", err)
	}

	// Query concerts
	query := `
        SELECT id, name, artist, venue, city, date, total_seats, available_seats, created_at, image_url, description
        FROM concerts
        WHERE 1=1`
	args := []interface{}{}

	// Filter search term
	if searchTerm != "" {
		searchTerm = "%" + strings.ToLower(searchTerm) + "%"
		query += " AND (LOWER(name) LIKE ? OR LOWER(artist) LIKE ? OR LOWER(venue) LIKE ?)"
		args = append(args, searchTerm, searchTerm, searchTerm)
	}

	// Filter city
	if cityFilter != "" && cityFilter != "all" {
		query += " AND city = ?"
		args = append(args, cityFilter)
	}

	rows, err := s.cfg.DB.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch concerts: %v", err)
	}
	defer rows.Close()

	var concerts []models.Concert
	currentDate := time.Now()

	for rows.Next() {
		var c models.Concert
		var date time.Time
		err := rows.Scan(
			&c.ID, &c.Name, &c.Artist, &c.Venue, &c.City, &date, &c.TotalSeats,
			&c.AvailableSeats, &c.CreatedAt, &c.Image, &c.Description,
		)
		if err != nil {
			log.Printf("Failed to scan concert: %v", err)
			continue
		}

		// Set Date and Time
		c.Date = date

		// Determine Status
		if c.AvailableSeats == 0 {
			c.Status = "sold-out"
		} else if date.After(currentDate) && date.Sub(currentDate).Hours() > 24*7 { // More than 7 days away
			c.Status = "upcoming"
		} else {
			c.Status = "on-sale"
		}

		// Filter by status
		if statusFilter != "" && statusFilter != "all" && c.Status != statusFilter {
			continue
		}

		// Fetch ticket types
		ticketRows, err := s.cfg.DB.QueryContext(ctx, `
            SELECT id, concert_id, type, price, total_seats, available_seats
            FROM ticket_types
            WHERE concert_id = ?`, c.ID)
		if err != nil {
			log.Printf("Failed to fetch ticket types for concert %d: %v", c.ID, err)
			continue
		}
		defer ticketRows.Close()

		for ticketRows.Next() {
			var t models.TicketType
			err := ticketRows.Scan(&t.ID, &t.ConcertID, &t.Type, &t.Price, &t.TotalSeats, &t.AvailableSeats)
			if err != nil {
				log.Printf("Failed to scan ticket type: %v", err)
				continue
			}
			c.TicketTypes = append(c.TicketTypes, t)
		}

		concerts = append(concerts, c)
	}

	// Cache hasil query
	concertJSON, _ := json.Marshal(concerts)
	if err := s.cfg.Redis.Set(ctx, cacheKey, concertJSON, 10*time.Minute).Err(); err != nil {
		log.Printf("Failed to cache concerts: %v", err)
	}

	return concerts, nil
}

// GetAvailableCities mengambil daftar kota yang tersedia
func (s *ConcertService) GetAvailableCities(ctx context.Context) ([]string, error) {
	// Cek cache Redis
	cacheKey := "available_cities"
	cached, err := s.cfg.Redis.Get(ctx, cacheKey).Result()
	if err == nil {
		var cities []string
		if err := json.Unmarshal([]byte(cached), &cities); err == nil {
			return cities, nil
		}
		log.Printf("Failed to unmarshal cached cities: %v", err)
	}

	// Query cities
	rows, err := s.cfg.DB.QueryContext(ctx, "SELECT DISTINCT city FROM concerts ORDER BY city")
	if err != nil {
		return nil, fmt.Errorf("failed to fetch cities: %v", err)
	}
	defer rows.Close()

	var cities []string
	for rows.Next() {
		var city string
		if err := rows.Scan(&city); err != nil {
			log.Printf("Failed to scan city: %v", err)
			continue
		}
		cities = append(cities, city)
	}

	// Cache hasil query
	citiesJSON, _ := json.Marshal(cities)
	if err := s.cfg.Redis.Set(ctx, cacheKey, citiesJSON, 24*time.Hour).Err(); err != nil {
		log.Printf("Failed to cache cities: %v", err)
	}

	return cities, nil
}

func (s *ConcertService) GetConcertByID(ctx context.Context, id int) (*models.Concert, error) {
	// Cache key for this specific concert
	cacheKey := fmt.Sprintf("concert:%d", id)
	cached, err := s.cfg.Redis.Get(ctx, cacheKey).Result()
	if err == nil {
		var concert models.Concert
		if err := json.Unmarshal([]byte(cached), &concert); err == nil {
			return &concert, nil
		}
		log.Printf("Failed to unmarshal cached concert: %v", err)
	}

	// Query concert
	concert := &models.Concert{}
	query := `
		SELECT id, name, artist, venue, city, date, total_seats, available_seats, created_at, image_url, description
		FROM concerts
		WHERE id = ?
	`
	err = s.cfg.DB.QueryRowContext(ctx, query, id).Scan(
		&concert.ID,
		&concert.Name,
		&concert.Artist,
		&concert.Venue,
		&concert.City,
		&concert.Date,
		&concert.TotalSeats,
		&concert.AvailableSeats,
		&concert.CreatedAt,
		&concert.Image,
		&concert.Description,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("concert not found")
		}
		return nil, fmt.Errorf("failed to fetch concert: %v", err)
	}

	// Determine status based on available seats and date
	currentDate := time.Now()
	if concert.AvailableSeats == 0 {
		concert.Status = "sold-out"
	} else if concert.Date.After(currentDate) && concert.Date.Sub(currentDate).Hours() > 24*7 {
		concert.Status = "upcoming"
	} else {
		concert.Status = "on-sale"
	}

	// Fetch ticket types
	ticketQuery := `
		SELECT id, concert_id, type, price, total_seats, available_seats
		FROM ticket_types
		WHERE concert_id = ?
	`
	rows, err := s.cfg.DB.QueryContext(ctx, ticketQuery, id)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch ticket types: %v", err)
	}
	defer rows.Close()

	var ticketTypes []models.TicketType
	for rows.Next() {
		var ticket models.TicketType
		err = rows.Scan(&ticket.ID, &ticket.ConcertID, &ticket.Type, &ticket.Price, &ticket.TotalSeats, &ticket.AvailableSeats)
		if err != nil {
			return nil, fmt.Errorf("failed to scan ticket type: %v", err)
		}
		ticketTypes = append(ticketTypes, ticket)
	}
	concert.TicketTypes = ticketTypes

	// Cache the result
	concertJSON, err := json.Marshal(concert)
	if err == nil {
		if err := s.cfg.Redis.Set(ctx, cacheKey, concertJSON, 10*time.Minute).Err(); err != nil {
			log.Printf("Failed to cache concert: %v", err)
		}
	}

	return concert, nil
}
