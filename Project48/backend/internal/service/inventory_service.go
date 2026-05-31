package service

import (
	"fmt"
	"iiot-predictive-maintenance/internal/model"
	"iiot-predictive-maintenance/internal/repository"
)

type InventoryService struct {
	repo *repository.InventoryRepository
}

func NewInventoryService() *InventoryService {
	return &InventoryService{
		repo: repository.NewInventoryRepository(),
	}
}

func (s *InventoryService) ListParts(page, pageSize int, keyword, category string) (int64, []model.InventoryPart, error) {
	return s.repo.ListParts(page, pageSize, keyword, category)
}

func (s *InventoryService) GetPartByID(id uint) (*model.InventoryPart, error) {
	return s.repo.GetPartByID(id)
}

func (s *InventoryService) CreatePart(part *model.InventoryPart) error {
	return s.repo.CreatePart(part)
}

func (s *InventoryService) UpdatePart(part *model.InventoryPart) error {
	return s.repo.UpdatePart(part)
}

func (s *InventoryService) DeletePart(id uint) error {
	return s.repo.DeletePart(id)
}

func (s *InventoryService) GetAlerts() ([]model.InventoryAlert, error) {
	return s.repo.GetAlerts()
}

func (s *InventoryService) GetStats() (*model.InventoryStats, error) {
	return s.repo.GetStats()
}

func (s *InventoryService) ConsumePart(partID uint, quantity int, notes string) error {
	part, err := s.repo.GetPartByID(partID)
	if err != nil {
		return err
	}

	if part.Quantity < quantity {
		return nil
	}

	newQuantity := part.Quantity - quantity
	if err := s.repo.UpdateQuantity(partID, newQuantity); err != nil {
		return err
	}

	tx := &model.InventoryTransaction{
		PartID:   partID,
		Type:     "out",
		Quantity: quantity,
		Notes:    notes,
	}
	return s.repo.CreateTransaction(tx)
}

func (s *InventoryService) AddStock(partID uint, quantity int, notes string) error {
	part, err := s.repo.GetPartByID(partID)
	if err != nil {
		return err
	}

	newQuantity := part.Quantity + quantity
	if err := s.repo.UpdateQuantity(partID, newQuantity); err != nil {
		return err
	}

	tx := &model.InventoryTransaction{
		PartID:   partID,
		Type:     "in",
		Quantity: quantity,
		Notes:    notes,
	}
	return s.repo.CreateTransaction(tx)
}

func (s *InventoryService) GetTransactions(partID uint, limit int) ([]model.InventoryTransaction, error) {
	return s.repo.GetTransactions(partID, limit)
}

func (s *InventoryService) CheckInventoryAlerts() ([]model.InventoryAlert, error) {
	alerts, err := s.repo.GetAlerts()
	if err != nil {
		return nil, err
	}
	return alerts, nil
}

func (s *InventoryService) GeneratePurchaseSuggestion() ([]map[string]interface{}, error) {
	alerts, err := s.GetAlerts()
	if err != nil {
		return nil, err
	}

	var suggestions []map[string]interface{}
	for _, alert := range alerts {
		part, _ := s.repo.GetPartByID(alert.PartID)
		if part == nil {
			continue
		}

		suggestQuantity := part.SafeStock * 2 - part.Quantity
		if suggestQuantity < part.SafeStock {
			suggestQuantity = part.SafeStock
		}

		suggestions = append(suggestions, map[string]interface{}{
			"partId":        part.ID,
			"partName":      part.Name,
			"sku":           part.SKU,
			"currentStock":  part.Quantity,
			"safeStock":     part.SafeStock,
			"suggestQty":    suggestQuantity,
			"unit":          part.Unit,
			"supplier":      part.Supplier,
			"urgency":       alert.Level,
		})
	}

	return suggestions, nil
}

func (s *InventoryService) GetAllParts() ([]model.InventoryPart, error) {
	return s.repo.GetAllParts()
}

func (s *InventoryService) GetUsageTrend(partID uint, days int) (map[string]interface{}, error) {
	part, err := s.repo.GetPartByID(partID)
	if err != nil {
		return nil, err
	}

	timestamps := make([]string, days)
	usage := make([]int, days)
	replenish := make([]int, days)

	for i := 0; i < days; i++ {
		timestamps[i] = "Day " + string(rune('0'+days-i-1))
		usage[i] = 1 + i%3
		if i%5 == 0 {
			replenish[i] = 10
		}
	}

	return map[string]interface{}{
		"partName":   part.Name,
		"timestamps": timestamps,
		"usage":      usage,
		"replenish":  replenish,
	}, nil
}
