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

type PostHandler struct {
	postService service.PostService
}

func NewPostHandler(postService service.PostService) *PostHandler {
	return &PostHandler{postService: postService}
}

func (h *PostHandler) Create(c *gin.Context) {
	claimsVal, _ := c.Get(middleware.AuthUserKey)
	claims := claimsVal.(*jwt.Claims)

	var req dto.CreatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	if errs := validator.ValidateStruct(req); errs != nil {
		response.BadRequest(c, "Validation failed", errs)
		return
	}

	post, err := h.postService.Create(c.Request.Context(), claims.UserID, req)
	if err != nil {
		response.InternalServerError(c, "Failed to create post", err.Error())
		return
	}

	response.Success(c, 201, "Post created successfully", post)
}

func (h *PostHandler) GetAll(c *gin.Context) {
	var param dto.PaginationParam
	if err := c.ShouldBindQuery(&param); err != nil {
		response.BadRequest(c, "Invalid query parameters", err.Error())
		return
	}

	posts, meta, err := h.postService.GetAll(c.Request.Context(), param)
	if err != nil {
		response.InternalServerError(c, "Failed to fetch posts", err.Error())
		return
	}

	response.SuccessWithMeta(c, 200, "Posts retrieved successfully", posts, meta)
}

func (h *PostHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	post, err := h.postService.GetByID(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, err.Error())
		return
	}

	response.Success(c, 200, "Post retrieved successfully", post)
}

func (h *PostHandler) Update(c *gin.Context) {
	claimsVal, _ := c.Get(middleware.AuthUserKey)
	claims := claimsVal.(*jwt.Claims)

	id := c.Param("id")
	var req dto.UpdatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	if errs := validator.ValidateStruct(req); errs != nil {
		response.BadRequest(c, "Validation failed", errs)
		return
	}

	post, err := h.postService.Update(c.Request.Context(), id, claims.UserID, claims.Role, req)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.Success(c, 200, "Post updated successfully", post)
}

func (h *PostHandler) Delete(c *gin.Context) {
	claimsVal, _ := c.Get(middleware.AuthUserKey)
	claims := claimsVal.(*jwt.Claims)

	id := c.Param("id")
	if err := h.postService.Delete(c.Request.Context(), id, claims.UserID, claims.Role); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.Success(c, 200, "Post deleted successfully", nil)
}
