package handlers

import (
	"net/http"
	"strconv"
	"time"

	"nft-audit-system/database"
	"nft-audit-system/services"

	"github.com/labstack/echo/v4"
)

type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

func jsonResponse(c echo.Context, code int, message string, data interface{}) error {
	return c.JSON(code, Response{
		Code:    code,
		Message: message,
		Data:    data,
	})
}

func HealthCheck(c echo.Context) error {
	return jsonResponse(c, http.StatusOK, "OK", map[string]interface{}{
		"timestamp": time.Now().Unix(),
		"status":    "healthy",
	})
}

func GetDashboardStats(c echo.Context) error {
	chainStats := services.GetChainStats()
	anomalyStats := services.GetAnomalyStats()
	complianceStats := services.GetComplianceStats()

	return jsonResponse(c, http.StatusOK, "success", map[string]interface{}{
		"chain":      chainStats,
		"anomaly":    anomalyStats,
		"compliance": complianceStats,
	})
}

func GetTxVolumeChart(c echo.Context) error {
	days := 7
	if d := c.QueryParam("days"); d != "" {
		if n, err := strconv.Atoi(d); err == nil {
			days = n
		}
	}

	result := make([]map[string]interface{}, days)
	for i := 0; i < days; i++ {
		date := time.Now().AddDate(0, 0, -days+i+1).Truncate(24 * time.Hour)
		nextDate := date.AddDate(0, 0, 1)

		var count int64
		var volume float64
		database.DB.Model(&database.Transaction{}).
			Where("tx_timestamp >= ? AND tx_timestamp < ?", date, nextDate).
			Count(&count).
			Select("COALESCE(SUM(price), 0)").Scan(&volume)

		result[i] = map[string]interface{}{
			"date":   date.Format("2006-01-02"),
			"count":  count,
			"volume": volume,
		}
	}

	return jsonResponse(c, http.StatusOK, "success", result)
}

func GetAnomalyTrendChart(c echo.Context) error {
	days := 7
	if d := c.QueryParam("days"); d != "" {
		if n, err := strconv.Atoi(d); err == nil {
			days = n
		}
	}
	result := services.GetAnomalyTrend(days)
	return jsonResponse(c, http.StatusOK, "success", result)
}

func GetTransactions(c echo.Context) error {
	page, _ := strconv.Atoi(c.QueryParam("page"))
	size, _ := strconv.Atoi(c.QueryParam("size"))
	if page < 1 {
		page = 1
	}
	if size < 1 || size > 100 {
		size = 20
	}

	var txs []database.Transaction
	var total int64

	query := database.DB.Model(&database.Transaction{})

	if collectionID := c.QueryParam("collectionId"); collectionID != "" {
		query = query.Where("collection_id = ?", collectionID)
	}
	if addr := c.QueryParam("address"); addr != "" {
		query = query.Where("from_addr = ? OR to_addr = ?", addr, addr)
	}
	if isAnomaly := c.QueryParam("isAnomaly"); isAnomaly != "" {
		query = query.Where("is_anomaly = ?", isAnomaly == "true")
	}

	query.Count(&total)
	query.Order("tx_timestamp DESC").Limit(size).Offset((page - 1) * size).Find(&txs)

	return jsonResponse(c, http.StatusOK, "success", map[string]interface{}{
		"total": total,
		"page":  page,
		"size":  size,
		"list":  txs,
	})
}

func GetTransactionByHash(c echo.Context) error {
	hash := c.Param("hash")
	data, err := services.GetTransactionDetail(hash)
	if err != nil {
		return jsonResponse(c, http.StatusNotFound, "transaction not found", nil)
	}
	return jsonResponse(c, http.StatusOK, "success", data)
}

func GetAuditTransactions(c echo.Context) error {
	page, _ := strconv.Atoi(c.QueryParam("page"))
	size, _ := strconv.Atoi(c.QueryParam("size"))
	if page < 1 {
		page = 1
	}
	if size < 1 || size > 100 {
		size = 20
	}

	var txs []database.Transaction
	var total int64

	query := database.DB.Model(&database.Transaction{}).Where("is_anomaly = ? OR reported = ?", true, true)

	if status := c.QueryParam("status"); status != "" {
		if status == "reported" {
			query = query.Where("reported = ?", true)
		} else if status == "anomaly" {
			query = query.Where("is_anomaly = ?", true)
		}
	}

	query.Count(&total)
	query.Order("tx_timestamp DESC").Limit(size).Offset((page - 1) * size).Find(&txs)

	return jsonResponse(c, http.StatusOK, "success", map[string]interface{}{
		"total": total,
		"page":  page,
		"size":  size,
		"list":  txs,
	})
}

