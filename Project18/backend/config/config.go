package config

import "os"

type Config struct {
	RedisHost string
	RedisPort string
	DBPath    string
	ServerPort string
}

func LoadConfig() *Config {
	return &Config{
		RedisHost:  getEnv("REDIS_HOST", "localhost"),
		RedisPort:  getEnv("REDIS_PORT", "6379"),
		DBPath:     getEnv("DB_PATH", "./data/edge.db"),
		ServerPort: getEnv("SERVER_PORT", "8080"),
	}
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
