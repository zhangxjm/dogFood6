package services

import (
	"encoding/json"
	"fmt"
	"nft-audit-system/database"
	"time"
)

type ReportData struct {
	Overview         map[string]interface{}   `json:"overview"`
	TopCollections   []map[string]interface{} `json:"topCollections"`
	AnomalyBreakdown map[string]int64         `json:"anomalyBreakdown"`
	HighRiskAddrs    []map[string]interface{} `json:"highRiskAddrs"`
}

func GenerateComplianceReport(reportType string) (*database.ComplianceReport, error) {
	var startDate, endDate time.Time
	var period string

	now := time.Now()
	switch reportType {
	case "daily":
		startDate = now.Truncate(24 * time.Hour).AddDate(0, 0, -1)
		endDate = startDate.AddDate(0, 0, 1)
		period = startDate.Format("2006-01-02")
	case "weekly":
		weekday := int(now.Weekday())
		startDate = now.AddDate(0, 0, -weekday-7).Truncate(24 * time.Hour)
		endDate = startDate.AddDate(0, 0, 7)
		period = fmt.Sprintf("%s-W%d", startDate.Format("2006"), int(startDate.Unix()/(7*24*3600))%52+1)
	case "monthly":
		startDate = time.Date(now.Year(), now.Month()-1, 1, 0, 0, 0, 0, time.UTC)
		endDate = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
		period = startDate.Format("2006-01")
	default:
		startDate = now.AddDate(0, 0, -7)
		endDate = now
		period = "custom"
	}

	var totalTx, anomalyTx, reportedTx int64
	var totalVolume float64

	database.DB.Model(&database.Transaction{}).
		Where("tx_timestamp >= ? AND tx_timestamp < ?", startDate, endDate).
		Count(&totalTx)
	database.DB.Model(&database.Transaction{}).
		Where("tx_timestamp >= ? AND tx_timestamp < ? AND is_anomaly = ?", startDate, endDate, true).
		Count(&anomalyTx)
	database.DB.Model(&database.Transaction{}).
		Where("tx_timestamp >= ? AND tx_timestamp < ? AND reported = ?", startDate, endDate, true).
		Count(&reportedTx)
	database.DB.Model(&database.Transaction{}).
		Where("tx_timestamp >= ? AND tx_timestamp < ?", startDate, endDate).
		Select("COALESCE(SUM(price), 0)").Scan(&totalVolume)

	topCollections := getTopCollections(startDate, endDate, 5)
	anomalyBreakdown := getAnomalyBreakdown(startDate, endDate)
	highRiskAddrs := getHighRiskAddresses(10)

	reportData := ReportData{
		Overview: map[string]interface{}{
			"totalTx":      totalTx,
			"anomalyTx":    anomalyTx,
			"reportedTx":   reportedTx,
			"totalVolume":  totalVolume,
			"complianceRate": 100.0,
		},
		TopCollections:   topCollections,
		AnomalyBreakdown: anomalyBreakdown,
		HighRiskAddrs:    highRiskAddrs,
	}

	dataJSON, _ := json.Marshal(reportData)

	report := database.ComplianceReport{
		ReportID:     fmt.Sprintf("RPT-%s-%d", reportType, time.Now().Unix()),
		ReportType:   reportType,
		ReportPeriod: period,
		StartDate:    startDate,
		EndDate:      endDate,
		TotalTxCount: uint64(totalTx),
		AnomalyCount: uint64(anomalyTx),
		TotalVolume:  totalVolume,
		ReportedCount: uint64(reportedTx),
		Status:       "draft",
		Data:         string(dataJSON),
		CreatedAt:    time.Now(),
	}

	if err := database.DB.Create(&report).Error; err != nil {
		return nil, err
	}

	return &report, nil
}

func getTopCollections(start, end time.Time, limit int) []map[string]interface{} {
	type Result struct {
		CollectionID uint
		Name         string
		TxCount      int64
		Volume       float64
	}

	var results []Result
	database.DB.Table("transactions t").
		Select("t.collection_id, c.name, COUNT(*) as tx_count, SUM(t.price) as volume").
		Joins("LEFT JOIN nft_collections c ON c.id = t.collection_id").
		Where("t.tx_timestamp >= ? AND t.tx_timestamp < ?", start, end).
		Group("t.collection_id, c.name").
		Order("volume DESC").
		Limit(limit).
		Scan(&results)

	output := make([]map[string]interface{}, len(results))
	for i, r := range results {
		output[i] = map[string]interface{}{
			"collectionId": r.CollectionID,
			"name":         r.Name,
			"txCount":      r.TxCount,
			"volume":       r.Volume,
		}
	}
	return output
}

