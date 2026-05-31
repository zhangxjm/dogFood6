package services

import (
	"fmt"
	"nft-audit-system/database"
	"time"
)

type AnomalyRule struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Threshold   float64 `json:"threshold"`
	Weight      float64 `json:"weight"`
	Enabled     bool    `json:"enabled"`
}

var AnomalyRules = []AnomalyRule{
	{
		ID:          "price_deviation",
		Name:        "价格异常偏离",
		Description: "交易价格偏离该藏品历史平均价格超过阈值",
		Threshold:   3.0,
		Weight:      0.8,
		Enabled:     true,
	},
	{
		ID:          "wash_trading",
		Name:        "洗售交易检测",
		Description: "同一地址在短时间内进行买卖交易",
		Threshold:   1.0,
		Weight:      0.9,
		Enabled:     true,
	},
	{
		ID:          "blacklist_address",
		Name:        "黑名单地址交互",
		Description: "交易涉及黑名单中的地址",
		Threshold:   0.5,
		Weight:      1.0,
		Enabled:     true,
	},
	{
		ID:          "high_frequency",
		Name:        "高频交易检测",
		Description: "地址在短时间内进行大量交易",
		Threshold:   10.0,
		Weight:      0.7,
		Enabled:     true,
	},
	{
		ID:          "unusual_gas",
		Name:        "异常Gas费用",
		Description: "交易Gas费用显著高于平均值",
		Threshold:   2.0,
		Weight:      0.5,
		Enabled:     true,
	},
}

func CheckTransactionAnomaly(tx *database.Transaction) (bool, string, float64) {
	var totalScore float64
	var anomalyTypes []string

	cacheKey := fmt.Sprintf("collection:%d:price_stats", tx.CollectionID)
	var priceStats map[string]float64
	if err := CacheGet(cacheKey, &priceStats); err != nil {
		priceStats = calculatePriceStats(tx.CollectionID)
		CacheSet(cacheKey, priceStats, 5*time.Minute)
	}

	if priceStats["avgPrice"] > 0 {
		deviation := tx.Price / priceStats["avgPrice"]
		if deviation > AnomalyRules[0].Threshold || deviation < 1/AnomalyRules[0].Threshold {
			totalScore += AnomalyRules[0].Weight
			anomalyTypes = append(anomalyTypes, "price_anomaly")
		}
	}

	if isWashTrade(tx.FromAddr, tx.ToAddr, tx.TokenID) {
		totalScore += AnomalyRules[1].Weight
		anomalyTypes = append(anomalyTypes, "wash_trading")
	}

	if isBlacklistAddress(tx.FromAddr) || isBlacklistAddress(tx.ToAddr) {
		totalScore += AnomalyRules[2].Weight
		anomalyTypes = append(anomalyTypes, "blacklist_addr")
	}

	freq := getAddressFrequency(tx.FromAddr)
	if freq > AnomalyRules[3].Threshold {
		totalScore += AnomalyRules[3].Weight * 0.7
		anomalyTypes = append(anomalyTypes, "high_freq_trade")
	}

	isAnomaly := totalScore >= 0.6
	anomalyType := ""
	if len(anomalyTypes) > 0 {
		anomalyType = anomalyTypes[0]
	}

	return isAnomaly, anomalyType, totalScore
}

func calculatePriceStats(collectionID uint) map[string]float64 {
	var avgPrice, stdDev float64
	database.DB.Model(&database.Transaction{}).
		Where("collection_id = ? AND status = 'success'", collectionID).
		Select("AVG(price)").Scan(&avgPrice)

	return map[string]float64{
		"avgPrice": avgPrice,
		"stdDev":   stdDev,
	}
}

func isWashTrade(fromAddr, toAddr, tokenID string) bool {
	var count int64
	oneHourAgo := time.Now().Add(-1 * time.Hour)

	database.DB.Model(&database.Transaction{}).
		Where("(from_addr = ? AND to_addr = ?) OR (from_addr = ? AND to_addr = ?)",
			fromAddr, toAddr, toAddr, fromAddr).
		Where("token_id = ?", tokenID).
		Where("tx_timestamp > ?", oneHourAgo).
		Count(&count)

	return count >= 1
}

func isBlacklistAddress(addr string) bool {
	var count int64
	database.DB.Model(&database.BlacklistAddr{}).
		Where("address = ? AND is_active = ?", addr, true).
		Count(&count)
	return count > 0
}

