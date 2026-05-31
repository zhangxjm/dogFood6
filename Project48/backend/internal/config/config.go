package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
	InfluxDB InfluxDBConfig
	AI       AIConfig
	Cron     CronConfig
}

type ServerConfig struct {
	Port string
	Host string
}

type DatabaseConfig struct {
	URL string
}

type JWTConfig struct {
	Secret      string
	ExpireHours int
}

type InfluxDBConfig struct {
	URL    string
	Token  string
	Org    string
	Bucket string
}

type AIConfig struct {
	URL string
}

type CronConfig struct {
	Prediction  string
	Maintenance string
	Inventory   string
}

var AppConfig *Config

func Load() error {
	_ = godotenv.Load()

	expireHours, _ := strconv.Atoi(getEnv("JWT_EXPIRE_HOURS", "24"))

	AppConfig = &Config{
		Server: ServerConfig{
			Port: getEnv("SERVER_PORT", "8080"),
			Host: getEnv("SERVER_HOST", "0.0.0.0"),
		},
		Database: DatabaseConfig{
			URL: getEnv("DATABASE_URL", "./data/app.db"),
		},
		JWT: JWTConfig{
			Secret:      getEnv("JWT_SECRET", "default-secret-key-change-me"),
			ExpireHours: expireHours,
		},
		InfluxDB: InfluxDBConfig{
			URL:    getEnv("INFLUXDB_URL", "http://localhost:8086"),
			Token:  getEnv("INFLUXDB_TOKEN", ""),
			Org:    getEnv("INFLUXDB_ORG", "iiot-org"),
			Bucket: getEnv("INFLUXDB_BUCKET", "iiot-data"),
		},
		AI: AIConfig{
			URL: getEnv("AI_SERVICE_URL", "localhost:50051"),
		},
		Cron: CronConfig{
			Prediction:  getEnv("CRON_PREDICTION", "0 */6 * * *"),
			Maintenance: getEnv("CRON_MAINTENANCE", "0 8 * * *"),
			Inventory:   getEnv("CRON_INVENTORY", "0 9 * * *"),
		},
	}

	return nil
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
