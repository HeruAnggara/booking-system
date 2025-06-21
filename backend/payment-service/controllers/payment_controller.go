package controllers

import (
	"fmt"
	"log"
	"os"

	"github.com/HeruAnggara/booking-system/backend/payment-service/models"
	"github.com/HeruAnggara/booking-system/backend/payment-service/services"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// PaymentController menangani permintaan HTTP untuk pembayaran
type PaymentController struct {
	service   *services.PaymentService
	validator *validator.Validate
}

// NewPaymentController membuat instance baru PaymentController
func NewPaymentController(service *services.PaymentService) *PaymentController {
	return &PaymentController{
		service:   service,
		validator: validator.New(),
	}
}

func JWTMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		tokenString := c.Get("Authorization")
		if tokenString == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Missing token"})
		}
		if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
			tokenString = tokenString[7:]
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err != nil || !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token"})
		}

		claims := token.Claims.(jwt.MapClaims)
		c.Locals("user_id", int(claims["user_id"].(float64)))
		return c.Next()
	}
}

// CreatePayment menangani POST /api/payments
// @Summary Create a new payment
// @Description Create a new payment for a booking
// @Tags Payments
// @Accept json
// @Produce json
// @Param payment body models.PaymentCreateRequest true "Payment data"
// @Success 201 {object} models.Payment
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /payments [post]
func (ctrl *PaymentController) CreatePayment(c *fiber.Ctx) error {
	var req models.PaymentCreateRequest
	if err := c.BodyParser(&req); err != nil {
		log.Printf("Body parsing error: %v", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": 400, "message": "Invalid request body"})
	}
	log.Printf("Received request: %+v", req)

	if err := ctrl.validator.Struct(&req); err != nil {
		log.Printf("Validation error: %v", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": 400, "message": err.Error()})
	}

	userID, ok := c.Locals("user_id").(int)
	if !ok {
		log.Printf("Invalid user_id from token")
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": 401, "message": "Unauthorized"})
	}
	req.UserID = userID

	_, err := ctrl.service.CreatePayment(c.Context(), &req)
	if err != nil {
		log.Printf("Failed to create payment: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": 500, "message": "Failed to create payment"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"status": 201, "message": "Payment successfully"})
}

// GetPaymentByID menangani GET /api/payments/:id
// @Summary Get payment by ID
// @Description Retrieve payment details by ID
// @Tags Payments
// @Produce json
// @Param id path int true "Payment ID"
// @Success 200 {object} models.Payment
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /payments/{id} [get]
func (ctrl *PaymentController) GetPaymentByID(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": 400, "message": "Invalid payment ID"})
	}

	userID, ok := c.Locals("user_id").(int)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": 401, "message": "Unauthorized"})
	}

	payment, err := ctrl.service.GetPaymentByID(c.Context(), id, userID)
	if err != nil {
		log.Printf("Failed to fetch payment %d: %v", id, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": 500, "message": "Failed to fetch payment"})
	}
	if payment == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": 404, "message": "Payment not found"})
	}

	return c.JSON(fiber.Map{"status": 200, "message": "Payment successfully", "data": payment})
}
