package handler

import (
	"go-crud-api/internal/dto"
	"go-crud-api/internal/middleware"
	"go-crud-api/internal/service"
	"go-crud-api/internal/validator"
	"go-crud-api/pkg/jwt"
	"go-crud-api/pkg/response"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	userService service.UserService
}

func NewUserHandler(userService service.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

func (h *UserHandler) GetMe(c *gin.Context) {
	claimsVal, exists := c.Get(middleware.AuthUserKey)
	if !exists {
		response.Unauthorized(c, "Unauthorized")
		return
	}

	claims := claimsVal.(*jwt.Claims)
	res, err := h.userService.GetByID(c.Request.Context(), claims.UserID)
	if err != nil {
		response.NotFound(c, err.Error())
		return
	}

	response.Success(c, 200, "Profile retrieved successfully", res)
}

func (h *UserHandler) GetAll(c *gin.Context) {
	var param dto.PaginationParam
	if err := c.ShouldBindQuery(&param); err != nil {
		response.BadRequest(c, "Invalid query parameters", err.Error())
		return
	}

	users, meta, err := h.userService.GetAll(c.Request.Context(), param)
	if err != nil {
		response.InternalServerError(c, "Failed to fetch users", err.Error())
		return
	}

	response.SuccessWithMeta(c, 200, "Users retrieved successfully", users, meta)
}

func (h *UserHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	user, err := h.userService.GetByID(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, err.Error())
		return
	}

	response.Success(c, 200, "User retrieved successfully", user)
}

func (h *UserHandler) Update(c *gin.Context) {
	claimsVal, exists := c.Get(middleware.AuthUserKey)
	if !exists {
		response.Unauthorized(c, "Unauthorized")
		return
	}
	claims := claimsVal.(*jwt.Claims)

	id := c.Param("id")
	// User can only update their own profile via this endpoint unless superadmin
	if id != claims.UserID && claims.Role != "superadmin" {
		response.Forbidden(c, "You can only update your own profile")
		return
	}

	var req dto.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	if errs := validator.ValidateStruct(req); errs != nil {
		response.BadRequest(c, "Validation failed", errs)
		return
	}

	user, err := h.userService.Update(c.Request.Context(), id, req)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.Success(c, 200, "User updated successfully", user)
}

func (h *UserHandler) AdminUpdate(c *gin.Context) {
	claimsVal, _ := c.Get(middleware.AuthUserKey)
	claims := claimsVal.(*jwt.Claims)

	id := c.Param("id")
	var req dto.AdminUpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	if errs := validator.ValidateStruct(req); errs != nil {
		response.BadRequest(c, "Validation failed", errs)
		return
	}

	user, err := h.userService.AdminUpdate(c.Request.Context(), id, claims.UserID, claims.Role, req)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.Success(c, 200, "User updated by admin successfully", user)
}

func (h *UserHandler) AdminChangeRole(c *gin.Context) {
	claimsVal, _ := c.Get(middleware.AuthUserKey)
	claims := claimsVal.(*jwt.Claims)

	id := c.Param("id")
	var req dto.AdminChangeRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	if errs := validator.ValidateStruct(req); errs != nil {
		response.BadRequest(c, "Validation failed", errs)
		return
	}

	user, err := h.userService.AdminChangeRole(c.Request.Context(), id, claims.UserID, claims.Role, req.Role)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.Success(c, 200, "User role changed successfully", user)
}

func (h *UserHandler) Delete(c *gin.Context) {
	claimsVal, exists := c.Get(middleware.AuthUserKey)
	if !exists {
		response.Unauthorized(c, "Unauthorized")
		return
	}
	claims := claimsVal.(*jwt.Claims)

	id := c.Param("id")
	if err := h.userService.Delete(c.Request.Context(), id, claims.UserID, claims.Role); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.Success(c, 200, "User deleted successfully", nil)
}
