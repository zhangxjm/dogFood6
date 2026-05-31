package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	ServerPort   string
	DBPath       string
	RabbitMQURL string
	QueueName    string
	MapAPIKey    string
}

var AppConfig *Config

func LoadConfig() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using default values")
	}

	AppConfig = &Config{
		ServerPort:   getEnv("SERVER_PORT", "8080"),
		DBPath:       getEnv("DB_PATH", "./logistics.db"),
		RabbitMQURL: getEnv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/"),
		QueueName:    getEnv("QUEUE_NAME", "parcel_queue"),
		MapAPIKey:    getEnv("MAP_API_KEY", "demo_key"),
	}
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
