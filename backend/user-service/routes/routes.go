package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/swagger"
	"github.com/HeruAnggara/booking-system/backend/user-service/controllers"
)

// SetupRoutes mengatur rute API
func SetupRoutes(app *fiber.App, userCtrl *controllers.UserController) {
	// Middleware logging
	app.Use(logger.New())

	// Swagger endpoint
	app.Get("/swagger/*", swagger.HandlerDefault)

	// API routes
	api := app.Group("/api")
	api.Post("/users", userCtrl.CreateUser)
	// api.Get("/users/:id", controllers.JWTMiddleware(), userCtrl.GetUserByID)
	api.Post("/login", userCtrl.Login)
	api.Get("/users/me", controllers.JWTMiddleware(), userCtrl.GetCurrentUser)
}