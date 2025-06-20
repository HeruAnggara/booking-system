package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/swagger"
	"github.com/payment-service/controllers"
)

// SetupRoutes mengatur rute API
func SetupRoutes(app *fiber.App, paymentCtrl *controllers.PaymentController) {
	// Middleware logging
	app.Use(logger.New())

	// Swagger endpoint
	app.Get("/swagger/*", swagger.HandlerDefault)

	// API routes
	api := app.Group("/api")
	api.Post("/payments", paymentCtrl.CreatePayment)
	api.Get("/payments/:id", paymentCtrl.GetPaymentByID)
}