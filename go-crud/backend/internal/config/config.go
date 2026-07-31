package config

import (
	"log"

	"github.com/spf13/viper"
)

type Config struct {
	ServerPort       string `mapstructure:"SERVER_PORT"`
	ServerMode       string `mapstructure:"SERVER_MODE"`
	DBHost           string `mapstructure:"DB_HOST"`
	DBPort           string `mapstructure:"DB_PORT"`
	DBUser           string `mapstructure:"DB_USER"`
	DBPassword       string `mapstructure:"DB_PASSWORD"`
	DBName           string `mapstructure:"DB_NAME"`
	DBSchema         string `mapstructure:"DB_SCHEMA"`
	JWTSecret        string `mapstructure:"JWT_SECRET"`
	JWTAccessExpiry  int    `mapstructure:"JWT_ACCESS_EXPIRY"`  // in minutes
	JWTRefreshExpiry int    `mapstructure:"JWT_REFRESH_EXPIRY"` // in hours
	SuperAdminName   string `mapstructure:"SUPERADMIN_NAME"`
	SuperAdminEmail  string `mapstructure:"SUPERADMIN_EMAIL"`
	SuperAdminPassword string `mapstructure:"SUPERADMIN_PASSWORD"`
}

func LoadConfig() (*Config, error) {
	viper.SetConfigFile(".env")
	viper.SetConfigType("env")

	viper.SetDefault("SERVER_PORT", "8080")
	viper.SetDefault("SERVER_MODE", "debug")
	viper.SetDefault("DB_HOST", "localhost")
	viper.SetDefault("DB_PORT", "5432")
	viper.SetDefault("DB_USER", "postgres")
	viper.SetDefault("DB_PASSWORD", "postgres")
	viper.SetDefault("DB_NAME", "go_crud_db")
	viper.SetDefault("DB_SCHEMA", "public")
	viper.SetDefault("JWT_SECRET", "super-secret-jwt-key-change-in-production")
	viper.SetDefault("JWT_ACCESS_EXPIRY", 15)
	viper.SetDefault("JWT_REFRESH_EXPIRY", 168)
	viper.SetDefault("SUPERADMIN_NAME", "Super Admin")
	viper.SetDefault("SUPERADMIN_EMAIL", "superadmin@gocrud.app")
	viper.SetDefault("SUPERADMIN_PASSWORD", "SuperAdmin123!")

	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err != nil {
		log.Println("No .env file found, using environment variables or defaults")
	}

	var cfg Config
	if err := viper.Unmarshal(&cfg); err != nil {
		return nil, err
	}

	return &cfg, nil
}
