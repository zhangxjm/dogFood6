package database

import (
	"nft-audit-system/config"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Init() error {
	var err error
	DB, err = gorm.Open(sqlite.Open(config.App.DBPath), &gorm.Config{})
	if err != nil {
		return err
	}

	return DB.AutoMigrate(
		&NFTCollection{},
		&NFTItem{},
		&Transaction{},
		&AnomalyAlert{},
		&ComplianceReport{},
		&RegulatorUser{},
		&BlacklistAddr{},
		&PriceOracle{},
	)
}
