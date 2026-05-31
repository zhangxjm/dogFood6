package config

import (
	"os"

	"github.com/joho/godotenv"
)

func Load() error {
	if err := godotenv.Load(); err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}
	return nil
}

func GetRedisAddr() string {
	addr := os.Getenv("REDIS_ADDR")
	if addr == "" {
		return "localhost:6379"
	}
	return addr
}

func GetRedisPassword() string {
	return os.Getenv("REDIS_PASSWORD")
}

func GetRedisDB() int {
	return 0
}

func GetDatabasePath() string {
	path := os.Getenv("DATABASE_PATH")
	if path == "" {
		return "./quantum.db"
	}
	return path
}