func ReportTransaction(c echo.Context) error {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := database.DB.Model(&database.Transaction{}).
		Where("id = ?", id).
		Update("reported", true).Error; err != nil {
		return jsonResponse(c, http.StatusInternalServerError, err.Error(), nil)
	}
	return jsonResponse(c, http.StatusOK, "reported successfully", nil)
}

func GetAnomalyAlerts(c echo.Context) error {
	page, _ := strconv.Atoi(c.QueryParam("page"))
	size, _ := strconv.Atoi(c.QueryParam("size"))
	if page < 1 {
		page = 1
	}
	if size < 1 || size > 100 {
		size = 20
	}

	var alerts []database.AnomalyAlert
	var total int64

	query := database.DB.Model(&database.AnomalyAlert{})

	if status := c.QueryParam("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if severity := c.QueryParam("severity"); severity != "" {
		query = query.Where("severity = ?", severity)
	}

	query.Count(&total)
	query.Order("created_at DESC").Limit(size).Offset((page - 1) * size).Find(&alerts)

	return jsonResponse(c, http.StatusOK, "success", map[string]interface{}{
		"total": total,
		"page":  page,
		"size":  size,
		"list":  alerts,
	})
}

func GetAlertDetail(c echo.Context) error {
	id, _ := strconv.Atoi(c.Param("id"))

	var alert database.AnomalyAlert
	if err := database.DB.First(&alert, id).Error; err != nil {
		return jsonResponse(c, http.StatusNotFound, "alert not found", nil)
	}

	var tx database.Transaction
	database.DB.First(&tx, alert.TxID)

	return jsonResponse(c, http.StatusOK, "success", map[string]interface{}{
		"alert":       alert,
		"transaction": tx,
	})
}

func HandleAlert(c echo.Context) error {
	id, _ := strconv.Atoi(c.Param("id"))

	var req struct {
		Status     string `json:"status"`
		HandledBy  string `json:"handledBy"`
		HandleNote string `json:"handleNote"`
	}

	if err := c.Bind(&req); err != nil {
		return jsonResponse(c, http.StatusBadRequest, "invalid request", nil)
	}

	now := time.Now()
	updates := map[string]interface{}{
		"status":      req.Status,
		"handled_by":  req.HandledBy,
		"handled_at":  &now,
		"handle_note": req.HandleNote,
	}

	if err := database.DB.Model(&database.AnomalyAlert{}).
		Where("id = ?", id).Updates(updates).Error; err != nil {
		return jsonResponse(c, http.StatusInternalServerError, err.Error(), nil)
	}

	return jsonResponse(c, http.StatusOK, "handled successfully", nil)
}

func GetAnomalyStats(c echo.Context) error {
	stats := services.GetAnomalyStats()
	return jsonResponse(c, http.StatusOK, "success", stats)
}

func GetAnomalyRules(c echo.Context) error {
	return jsonResponse(c, http.StatusOK, "success", services.AnomalyRules)
}

func GetComplianceReports(c echo.Context) error {
	page, _ := strconv.Atoi(c.QueryParam("page"))
	size, _ := strconv.Atoi(c.QueryParam("size"))
	if page < 1 {
		page = 1
	}
	if size < 1 || size > 100 {
		size = 20
	}

	result := services.GetReportHistory(page, size)
	return jsonResponse(c, http.StatusOK, "success", result)
}

func GetReportDetail(c echo.Context) error {
	id, _ := strconv.Atoi(c.Param("id"))

	var report database.ComplianceReport
	if err := database.DB.First(&report, id).Error; err != nil {
		return jsonResponse(c, http.StatusNotFound, "report not found", nil)
	}

	return jsonResponse(c, http.StatusOK, "success", report)
}

func GenerateReport(c echo.Context) error {
	var req struct {
		ReportType string `json:"reportType"`
	}
	if err := c.Bind(&req); err != nil {
		return jsonResponse(c, http.StatusBadRequest, "invalid request", nil)
	}

	report, err := services.GenerateComplianceReport(req.ReportType)
	if err != nil {
		return jsonResponse(c, http.StatusInternalServerError, err.Error(), nil)
	}

	return jsonResponse(c, http.StatusOK, "generated successfully", report)
}

