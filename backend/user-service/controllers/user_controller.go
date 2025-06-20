package controllers

import (
	"context"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/user-service/models"
	"github.com/user-service/services"
	"github.com/go-playground/validator/v10"
)

// UserController menangani permintaan HTTP untuk pengguna
type UserController struct {
	service   *services.UserService
	validator *validator.Validate
}

// NewUserController membuat instance baru UserController
func NewUserController(service *services.UserService) *UserController {
	return &UserController{
		service:   service,
		validator: validator.New(),
	}
}

// CreateUser menangani POST /api/users
// @Summary Create a new user
// @Description Create a new user with email, name, and password
// @Tags Users
// @Accept json
// @Produce json
// @Param user body models.UserCreateRequest true "User data"
// @Success 201 {object} models.User
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /users [post]
func (ctrl *UserController) CreateUser(c *fiber.Ctx) error {
	var req models.UserCreateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Validasi input
	if err := ctrl.validator.Struct(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	user, err := ctrl.service.CreateUser(c.Context(), &req)
	if err != nil {
		log.Printf("Failed to create user: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create user"})
	}

	return c.Status(fiber.StatusCreated).JSON(user)
}

// GetUserByID menangani GET /api/users/:id
// @Summary Get user by ID
// @Description Retrieve user details by ID
// @Tags Users
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {object} models.User
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /users/{id} [get]
func (ctrl *UserController) GetUserByID(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	user, err := ctrl.service.GetUserByID(c.Context(), id)
	if err != nil {
		log.Printf("Failed to fetch user %d: %v", id, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch user"})
	}
	if user == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	return c.JSON(user)
}