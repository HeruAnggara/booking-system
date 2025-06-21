package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/HeruAnggara/booking-system/backend/booking-service/config"
	"github.com/HeruAnggara/booking-system/backend/booking-service/controllers"
	"github.com/HeruAnggara/booking-system/backend/booking-service/routes"
	"github.com/HeruAnggara/booking-system/backend/booking-service/services"
	"github.com/gofiber/fiber/v2/middleware/cors"
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

	// Set JWT secret dari environment variable
    if os.Getenv("JWT_SECRET") == "" {
        log.Fatal("JWT_SECRET environment variable is not set")
    }

	// Inisialisasi Fiber
	app := fiber.New()

	app.Use(cors.New(cors.Config{
        AllowOrigins: "http://localhost:5173", // Ganti dengan origin frontend Anda
        AllowHeaders: "Origin, Content-Type, Accept, Authorization",
        AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
    }))

	// Inisialisasi layanan dan controller
	bookingService := services.NewBookingService(cfg)
    concertService := services.NewConcertService(cfg)
    bookingController := controllers.NewBookingController(bookingService)
    concertController := controllers.NewConcertController(concertService)

	// Setup routes
	routes.SetupRoutes(app, bookingController, concertController)

	// Jalankan server
	log.Fatal(app.Listen(":8082"))
}