func SubmitReport(c echo.Context) error {
	id, _ := strconv.Atoi(c.Param("id"))

	var req struct {
		SubmittedBy string `json:"submittedBy"`
	}
	if err := c.Bind(&req); err != nil {
		req.SubmittedBy = "system"
	}

	if err := services.SubmitReport(uint(id), req.SubmittedBy); err != nil {
		return jsonResponse(c, http.StatusInternalServerError, err.Error(), nil)
	}

	return jsonResponse(c, http.StatusOK, "submitted successfully", nil)
}

func AcknowledgeReport(c echo.Context) error {
	id, _ := strconv.Atoi(c.Param("id"))

	if err := services.AcknowledgeReport(uint(id)); err != nil {
		return jsonResponse(c, http.StatusInternalServerError, err.Error(), nil)
	}

	return jsonResponse(c, http.StatusOK, "acknowledged successfully", nil)
}

func GetComplianceStats(c echo.Context) error {
	stats := services.GetComplianceStats()
	return jsonResponse(c, http.StatusOK, "success", stats)
}

func GetLatestBlock(c echo.Context) error {
	block, err := services.GetLatestBlock()
	if err != nil {
		return jsonResponse(c, http.StatusInternalServerError, err.Error(), nil)
	}
	return jsonResponse(c, http.StatusOK, "success", block)
}

func GetBlockByNumber(c echo.Context) error {
	num, err := strconv.ParseUint(c.Param("number"), 10, 64)
	if err != nil {
		return jsonResponse(c, http.StatusBadRequest, "invalid block number", nil)
	}

	block, err := services.GetBlockByNumber(num)
	if err != nil {
		return jsonResponse(c, http.StatusNotFound, "block not found", nil)
	}
	return jsonResponse(c, http.StatusOK, "success", block)
}

func GetRecentBlocks(c echo.Context) error {
	count, _ := strconv.Atoi(c.QueryParam("count"))
	if count < 1 || count > 100 {
		count = 10
	}

	blocks := services.GetRecentBlocks(count)
	return jsonResponse(c, http.StatusOK, "success", blocks)
}

func GetBlockchainTx(c echo.Context) error {
	hash := c.Param("hash")
	data, err := services.GetTransactionDetail(hash)
	if err != nil {
		return jsonResponse(c, http.StatusNotFound, "transaction not found", nil)
	}
	return jsonResponse(c, http.StatusOK, "success", data)
}

func GetAddressInfo(c echo.Context) error {
	addr := c.Param("addr")

	balance := services.GetAddressBalance(addr)

	page, _ := strconv.Atoi(c.QueryParam("page"))
	size, _ := strconv.Atoi(c.QueryParam("size"))
	if page < 1 {
		page = 1
	}
	if size < 1 {
		size = 10
	}

	history := services.GetAddressHistory(addr, page, size)

	return jsonResponse(c, http.StatusOK, "success", map[string]interface{}{
		"balance": balance,
		"history": history,
	})
}

func GetChainStats(c echo.Context) error {
	stats := services.GetChainStats()
	return jsonResponse(c, http.StatusOK, "success", stats)
}

func GetCollections(c echo.Context) error {
	page, _ := strconv.Atoi(c.QueryParam("page"))
	size, _ := strconv.Atoi(c.QueryParam("size"))
	if page < 1 {
		page = 1
	}
	if size < 1 || size > 100 {
		size = 20
	}

	var collections []database.NFTCollection
	var total int64

	query := database.DB.Model(&database.NFTCollection{})
	if verified := c.QueryParam("verified"); verified != "" {
		query = query.Where("is_verified = ?", verified == "true")
	}

	query.Count(&total)
	query.Order("created_at DESC").Limit(size).Offset((page - 1) * size).Find(&collections)

	result := make([]map[string]interface{}, len(collections))
	for i, col := range collections {
		stats := services.GetCollectionStats(col.ID)
		result[i] = map[string]interface{}{
			"collection": col,
			"stats":      stats,
		}
	}

	return jsonResponse(c, http.StatusOK, "success", map[string]interface{}{
		"total": total,
		"page":  page,
		"size":  size,
		"list":  result,
	})
}

func GetCollectionDetail(c echo.Context) error {
	id, _ := strconv.Atoi(c.Param("id"))

	var collection database.NFTCollection
	if err := database.DB.First(&collection, id).Error; err != nil {
		return jsonResponse(c, http.StatusNotFound, "collection not found", nil)
	}

	stats := services.GetCollectionStats(uint(id))

	return jsonResponse(c, http.StatusOK, "success", map[string]interface{}{
		"collection": collection,
		"stats":      stats,
	})
}

