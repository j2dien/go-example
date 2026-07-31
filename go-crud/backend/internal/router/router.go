package router

import (
	"go-crud-api/internal/handler"
	"go-crud-api/internal/middleware"
	"go-crud-api/internal/model"
	"go-crud-api/pkg/jwt"
	"go-crud-api/pkg/response"

	"github.com/gin-gonic/gin"
)

type RouterConfig struct {
	AuthHandler *handler.AuthHandler
	UserHandler *handler.UserHandler
	PostHandler *handler.PostHandler
	JWTService  jwt.JWTService
}

func SetupRouter(cfg RouterConfig) *gin.Engine {
	r := gin.New()

	r.Use(gin.Logger())
	r.Use(gin.Recovery())
	r.Use(middleware.CORSMiddleware())

	api := r.Group("/api/v1")
	{
		// Health check
		api.GET("/health", func(c *gin.Context) {
			response.Success(c, 200, "API is running smoothly", gin.H{"status": "ok"})
		})

		// Auth routes (public)
		auth := api.Group("/auth")
		{
			auth.POST("/register", cfg.AuthHandler.Register)
			auth.POST("/login", cfg.AuthHandler.Login)
			auth.POST("/refresh", cfg.AuthHandler.RefreshToken)
		}

		// Protected routes (requires valid JWT)
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware(cfg.JWTService))
		{
			// Users routes (accessible by all authenticated users)
			users := protected.Group("/users")
			{
				users.GET("/me", cfg.UserHandler.GetMe)
				users.GET("", cfg.UserHandler.GetAll)
				users.GET("/:id", cfg.UserHandler.GetByID)
				users.PUT("/:id", cfg.UserHandler.Update)
				users.DELETE("/:id", cfg.UserHandler.Delete)
			}

			// Posts routes
			posts := protected.Group("/posts")
			{
				posts.POST("", cfg.PostHandler.Create)
				posts.GET("", cfg.PostHandler.GetAll)
				posts.GET("/:id", cfg.PostHandler.GetByID)
				posts.PUT("/:id", cfg.PostHandler.Update)
				posts.DELETE("/:id", cfg.PostHandler.Delete)
			}

			// Admin routes (requires superadmin role)
			admin := protected.Group("/admin")
			admin.Use(middleware.RoleMiddleware(model.RoleSuperAdmin))
			{
				admin.PUT("/users/:id", cfg.UserHandler.AdminUpdate)
				admin.PATCH("/users/:id/role", cfg.UserHandler.AdminChangeRole)
				admin.DELETE("/users/:id", cfg.UserHandler.Delete)
			}
		}
	}

	return r
}
