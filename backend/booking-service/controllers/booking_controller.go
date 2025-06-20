package controllers

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/user-service/models"
	"github.com/user-service/services"
	"github.com/go-playground/validator/v10"
)

// BookingController menangani permintaan HTTP untuk pemesanan
type BookingController struct {
	service   *services.BookingService
	validator *validator.Validate
}

// NewBookingController membuat instance baru BookingController
func NewBookingController(service *services.BookingService) *BookingController {
	return &BookingController{
		service:   service,
		validator: validator.New(),
	}
}

// CreateBooking menangani POST /api/bookings
// @Summary Create a new booking
// @Description Create a new booking for a concert
// @Tags Bookings
// @Accept json
// @Produce json
// @Param booking body models.BookingCreateRequest true "Booking data"
// @Success 201 {object} models.Booking
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /bookings [post]
func (ctrl *BookingController) CreateBooking(c *fiber.Ctx) error {
	var req models.BookingCreateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Validasi input
	if err := ctrl.validator.Struct(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	booking, err := ctrl.service.CreateBooking(c.Context(), &req)
	if err != nil {
		log.Printf("Failed to create booking: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(booking)
}

// GetBookingByID menangani GET /api/bookings/:id
// @Summary Get booking by ID
// @Description Retrieve booking details by ID
// @Tags Bookings
// @Produce json
// @Param id path int true "Booking ID"
// @Success 200 {object} models.Booking
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /bookings/{id} [get]
func (ctrl *BookingController) GetBookingByID(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid booking ID"})
	}

	booking, err := ctrl.service.GetBookingByID(c.Context(), id)
	if err != nil {
		log.Printf("Failed to fetch booking %d: %v", id, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch booking"})
	}
	if booking == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Booking not found"})
	}

	return c.JSON(booking)
}