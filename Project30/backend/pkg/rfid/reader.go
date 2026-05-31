package rfid

import (
	"fmt"
	"math/rand"
	"time"

	"warehouse-system/internal/models"
	"warehouse-system/pkg/redis"
)

type RFIDReaderService struct{}

type ScanResult struct {
	RFIDTag    string    `json:"rfid_tag"`
	ReaderID   string    `json:"reader_id"`
	ScanTime   time.Time `json:"scan_time"`
	SignalStrength int  `json:"signal_strength"`
}

func NewRFIDReaderService() *RFIDReaderService {
	return &RFIDReaderService{}
}

func (s *RFIDReaderService) SimulateScan(warehouseID uint) ([]ScanResult, error) {
	var inventories []models.Inventory
	if err := models.DB.Where("warehouse_id = ? AND status = ?", warehouseID, "in_stock").Find(&inventories).Error; err != nil {
		return nil, err
	}

	var results []ScanResult
	for _, inv := range inventories {
		if rand.Float32() > 0.1 {
			results = append(results, ScanResult{
				RFIDTag:      inv.RFIDTag,
				ReaderID:     fmt.Sprintf("READER-%03d", warehouseID),
				ScanTime:     time.Now(),
				SignalStrength: rand.Intn(50) + 50,
			})
		}
	}

	return results, nil
}

func (s *RFIDReaderService) ProcessScanResults(warehouseID uint, results []ScanResult) (map[string]int, error) {
	scannedTags := make(map[string]bool)
	for _, result := range results {
		scannedTags[result.RFIDTag] = true
	}

	cacheKey := fmt.Sprintf("warehouse:%d:last_scan", warehouseID)
	scanData := map[string]interface{}{
		"count":     len(results),
		"timestamp": time.Now(),
		"tags":      results,
	}

	if err := redis.RedisClient.SetCache(cacheKey, scanData, 24*time.Hour); err != nil {
		return nil, err
	}

	if err := redis.RedisClient.Publish("rfid_scan_channel", scanData); err != nil {
		return nil, err
	}

	return nil, nil
}

func (s *RFIDReaderService) AutoStockTake(warehouseID uint) (*models.StockTake, error) {
	var expectedInventories []models.Inventory
	if err := models.DB.Where("warehouse_id = ? AND status = ?", warehouseID, "in_stock").Find(&expectedInventories).Error; err != nil {
		return nil, err
	}

	scanResults, err := s.SimulateScan(warehouseID)
	if err != nil {
		return nil, err
	}

	scannedTags := make(map[string]bool)
	for _, result := range scanResults {
		scannedTags[result.RFIDTag] = true
	}

	expectedQty := len(expectedInventories)
	actualQty := len(scannedTags)

	stockTake := &models.StockTake{
		WarehouseID: warehouseID,
		ProductID:   0,
		ExpectedQty: expectedQty,
		ActualQty:   actualQty,
		DiffQty:     actualQty - expectedQty,
		Status:      "completed",
		TakenBy:     "system_auto",
		TakenAt:     time.Now(),
	}

	if err := models.DB.Create(stockTake).Error; err != nil {
		return nil, err
	}

	return stockTake, nil
}

func (s *RFIDReaderService) GetLastScanData(warehouseID uint) (map[string]interface{}, error) {
	cacheKey := fmt.Sprintf("warehouse:%d:last_scan", warehouseID)
	var result map[string]interface{}
	if err := redis.RedisClient.GetCache(cacheKey, &result); err != nil {
		return nil, err
	}
	return result, nil
}
