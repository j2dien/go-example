package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"go-crud-api/internal/config"
	"go-crud-api/internal/database"
	"go-crud-api/internal/handler"
	"go-crud-api/internal/repository"
	"go-crud-api/internal/router"
	"go-crud-api/internal/service"
	"go-crud-api/pkg/jwt"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load config
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Set Gin mode
	gin.SetMode(cfg.ServerMode)

	// Init DB
	log.Printf("Connecting to DB at %s:%s with user %s and db %s", cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBName)
	db, err := database.InitDB(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Seed superadmin user
	if err := database.SeedSuperAdmin(db, cfg); err != nil {
		log.Printf("Warning: Failed to seed superadmin user: %v", err)
	}

	// Init JWT service
	jwtService := jwt.NewJWTService(cfg.JWTSecret, cfg.JWTAccessExpiry, cfg.JWTRefreshExpiry)

	// Init Repositories
	userRepo := repository.NewUserRepository(db)
	postRepo := repository.NewPostRepository(db)

	// Init Services
	authService := service.NewAuthService(userRepo, jwtService)
	userService := service.NewUserService(userRepo)
	postService := service.NewPostService(postRepo, userRepo)

	// Init Handlers
	authHandler := handler.NewAuthHandler(authService)
	userHandler := handler.NewUserHandler(userService)
	postHandler := handler.NewPostHandler(postService)

	// Setup Router
	r := router.SetupRouter(router.RouterConfig{
		AuthHandler: authHandler,
		UserHandler: userHandler,
		PostHandler: postHandler,
		JWTService:  jwtService,
	})

	srv := &http.Server{
		Addr:    ":" + cfg.ServerPort,
		Handler: r,
	}

	// Run server in goroutine
	go func() {
		log.Printf("Server is running on port %s in %s mode\n", cfg.ServerPort, cfg.ServerMode)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to listen and serve: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited gracefully")
}
