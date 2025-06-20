package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/swagger"
	"github.com/user-service/controllers"
)

// SetupRoutes mengatur rute API
func SetupRoutes(app *fiber.App, bookingCtrl *controllers.BookingController) {
	// Middleware logging
	app.Use(logger.New())

	// Swagger endpoint
	app.Get("/swagger/*", swagger.HandlerDefault)

	// API routes
	api := app.Group("/api")
	api.Post("/bookings", bookingCtrl.CreateBooking)
	api.Get("/bookings/:id", bookingCtrl.GetBookingByID)
}