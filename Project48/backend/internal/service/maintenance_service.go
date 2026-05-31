package service

import (
	"fmt"
	"iiot-predictive-maintenance/internal/model"
	"iiot-predictive-maintenance/internal/repository"
	"math/rand"
	"time"
)

type MaintenanceService struct {
	repo              *repository.MaintenanceRepository
	deviceService     *DeviceService
	predictionService *PredictionService
	inventoryService  *InventoryService
}

func NewMaintenanceService() *MaintenanceService {
	return &MaintenanceService{
		repo:              repository.NewMaintenanceRepository(),
		deviceService:     NewDeviceService(),
		predictionService: NewPredictionService(),
		inventoryService:  NewInventoryService(),
	}
}

func (s *MaintenanceService) ListPlans(page, pageSize int, status string, deviceID uint) (int64, []model.MaintenancePlan, error) {
	return s.repo.ListPlans(page, pageSize, status, deviceID)
}

func (s *MaintenanceService) GetPlanByID(id uint) (*model.MaintenancePlan, error) {
	return s.repo.GetPlanByID(id)
}

func (s *MaintenanceService) CreatePlan(plan *model.MaintenancePlan) error {
	return s.repo.CreatePlan(plan)
}

func (s *MaintenanceService) UpdatePlan(plan *model.MaintenancePlan) error {
	return s.repo.UpdatePlan(plan)
}

func (s *MaintenanceService) UpdatePlanStatus(id uint, status string) error {
	return s.repo.UpdatePlanStatus(id, status)
}

func (s *MaintenanceService) DeletePlan(id uint) error {
	return s.repo.DeletePlan(id)
}

func (s *MaintenanceService) GetStats() (*model.MaintenanceStats, error) {
	return s.repo.GetStats()
}

func (s *MaintenanceService) ExecutePlan(id uint, req *model.ExecutePlanRequest) error {
	plan, err := s.repo.GetPlanByID(id)
	if err != nil {
		return err
	}

	plan.ActualHours = &req.ActualHours
	plan.Status = "completed"

	if err := s.repo.UpdatePlan(plan); err != nil {
		return err
	}

	for _, part := range req.PartsUsed {
		if err := s.inventoryService.ConsumePart(part.PartID, part.Quantity, "维护消耗"); err != nil {
			return err
		}
	}

	record := &model.MaintenanceRecord{
		DeviceID: plan.DeviceID,
		PlanID:   &plan.ID,
		Result:   "success",
		Notes:    req.Notes,
	}
	if err := s.repo.CreateRecord(record); err != nil {
		return err
	}

	now := time.Now()
	_ = s.deviceService.repo.UpdateHealthScore(plan.DeviceID, 95)
	_ = s.deviceService.repo.UpdateStatus(plan.DeviceID, "online")
	_ = repository.NewDeviceRepository().UpdateLastMaintenance(plan.DeviceID, now)

	return nil
}

func (s *MaintenanceService) GeneratePlans() error {
	highRiskPredictions, err := s.predictionService.GetHighRiskPredictions(20)
	if err != nil {
		return err
	}

	for _, prediction := range highRiskPredictions {
		_, existingPlans, err := s.repo.ListPlans(1, 10, "", prediction.DeviceID)
		if err != nil {
			continue
		}

		hasPending := false
		for _, plan := range existingPlans {
			if plan.Status != "completed" && plan.Status != "cancelled" {
				hasPending = true
				break
			}
		}
		if hasPending {
			continue
		}

		priority := "medium"
		if prediction.RiskLevel == "critical" {
			priority = "high"
		}

		estimatedHours := 4.0
		if prediction.RiskLevel == "critical" {
			estimatedHours = 8.0
		}

		scheduledDate := time.Now().AddDate(0, 0, 1)
		if prediction.RiskLevel == "critical" {
			scheduledDate = time.Now().Add(time.Hour * 4)
		}

		plan := &model.MaintenancePlan{
			DeviceID:       prediction.DeviceID,
			Title:          "预测性维护 - " + prediction.FaultType,
			Type:           "predictive",
			Status:         "pending",
			Priority:       priority,
			ScheduledDate:  scheduledDate,
			EstimatedHours: &estimatedHours,
			Description:    "根据AI预测结果，设备存在" + prediction.FaultType + "风险，故障概率为" + formatPercent(prediction.Probability) + "，建议尽快安排维护。",
		}

		if err := s.repo.CreatePlan(plan); err != nil {
			continue
		}
	}

	return nil
}

func (s *MaintenanceService) GetPlansByDateRange(start, end time.Time) ([]model.MaintenancePlan, error) {
	return s.repo.GetPlansByDateRange(start, end)
}

func (s *MaintenanceService) GetCalendarData(months int) ([]map[string]interface{}, error) {
	end := time.Now().AddDate(0, months, 0)
	start := time.Now()

	plans, err := s.GetPlansByDateRange(start, end)
	if err != nil {
		return nil, err
	}

	var result []map[string]interface{}
	for _, plan := range plans {
		color := "#165DFF"
		if plan.Priority == "high" {
			color = "#F53F3F"
		} else if plan.Priority == "medium" {
			color = "#FF7D00"
		}

		if plan.Status == "completed" {
			color = "#00B42A"
		} else if plan.Status == "in_progress" {
			color = "#722ED1"
		}

		result = append(result, map[string]interface{}{
			"id":    plan.ID,
			"title": plan.Title,
			"start": plan.ScheduledDate.Format(time.RFC3339),
			"color": color,
			"status": plan.Status,
			"deviceName": plan.DeviceName,
			"priority": plan.Priority,
		})
	}

	return result, nil
}

func (s *MaintenanceService) GetRecords(deviceID uint, limit int) ([]model.MaintenanceRecord, error) {
	return s.repo.GetRecords(deviceID, limit)
}

func (s *MaintenanceService) InitializePlans() error {
	total, _, _ := s.repo.ListPlans(1, 1, "", 0)
	if total > 0 {
		return nil
	}

	devices, _ := s.deviceService.GetAll()
	maintenanceTypes := []string{"preventive", "corrective"}
	titles := []string{
		"常规保养检查",
		"关键部件更换",
		"润滑系统维护",
		"电气系统检测",
		"精度校准",
	}

	for i, device := range devices {
		daysOffset := rand.Intn(14)
		priority := "medium"
		if i%3 == 0 {
			priority = "high"
		}

		hours := float64(2 + rand.Intn(6))

		plan := &model.MaintenancePlan{
			DeviceID:       device.ID,
			Title:          titles[i%len(titles)],
			Type:           maintenanceTypes[i%len(maintenanceTypes)],
			Status:         []string{"pending", "approved", "in_progress", "completed"}[i%4],
			Priority:       priority,
			ScheduledDate:  time.Now().AddDate(0, 0, daysOffset),
			EstimatedHours: &hours,
			Description:    "定期维护任务，确保设备正常运行",
		}

		_ = s.repo.CreatePlan(plan)
	}

	return nil
}

func formatPercent(f float64) string {
	return fmt.Sprintf("%.0f", f*100) + "%"
}
