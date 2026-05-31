package models

import "time"

type SeedlingCategory struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	Name           string    `gorm:"size:100;not null" json:"name"`
	ScientificName string    `gorm:"size:200" json:"scientific_name"`
	Description    string    `gorm:"type:text" json:"description"`
	Unit           string    `gorm:"size:20;not null" json:"unit"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type PlantingBatch struct {
	ID           uint              `gorm:"primaryKey" json:"id"`
	CategoryID   uint              `gorm:"not null" json:"category_id"`
	Category     SeedlingCategory  `gorm:"foreignKey:CategoryID" json:"category"`
	BatchNo      string            `gorm:"size:50;not null;unique" json:"batch_no"`
	PlantingDate time.Time         `json:"planting_date"`
	Quantity     int               `gorm:"not null" json:"quantity"`
	Location     string            `gorm:"size:200" json:"location"`
	Status       string            `gorm:"size:20;not null" json:"status"`
	Remarks      string            `gorm:"type:text" json:"remarks"`
	CreatedAt    time.Time         `json:"created_at"`
	UpdatedAt    time.Time         `json:"updated_at"`
	Outputs      []SeedlingOutput  `gorm:"foreignKey:BatchID" json:"outputs,omitempty"`
}

type SeedlingOutput struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	BatchID    uint           `gorm:"not null" json:"batch_id"`
	Batch      PlantingBatch  `gorm:"foreignKey:BatchID" json:"batch"`
	OutputDate time.Time      `json:"output_date"`
	Quantity   int            `gorm:"not null" json:"quantity"`
	Quality    string         `gorm:"size:20" json:"quality"`
	Operator   string         `gorm:"size:50" json:"operator"`
	Remarks    string         `gorm:"type:text" json:"remarks"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
}

type ShipmentRecord struct {
	ID           uint              `gorm:"primaryKey" json:"id"`
	CustomerName string            `gorm:"size:200;not null" json:"customer_name"`
	Contact      string            `gorm:"size:50" json:"contact"`
	Phone        string            `gorm:"size:20" json:"phone"`
	Address      string            `gorm:"size:500" json:"address"`
	ShipDate     time.Time         `json:"ship_date"`
	CategoryID   uint              `gorm:"not null" json:"category_id"`
	Category     SeedlingCategory  `gorm:"foreignKey:CategoryID" json:"category"`
	Quantity     int               `gorm:"not null" json:"quantity"`
	UnitPrice    float64           `gorm:"type:decimal(10,2)" json:"unit_price"`
	TotalAmount  float64           `gorm:"type:decimal(12,2)" json:"total_amount"`
	Status       string            `gorm:"size:20;not null" json:"status"`
	Logistics    string            `gorm:"size:100" json:"logistics"`
	TrackingNo   string            `gorm:"size:100" json:"tracking_no"`
	Remarks      string            `gorm:"type:text" json:"remarks"`
	CreatedAt    time.Time         `json:"created_at"`
	UpdatedAt    time.Time         `json:"updated_at"`
}
