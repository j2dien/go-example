package handler

import (
	"go-crud-api/internal/dto"
	"go-crud-api/internal/service"
	"go-crud-api/internal/validator"
	"go-crud-api/pkg/response"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService service.AuthService
}

func NewAuthHandler(authService service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req dto.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	if errs := validator.ValidateStruct(req); errs != nil {
		response.BadRequest(c, "Validation failed", errs)
		return
	}

	res, err := h.authService.Register(c.Request.Context(), req)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.Success(c, 201, "User registered successfully", res)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	if errs := validator.ValidateStruct(req); errs != nil {
		response.BadRequest(c, "Validation failed", errs)
		return
	}

	res, err := h.authService.Login(c.Request.Context(), req)
	if err != nil {
		response.Unauthorized(c, err.Error())
		return
	}

	response.Success(c, 200, "Login successful", res)
}

func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req dto.RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	if errs := validator.ValidateStruct(req); errs != nil {
		response.BadRequest(c, "Validation failed", errs)
		return
	}

	res, err := h.authService.RefreshToken(c.Request.Context(), req.RefreshToken)
	if err != nil {
		response.Unauthorized(c, err.Error())
		return
	}

	response.Success(c, 200, "Token refreshed successfully", res)
}
