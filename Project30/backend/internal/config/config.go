package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	ServerPort    string
	RedisAddr     string
	RedisPassword string
	RedisDB       int
	DatabasePath  string
	JWTSecret     string
}

var AppConfig *Config

func Load() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	AppConfig = &Config{
		ServerPort:    getEnv("SERVER_PORT", "8082"),
		RedisAddr:     getEnv("REDIS_ADDR", "localhost:6379"),
		RedisPassword: getEnv("REDIS_PASSWORD", ""),
		RedisDB:       0,
		DatabasePath:  getEnv("DATABASE_PATH", "./warehouse.db"),
		JWTSecret:     getEnv("JWT_SECRET", "warehouse-secret"),
	}
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
