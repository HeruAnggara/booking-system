package controllers

import (
	"log"
	"os"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/HeruAnggara/booking-system/backend/user-service/models"
	"github.com/HeruAnggara/booking-system/backend/user-service/services"
	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v5"
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

// JWTMiddleware memverifikasi JWT token
func JWTMiddleware() fiber.Handler {
    return func(c *fiber.Ctx) error {
        tokenString := c.Get("Authorization")
        if tokenString == "" {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Missing token"})
        }
        // Hapus prefix "Bearer " jika ada
        if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
            tokenString = tokenString[7:]
        }

        token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
            if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
                return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
            }
            return []byte(os.Getenv("JWT_SECRET")), nil
        })

        if err != nil || !token.Valid {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token"})
        }

        // Simpan user_id dari token ke context
        claims := token.Claims.(jwt.MapClaims)
        c.Locals("user_id", int(claims["user_id"].(float64)))
        return c.Next()
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
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": 400, "message": "Invalid request body"})
	}

	// Validasi input
	if err := ctrl.validator.Struct(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": 400, "message": err.Error()})
	}

	_, err := ctrl.service.CreateUser(c.Context(), &req)
	if err != nil {
		log.Printf("Failed to create user: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": 500, "message": "Failed to create user"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"status": 201, "message": "User created successfully"})
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
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": 400, "message": "Invalid user ID"})
	}

	user, err := ctrl.service.GetUserByID(c.Context(), id)
	if err != nil {
		log.Printf("Failed to fetch user %d: %v", id, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": 500, "message": "Failed to fetch user"})
	}
	if user == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": 404, "message": "User not found"})
	}

	return c.JSON(fiber.Map{"status": 200, "message": "User fetched successfully", "data": user})
}

// Login menangani POST /api/login
// @Summary User login
// @Description Authenticate user with email and password, return JWT token
// @Tags Users
// @Accept json
// @Produce json
// @Param login body models.LoginRequest true "Login credentials"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /login [post]
func (ctrl *UserController) Login(c *fiber.Ctx) error {
	var req models.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": 400, "message": "Invalid request body"})
	}

	// Validasi input
	if err := ctrl.validator.Struct(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": 400, "message": err.Error()})
	}

	token, err := ctrl.service.Login(c.Context(), &req)
	if err != nil {
		log.Printf("Failed to login: %v", err)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": 401, "message": "Invalid email or password"})
	}

	return c.JSON(fiber.Map{"status": 200, "message": "Login successful", "token": token})
}

// GetCurrentUser menangani GET /api/users/me
// @Summary Get current user
// @Description Retrieve details of the authenticated user
// @Tags Users
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.User
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /users/me [get]
func (ctrl *UserController) GetCurrentUser(c *fiber.Ctx) error {
    userID, ok := c.Locals("user_id").(int)
    if !ok {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token"})
    }

    user, err := ctrl.service.GetUserByID(c.Context(), userID)
    if err != nil {
        log.Printf("Failed to fetch user %d: %v", userID, err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch user"})
    }
    if user == nil {
        return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
    }

    return c.JSON(user)
}
