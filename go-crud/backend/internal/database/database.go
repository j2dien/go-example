package database

import (
	"fmt"
	"log"

	"go-crud-api/internal/config"
	"go-crud-api/internal/model"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func InitDB(cfg *config.Config) (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta",
		cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBPort,
	)
	log.Printf("Connecting with DSN: %s\n", dsn)

	gormConfig := &gorm.Config{}
	if cfg.ServerMode == "debug" {
		gormConfig.Logger = logger.Default.LogMode(logger.Info)
	}

	db, err := gorm.Open(postgres.Open(dsn), gormConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("Database connection established successfully")

	// Auto Migration
	if err := db.AutoMigrate(&model.User{}, &model.Post{}); err != nil {
		return nil, fmt.Errorf("failed to run database auto migration: %w", err)
	}

	log.Println("Database auto-migration completed")
	return db, nil
}