func GetCollectionItems(c echo.Context) error {
	id, _ := strconv.Atoi(c.Param("id"))
	page, _ := strconv.Atoi(c.QueryParam("page"))
	size, _ := strconv.Atoi(c.QueryParam("size"))
	if page < 1 {
		page = 1
	}
	if size < 1 || size > 100 {
		size = 20
	}

	var items []database.NFTItem
	var total int64

	database.DB.Model(&database.NFTItem{}).Where("collection_id = ?", id).Count(&total)
	database.DB.Where("collection_id = ?", id).Order("created_at DESC").
		Limit(size).Offset((page - 1) * size).Find(&items)

	return jsonResponse(c, http.StatusOK, "success", map[string]interface{}{
		"total": total,
		"page":  page,
		"size":  size,
		"list":  items,
	})
}

func GetNFTItem(c echo.Context) error {
	tokenID := c.Param("tokenId")

	var item database.NFTItem
	if err := database.DB.Where("token_id = ?", tokenID).First(&item).Error; err != nil {
		return jsonResponse(c, http.StatusNotFound, "NFT item not found", nil)
	}

	return jsonResponse(c, http.StatusOK, "success", item)
}

func GetBlacklist(c echo.Context) error {
	page, _ := strconv.Atoi(c.QueryParam("page"))
	size, _ := strconv.Atoi(c.QueryParam("size"))
	if page < 1 {
		page = 1
	}
	if size < 1 || size > 100 {
		size = 20
	}

	var addrs []database.BlacklistAddr
	var total int64

	query := database.DB.Model(&database.BlacklistAddr{})
	if active := c.QueryParam("active"); active != "" {
		query = query.Where("is_active = ?", active == "true")
	}

	query.Count(&total)
	query.Order("created_at DESC").Limit(size).Offset((page - 1) * size).Find(&addrs)

	return jsonResponse(c, http.StatusOK, "success", map[string]interface{}{
		"total": total,
		"page":  page,
		"size":  size,
		"list":  addrs,
	})
}

func AddToBlacklist(c echo.Context) error {
	var req struct {
		Address string `json:"address"`
		Reason  string `json:"reason"`
		Source  string `json:"source"`
		AddedBy string `json:"addedBy"`
	}

	if err := c.Bind(&req); err != nil {
		return jsonResponse(c, http.StatusBadRequest, "invalid request", nil)
	}

	addr := database.BlacklistAddr{
		Address:  req.Address,
		Reason:   req.Reason,
		Source:   req.Source,
		AddedBy:  req.AddedBy,
		IsActive: true,
		CreatedAt: time.Now(),
	}

	if err := database.DB.Create(&addr).Error; err != nil {
		return jsonResponse(c, http.StatusInternalServerError, err.Error(), nil)
	}

	return jsonResponse(c, http.StatusOK, "added successfully", addr)
}

func RemoveFromBlacklist(c echo.Context) error {
	id, _ := strconv.Atoi(c.Param("id"))

	if err := database.DB.Model(&database.BlacklistAddr{}).
		Where("id = ?", id).Update("is_active", false).Error; err != nil {
		return jsonResponse(c, http.StatusInternalServerError, err.Error(), nil)
	}

	return jsonResponse(c, http.StatusOK, "removed successfully", nil)
}

func GlobalSearch(c echo.Context) error {
	query := c.QueryParam("q")
	if query == "" {
		return jsonResponse(c, http.StatusOK, "success", map[string]interface{}{})
	}

	var collections []database.NFTCollection
	var transactions []database.Transaction
	var items []database.NFTItem

	database.DB.Where("name LIKE ? OR contract_addr LIKE ?", "%"+query+"%", "%"+query+"%").
		Limit(5).Find(&collections)

	database.DB.Where("tx_hash LIKE ? OR from_addr LIKE ? OR to_addr LIKE ?", "%"+query+"%", "%"+query+"%", "%"+query+"%").
		Limit(10).Order("tx_timestamp DESC").Find(&transactions)

	database.DB.Where("token_id LIKE ? OR name LIKE ?", "%"+query+"%", "%"+query+"%").
		Limit(10).Find(&items)

	return jsonResponse(c, http.StatusOK, "success", map[string]interface{}{
		"collections":  collections,
		"transactions": transactions,
		"items":        items,
	})
}
