package controllers

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/payment-service/models"
	"github.com/payment-service/services"
	"github.com/go-playground/validator/v10"
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
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Validasi input
	if err := ctrl.validator.Struct(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	payment, err := ctrl.service.CreatePayment(c.Context(), &req)
	if err != nil {
		log.Printf("Failed to create payment: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(payment)
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
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid payment ID"})
	}

	payment, err := ctrl.service.GetPaymentByID(c.Context(), id)
	if err != nil {
		log.Printf("Failed to fetch payment %d: %v", id, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch payment"})
	}
	if payment == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Payment not found"})
	}

	return c.JSON(payment)
}