func getAddressFrequency(addr string) float64 {
	var count int64
	oneHourAgo := time.Now().Add(-1 * time.Hour)

	database.DB.Model(&database.Transaction{}).
		Where("from_addr = ? OR to_addr = ?", addr, addr).
		Where("tx_timestamp > ?", oneHourAgo).
		Count(&count)

	return float64(count)
}

func CreateAnomalyAlert(tx database.Transaction, anomalyType string, score float64) (*database.AnomalyAlert, error) {
	severity := "low"
	if score >= 0.9 {
		severity = "critical"
	} else if score >= 0.75 {
		severity = "high"
	} else if score >= 0.6 {
		severity = "medium"
	}

	alert := database.AnomalyAlert{
		AlertID:       fmt.Sprintf("ALT-%d", time.Now().UnixNano()),
		TxID:          tx.ID,
		AlertType:     anomalyType,
		Severity:      severity,
		Description:   fmt.Sprintf("检测到异常交易: %s, 风险评分: %.2f", anomalyType, score),
		RiskScore:     score,
		InvolvedAddrs: fmt.Sprintf("[%s, %s]", tx.FromAddr, tx.ToAddr),
		Status:        "pending",
		CreatedAt:     time.Now(),
	}

	if err := database.DB.Create(&alert).Error; err != nil {
		return nil, err
	}

	alertMsg := AlertMessage{
		Type:    "ANOMALY_DETECTED",
		AlertID: alert.AlertID,
		Data:    alert,
	}
	PublishAlert(alertMsg)

	return &alert, nil
}

func GetAnomalyStats() map[string]interface{} {
	var totalAlerts, pendingAlerts, resolvedAlerts int64
	var highRiskCount, criticalCount int64

	database.DB.Model(&database.AnomalyAlert{}).Count(&totalAlerts)
	database.DB.Model(&database.AnomalyAlert{}).Where("status = ?", "pending").Count(&pendingAlerts)
	database.DB.Model(&database.AnomalyAlert{}).Where("status = ?", "resolved").Count(&resolvedAlerts)
	database.DB.Model(&database.AnomalyAlert{}).Where("severity = ?", "high").Count(&highRiskCount)
	database.DB.Model(&database.AnomalyAlert{}).Where("severity = ?", "critical").Count(&criticalCount)

	var todayCount int64
	today := time.Now().Truncate(24 * time.Hour)
	database.DB.Model(&database.AnomalyAlert{}).Where("created_at >= ?", today).Count(&todayCount)

	return map[string]interface{}{
		"totalAlerts":     totalAlerts,
		"pendingAlerts":   pendingAlerts,
		"resolvedAlerts":  resolvedAlerts,
		"highRiskCount":   highRiskCount,
		"criticalCount":   criticalCount,
		"todayNewAlerts":  todayCount,
	}
}

func StartTransactionMonitor() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			monitorNewTransactions()
		}
	}
}

func monitorNewTransactions() {
	cacheKey := "monitor:last_checked_tx"
	var lastTxID uint
	CacheGet(cacheKey, &lastTxID)

	var newTxs []database.Transaction
	database.DB.Where("id > ?", lastTxID).Order("id ASC").Find(&newTxs)

	if len(newTxs) == 0 {
		return
	}

	for _, tx := range newTxs {
		isAnomaly, anomalyType, score := CheckTransactionAnomaly(&tx)
		if isAnomaly {
			tx.IsAnomaly = true
			tx.AnomalyType = anomalyType
			tx.AnomalyScore = score
			database.DB.Save(&tx)

			CreateAnomalyAlert(tx, anomalyType, score)
		}

		if tx.ID > lastTxID {
			lastTxID = tx.ID
		}
	}

	CacheSet(cacheKey, lastTxID, 24*time.Hour)
}

func GetAnomalyTrend(days int) []map[string]interface{} {
	result := make([]map[string]interface{}, days)

	for i := days - 1; i >= 0; i-- {
		date := time.Now().AddDate(0, 0, -i).Truncate(24 * time.Hour)
		nextDate := date.AddDate(0, 0, 1)

		var count int64
		database.DB.Model(&database.AnomalyAlert{}).
			Where("created_at >= ? AND created_at < ?", date, nextDate).
			Count(&count)

		var totalTx int64
		database.DB.Model(&database.Transaction{}).
			Where("tx_timestamp >= ? AND tx_timestamp < ?", date, nextDate).
			Count(&totalTx)

		rate := 0.0
		if totalTx > 0 {
			rate = float64(count) / float64(totalTx) * 100
		}

		result[days-1-i] = map[string]interface{}{
			"date":      date.Format("2006-01-02"),
			"count":     count,
			"totalTx":   totalTx,
			"anomalyRate": rate,
		}
	}

	return result
}
