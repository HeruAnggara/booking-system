package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/user-service/config"
	"github.com/user-service/controllers"
	"github.com/user-service/routes"
	"github.com/user-service/services"
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

	// Inisialisasi Fiber
	app := fiber.New()

	// Inisialisasi layanan dan controller
	userService := services.NewUserService(cfg)
	userController := controllers.NewUserController(userService)

	// Setup routes
	routes.SetupRoutes(app, userController)

	// Jalankan server
	log.Fatal(app.Listen(":8081"))
}