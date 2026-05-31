package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port           int
	DBPath         string
	JWTSecret      string
	CORSOrigin     string
	EncryptionKey  string
}

var AppConfig Config

func Load() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: No .env file found, using environment variables")
	}

	AppConfig.Port, _ = strconv.Atoi(getEnv("PORT", "8080"))
	AppConfig.DBPath = getEnv("DB_PATH", "./data/bci_rehab.db")
	AppConfig.JWTSecret = getEnv("JWT_SECRET", "bci-rehab-2024-secure-key")
	AppConfig.CORSOrigin = getEnv("CORS_ORIGIN", "*")
	AppConfig.EncryptionKey = getEnv("ENCRYPTION_KEY", "32-byte-encryption-key-for-medical-data")
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
