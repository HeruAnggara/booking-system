package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/user-service/config"
	"github.com/user-service/controllers"
	"github.com/user-service/routes"
	"github.com/user-service/services"
)

// @title Booking Service API
// @version 1.0
// @description API for managing bookings in Concert Ticket Booking System
// @host localhost:8082
// @BasePath /api
func main() {
	// Inisialisasi konfigurasi
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatal(err)
	}
	defer cfg.Close()

	// Inisialisasi Fiber
	app := fiber.New()

	// Inisialisasi layanan dan controller
	bookingService := services.NewBookingService(cfg)
	bookingController := controllers.NewBookingController(bookingService)

	// Setup routes
	routes.SetupRoutes(app, bookingController)

	// Jalankan server
	log.Fatal(app.Listen(":8082"))
}