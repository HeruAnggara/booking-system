package main

import (
	"log"
	"os"

	"github.com/HeruAnggara/booking-system/backend/user-service/config"
	"github.com/HeruAnggara/booking-system/backend/user-service/controllers"
	"github.com/HeruAnggara/booking-system/backend/user-service/services"
	"github.com/HeruAnggara/booking-system/backend/user-service/routes"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

// @title User Service API
// @version 1.0
// @description API for managing users in Concert Ticket Booking System
// @host localhost:8081
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
	userService := services.NewUserService(cfg)
	userController := controllers.NewUserController(userService)

	// Setup routes
	routes.SetupRoutes(app, userController)

	// Jalankan server
	log.Fatal(app.Listen(":8081"))
}