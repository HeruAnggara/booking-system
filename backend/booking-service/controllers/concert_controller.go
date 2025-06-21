package controllers

import (
	"context"
	"log"
	"net/http"
	"strconv"

	"github.com/HeruAnggara/booking-system/backend/booking-service/services"
	"github.com/gofiber/fiber/v2"
)

// ConcertController menangani permintaan HTTP untuk concerts
type ConcertController struct {
	service *services.ConcertService
}

// NewConcertController membuat instance baru ConcertController
func NewConcertController(service *services.ConcertService) *ConcertController {
	return &ConcertController{service: service}
}

// GetConcerts menangani GET /api/concerts
// @Summary Get list of concerts
// @Description Retrieve concerts with optional filtering by search term, status, and city
// @Tags Concerts
// @Produce json
// @Param search query string false "Search term (filters title, artist, venue)"
// @Param status query string false "Status filter (on-sale, upcoming, sold-out)"
// @Param city query string false "City filter"
// @Success 200 {array} models.Concert
// @Failure 500 {object} map[string]string
// @Router /concerts [get]
func (ctrl *ConcertController) GetConcerts(c *fiber.Ctx) error {
	searchTerm := c.Query("search", "")
	statusFilter := c.Query("status", "all")
	cityFilter := c.Query("city", "all")

	concerts, err := ctrl.service.GetConcerts(c.Context(), searchTerm, statusFilter, cityFilter)
	if err != nil {
		log.Printf("Failed to fetch concerts: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": 500, "error": "Failed to fetch concerts"})
	}

	return c.JSON(fiber.Map{"status": 200, "concerts": concerts})
}

// GetAvailableCities menangani GET /api/concerts/cities
// @Summary Get list of available cities
// @Description Retrieve unique cities where concerts are held
// @Tags Concerts
// @Produce json
// @Success 200 {array} string
// @Failure 500 {object} map[string]string
// @Router /concerts/cities [get]
func (ctrl *ConcertController) GetAvailableCities(c *fiber.Ctx) error {
	cities, err := ctrl.service.GetAvailableCities(c.Context())
	if err != nil {
		log.Printf("Failed to fetch cities: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": 500, "error": "Failed to fetch cities"})
	}

	return c.JSON(fiber.Map{"status": 200, "cities": cities})
}

func (ctrl *ConcertController) GetConcertByID(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return ctx.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid concert ID"})
	}

	concert, err := ctrl.service.GetConcertByID(context.Background(), id)
	if err != nil {
		if err.Error() == "concert not found" {
			return ctx.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Concert not found"})
		}
		return ctx.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Database error"})
	}

	return ctx.JSON(fiber.Map{
		"concert": concert,
		"status":  http.StatusOK,
	})
}
