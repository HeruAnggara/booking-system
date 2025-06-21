package controllers

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/HeruAnggara/booking-system/backend/booking-service/models"
	"github.com/HeruAnggara/booking-system/backend/booking-service/services"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
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

func JWTMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Missing Authorization header"})
		}

		var tokenString string
		if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
			tokenString = authHeader[7:]
		} else {
			tokenString = authHeader
		}

		secret := os.Getenv("JWT_SECRET")
		if secret == "" {
			log.Fatal("JWT_SECRET environment variable not set")
		}
		log.Printf("Using JWT_SECRET: %s", secret) // Debug log

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(secret), nil
		})

		if err != nil {
			log.Printf("Token parsing error for token %s: %v", tokenString[:10]+"...", err) // Log partial token for safety
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token: " + err.Error()})
		}

		if !token.Valid {
			log.Printf("Token invalid for token %s: %v", tokenString[:10]+"...", err)
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token"})
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token claims"})
		}

		userIDFloat, ok := claims["user_id"].(float64)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "User ID not found in token"})
		}

		c.Locals("user_id", int(userIDFloat))
		return c.Next()
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
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": 400, "message": "Invalid request body"})
	}

	// Validasi input
	if err := ctrl.validator.Struct(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": 400, "message": err.Error()})
	}

	userID, ok := c.Locals("user_id").(int)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token"})
	}

	req.UserID = userID

	_, err := ctrl.service.CreateBooking(c.Context(), &req)
	if err != nil {
		log.Printf("Failed to create booking: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": 500, "message": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"status": 201, "message": "Booking created successfully"})
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
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": 400, "message": "Invalid booking ID"})
	}

	userID, ok := c.Locals("user_id").(int)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token"})
	}

	booking, err := ctrl.service.GetBookingByID(c.Context(), id, userID)
	if err != nil {
		log.Printf("Failed to fetch booking %d: %v", id, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": 500, "message": "Failed to fetch booking"})
	}
	if booking == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": 404, "message": "Booking not found"})
	}

	return c.JSON(fiber.Map{"status": 200, "message": "Booking fetched successfully", "data": booking})
}

func (c *BookingController) DeleteBooking(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return ctx.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid booking ID"})
	}

	// Extract userID from JWT (example, implement actual JWT parsing)
	userID := 1 // Replace with actual user ID from token

	err = c.service.DeleteBooking(context.Background(), id, userID)
	if err != nil {
		return ctx.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return ctx.SendStatus(http.StatusNoContent)
}
