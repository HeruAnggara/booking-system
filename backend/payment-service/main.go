package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/HeruAnggara/booking-system/backend/payment-service/config"
	"github.com/HeruAnggara/booking-system/backend/payment-service/controllers"
	"github.com/HeruAnggara/booking-system/backend/payment-service/routes"
	"github.com/HeruAnggara/booking-system/backend/payment-service/services"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

// @title Payment Service API
// @version 1.0
// @description API for managing payments in Concert Ticket Booking System
// @host localhost:8083
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
        AllowOrigins: "http://localhost:5173",
        AllowHeaders: "Origin, Content-Type, Accept, Authorization",
        AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
    }))

	// Inisialisasi layanan dan controller
	paymentService := services.NewPaymentService(cfg)
	paymentController := controllers.NewPaymentController(paymentService)

	// Setup routes
	routes.SetupRoutes(app, paymentController)

	// Jalankan server
	log.Fatal(app.Listen(":8083"))
}