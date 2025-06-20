package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/payment-service/config"
	"github.com/payment-service/controllers"
	"github.com/payment-service/routes"
	"github.com/payment-service/services"
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

	// Inisialisasi Fiber
	app := fiber.New()

	// Inisialisasi layanan dan controller
	paymentService := services.NewPaymentService(cfg)
	paymentController := controllers.NewPaymentController(paymentService)

	// Setup routes
	routes.SetupRoutes(app, paymentController)

	// Jalankan server
	log.Fatal(app.Listen(":8083"))
}