package database

import (
	"time"
)

type NFTCollection struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	ContractAddr string    `gorm:"uniqueIndex;size:42" json:"contract_addr"`
	Name        string    `gorm:"size:100" json:"name"`
	Symbol      string    `gorm:"size:20" json:"symbol"`
	OwnerAddr   string    `gorm:"size:42" json:"owner_addr"`
	IsVerified  bool      `json:"is_verified"`
	CreatedAt   time.Time `json:"created_at"`
}

type NFTItem struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	TokenID         string    `gorm:"size:66;uniqueIndex" json:"token_id"`
	CollectionID    uint      `json:"collection_id"`
	Collection      NFTCollection `gorm:"foreignKey:CollectionID" json:"-"`
	Name            string    `gorm:"size:200" json:"name"`
	Description     string    `gorm:"type:text" json:"description"`
	ImageURI        string    `gorm:"size:500" json:"image_uri"`
	OwnerAddr       string    `gorm:"size:42;index" json:"owner_addr"`
	CreatorAddr     string    `gorm:"size:42" json:"creator_addr"`
	RoyaltyFee      float64   `json:"royalty_fee"`
	MintTimestamp   time.Time `json:"mint_timestamp"`
	CreatedAt       time.Time `json:"created_at"`
}

type Transaction struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	TxHash          string    `gorm:"size:66;uniqueIndex" json:"tx_hash"`
	BlockNumber     uint64    `json:"block_number"`
	TokenID         string    `gorm:"size:66;index" json:"token_id"`
	CollectionID    uint      `json:"collection_id"`
	FromAddr        string    `gorm:"size:42;index" json:"from_addr"`
	ToAddr          string    `gorm:"size:42;index" json:"to_addr"`
	Price           float64   `json:"price"`
	Currency        string    `gorm:"size:10;default:'ETH'" json:"currency"`
	TxTimestamp     time.Time `json:"tx_timestamp"`
	GasUsed         uint64    `json:"gas_used"`
	GasPrice        string    `gorm:"size:50" json:"gas_price"`
	Status          string    `gorm:"size:20;default:'success'" json:"status"`
	IsAnomaly       bool      `gorm:"default:false;index" json:"is_anomaly"`
	AnomalyType     string    `gorm:"size:50" json:"anomaly_type"`
	AnomalyScore    float64   `json:"anomaly_score"`
	Reported        bool      `gorm:"default:false" json:"reported"`
	CreatedAt       time.Time `json:"created_at"`
}

type AnomalyAlert struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	AlertID         string    `gorm:"size:50;uniqueIndex" json:"alert_id"`
	TxID            uint      `json:"tx_id"`
	Transaction     Transaction `gorm:"foreignKey:TxID" json:"-"`
	AlertType       string    `gorm:"size:50;index" json:"alert_type"`
	Severity        string    `gorm:"size:20;index" json:"severity"`
	Description     string    `gorm:"type:text" json:"description"`
	RiskScore       float64   `json:"risk_score"`
	InvolvedAddrs   string    `gorm:"type:text" json:"involved_addrs"`
	Status          string    `gorm:"size:20;default:'pending';index" json:"status"`
	HandledBy       string    `gorm:"size:100" json:"handled_by"`
	HandledAt       *time.Time `json:"handled_at"`
	HandleNote      string    `gorm:"type:text" json:"handle_note"`
	CreatedAt       time.Time `json:"created_at"`
}

type ComplianceReport struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	ReportID        string    `gorm:"size:50;uniqueIndex" json:"report_id"`
	ReportType      string    `gorm:"size:50;index" json:"report_type"`
	ReportPeriod    string    `gorm:"size:20" json:"report_period"`
	StartDate       time.Time `json:"start_date"`
	EndDate         time.Time `json:"end_date"`
	TotalTxCount    uint64    `json:"total_tx_count"`
	AnomalyCount    uint64    `json:"anomaly_count"`
	TotalVolume     float64   `json:"total_volume"`
	ReportedCount   uint64    `json:"reported_count"`
	Status          string    `gorm:"size:20;default:'draft'" json:"status"`
	SubmittedAt     *time.Time `json:"submitted_at"`
	SubmittedBy     string    `gorm:"size:100" json:"submitted_by"`
	RegulatorAck    bool      `gorm:"default:false" json:"regulator_ack"`
	Data            string    `gorm:"type:text" json:"data"`
	CreatedAt       time.Time `json:"created_at"`
}

type RegulatorUser struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	Username        string    `gorm:"size:50;uniqueIndex" json:"username"`
	FullName        string    `gorm:"size:100" json:"full_name"`
	Role            string    `gorm:"size:50" json:"role"`
	Department      string    `gorm:"size:100" json:"department"`
	CreatedAt       time.Time `json:"created_at"`
}

type BlacklistAddr struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	Address         string    `gorm:"size:42;uniqueIndex" json:"address"`
	Reason          string    `gorm:"type:text" json:"reason"`
	Source          string    `gorm:"size:100" json:"source"`
	AddedBy         string    `gorm:"size:100" json:"added_by"`
	IsActive        bool      `gorm:"default:true;index" json:"is_active"`
	CreatedAt       time.Time `json:"created_at"`
}

type PriceOracle struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	CollectionID    uint      `gorm:"index" json:"collection_id"`
	AvgPrice        float64   `json:"avg_price"`
	MaxPrice        float64   `json:"max_price"`
	MinPrice        float64   `json:"min_price"`
	Price24hChange  float64   `json:"price_24h_change"`
	WindowStart     time.Time `json:"window_start"`
	WindowEnd       time.Time `json:"window_end"`
	CreatedAt       time.Time `json:"created_at"`
}
