package routes

import (
	"github.com/HeruAnggara/booking-system/backend/booking-service/controllers"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/swagger"
)

// SetupRoutes mengatur rute API
func SetupRoutes(app *fiber.App, bookingCtrl *controllers.BookingController, concertCtrl *controllers.ConcertController) {
	// Middleware logging
	app.Use(logger.New())

	// Swagger endpoint
	app.Get("/swagger/*", swagger.HandlerDefault)

	// API routes
	api := app.Group("/api")

	concerts := api.Group("/concerts")
	concerts.Get("/", concertCtrl.GetConcerts)
	concerts.Get("/cities", concertCtrl.GetAvailableCities)
	concerts.Get("/:id", concertCtrl.GetConcertByID)

	// Booking routes (also protected)
	bookings := api.Group("/bookings")
	bookings.Use(controllers.JWTMiddleware())
	bookings.Post("/", bookingCtrl.CreateBooking)
	bookings.Get("/:id", bookingCtrl.GetBookingByID)
	bookings.Delete("/:id", bookingCtrl.DeleteBooking)
}
