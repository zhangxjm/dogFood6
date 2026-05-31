package database

import (
	"database/sql"
	"iiot-predictive-maintenance/internal/config"
	"iiot-predictive-maintenance/internal/model"
	"os"
	"path/filepath"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	_ "modernc.org/sqlite"
)

var DB *gorm.DB

func Init() error {
	dbPath := config.AppConfig.Database.URL
	dir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	sqlDB, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return err
	}

	DB, err = gorm.Open(sqlite.Dialector{
		DSN: dbPath,
		Conn: sqlDB,
	}, &gorm.Config{})
	if err != nil {
		return err
	}

	err = DB.AutoMigrate(
		&model.User{},
		&model.Device{},
		&model.Sensor{},
		&model.Prediction{},
		&model.MaintenancePlan{},
		&model.MaintenancePart{},
		&model.InventoryPart{},
		&model.MaintenanceRecord{},
		&model.InventoryTransaction{},
	)
	if err != nil {
		return err
	}

	return nil
}
