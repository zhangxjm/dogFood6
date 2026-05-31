package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	RedisHost        string
	RedisPort        string
	RedisPassword    string
	DBPath           string
	ServerHost       string
	ServerPort       string
	CORSAllowOrigin  string
	BlockchainRPCURL string
}

var App Config

func Load() error {
	_ = godotenv.Load("../.env")

	App = Config{
		RedisHost:        getEnv("REDIS_HOST", "localhost"),
		RedisPort:        getEnv("REDIS_PORT", "6379"),
		RedisPassword:    getEnv("REDIS_PASSWORD", ""),
		DBPath:           getEnv("DB_PATH", "./nft_audit.db"),
		ServerHost:       getEnv("SERVER_HOST", "0.0.0.0"),
		ServerPort:       getEnv("SERVER_PORT", "8080"),
		CORSAllowOrigin:  getEnv("CORS_ALLOW_ORIGIN", "http://localhost:3000"),
		BlockchainRPCURL: getEnv("BLOCKCHAIN_RPC_URL", ""),
	}

	return nil
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