func getAnomalyBreakdown(start, end time.Time) map[string]int64 {
	types := []string{"price_anomaly", "wash_trading", "blacklist_addr", "high_freq_trade"}
	result := make(map[string]int64)

	for _, t := range types {
		var count int64
		database.DB.Model(&database.AnomalyAlert{}).
			Where("created_at >= ? AND created_at < ? AND alert_type = ?", start, end, t).
			Count(&count)
		result[t] = count
	}

	return result
}

func getHighRiskAddresses(limit int) []map[string]interface{} {
	type Result struct {
		Address   string
		AlertCount int64
	}

	var fromResults, toResults []Result
	database.DB.Table("anomaly_alerts a").
		Select("t.from_addr as address, COUNT(*) as alert_count").
		Joins("LEFT JOIN transactions t ON t.id = a.tx_id").
		Group("t.from_addr").
		Order("alert_count DESC").
		Limit(limit).
		Scan(&fromResults)
	database.DB.Table("anomaly_alerts a").
		Select("t.to_addr as address, COUNT(*) as alert_count").
		Joins("LEFT JOIN transactions t ON t.id = a.tx_id").
		Group("t.to_addr").
		Order("alert_count DESC").
		Limit(limit).
		Scan(&toResults)

	addrMap := make(map[string]int64)
	for _, r := range fromResults {
		addrMap[r.Address] += r.AlertCount
	}
	for _, r := range toResults {
		addrMap[r.Address] += r.AlertCount
	}

	output := make([]map[string]interface{}, 0, len(addrMap))
	for addr, count := range addrMap {
		output = append(output, map[string]interface{}{
			"address":    addr,
			"alertCount": count,
		})
	}

	return output
}

func SubmitReport(reportID uint, submittedBy string) error {
	now := time.Now()
	return database.DB.Model(&database.ComplianceReport{}).
		Where("id = ?", reportID).
		Updates(map[string]interface{}{
			"status":      "submitted",
			"submitted_at": &now,
			"submitted_by": submittedBy,
		}).Error
}

func AcknowledgeReport(reportID uint) error {
	return database.DB.Model(&database.ComplianceReport{}).
		Where("id = ?", reportID).
		Update("regulator_ack", true).Error
}

func GetComplianceStats() map[string]interface{} {
	var totalReports, submittedReports, ackReports int64
	var todayReports int64

	database.DB.Model(&database.ComplianceReport{}).Count(&totalReports)
	database.DB.Model(&database.ComplianceReport{}).Where("status = ?", "submitted").Count(&submittedReports)
	database.DB.Model(&database.ComplianceReport{}).Where("regulator_ack = ?", true).Count(&ackReports)

	today := time.Now().Truncate(24 * time.Hour)
	database.DB.Model(&database.ComplianceReport{}).Where("created_at >= ?", today).Count(&todayReports)

	var complianceRate float64
	if totalReports > 0 {
		complianceRate = float64(submittedReports) / float64(totalReports) * 100
	}

	return map[string]interface{}{
		"totalReports":      totalReports,
		"submittedReports":  submittedReports,
		"acknowledgedReports": ackReports,
		"todayReports":      todayReports,
		"complianceRate":    complianceRate,
	}
}

func GetReportHistory(page, size int) map[string]interface{} {
	var reports []database.ComplianceReport
	var total int64

	offset := (page - 1) * size
	database.DB.Model(&database.ComplianceReport{}).Count(&total)
	database.DB.Order("created_at DESC").Limit(size).Offset(offset).Find(&reports)

	return map[string]interface{}{
		"total": total,
		"page":  page,
		"size":  size,
		"list":  reports,
	}
}

func AutoSubmitDailyReport() {
	reports, err := GenerateComplianceReport("daily")
	if err != nil {
		return
	}
	SubmitReport(reports.ID, "system_auto")
}
