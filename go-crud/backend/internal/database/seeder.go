package database

import (
	"log"

	"go-crud-api/internal/config"
	"go-crud-api/internal/model"
	"go-crud-api/pkg/hash"

	"gorm.io/gorm"
)

func SeedSuperAdmin(db *gorm.DB, cfg *config.Config) error {
	var count int64
	if err := db.Model(&model.User{}).Where("role = ?", model.RoleSuperAdmin).Count(&count).Error; err != nil {
		return err
	}

	if count > 0 {
		log.Println("Superadmin user already exists. Skipping seeder.")
		return nil
	}

	name := cfg.SuperAdminName
	if name == "" {
		name = "Super Admin"
	}
	email := cfg.SuperAdminEmail
	if email == "" {
		email = "superadmin@gocrud.app"
	}
	password := cfg.SuperAdminPassword
	if password == "" {
		password = "SuperAdmin123!"
	}

	hashedPassword, err := hash.HashPassword(password)
	if err != nil {
		return err
	}

	superadmin := &model.User{
		Name:     name,
		Email:    email,
		Password: hashedPassword,
		Role:     model.RoleSuperAdmin,
	}

	if err := db.Create(superadmin).Error; err != nil {
		return err
	}

	log.Printf("Superadmin seeded successfully! Email: %s", email)
	return nil
}
