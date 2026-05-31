package routes

import (
	"nft-audit-system/handlers"

	"github.com/labstack/echo/v4"
)

func Register(e *echo.Echo) {
	api := e.Group("/api")

	api.GET("/health", handlers.HealthCheck)

	dashboard := api.Group("/dashboard")
	dashboard.GET("/stats", handlers.GetDashboardStats)
	dashboard.GET("/charts/tx-volume", handlers.GetTxVolumeChart)
	dashboard.GET("/charts/anomaly-trend", handlers.GetAnomalyTrendChart)

	transactions := api.Group("/transactions")
	transactions.GET("", handlers.GetTransactions)
	transactions.GET("/:hash", handlers.GetTransactionByHash)
	transactions.GET("/audit", handlers.GetAuditTransactions)
	transactions.POST("/:id/report", handlers.ReportTransaction)

	anomaly := api.Group("/anomaly")
	anomaly.GET("/alerts", handlers.GetAnomalyAlerts)
	anomaly.GET("/alerts/:id", handlers.GetAlertDetail)
	anomaly.PUT("/alerts/:id/handle", handlers.HandleAlert)
	anomaly.GET("/stats", handlers.GetAnomalyStats)
	anomaly.GET("/rules", handlers.GetAnomalyRules)

	compliance := api.Group("/compliance")
	compliance.GET("/reports", handlers.GetComplianceReports)
	compliance.GET("/reports/:id", handlers.GetReportDetail)
	compliance.POST("/reports/generate", handlers.GenerateReport)
	compliance.POST("/reports/:id/submit", handlers.SubmitReport)
	compliance.POST("/reports/:id/ack", handlers.AcknowledgeReport)
	compliance.GET("/stats", handlers.GetComplianceStats)

	blockchain := api.Group("/blockchain")
	blockchain.GET("/blocks/latest", handlers.GetLatestBlock)
	blockchain.GET("/blocks/:number", handlers.GetBlockByNumber)
	blockchain.GET("/blocks", handlers.GetRecentBlocks)
	blockchain.GET("/transactions/:hash", handlers.GetBlockchainTx)
	blockchain.GET("/address/:addr", handlers.GetAddressInfo)
	blockchain.GET("/stats", handlers.GetChainStats)

	nft := api.Group("/nft")
	nft.GET("/collections", handlers.GetCollections)
	nft.GET("/collections/:id", handlers.GetCollectionDetail)
	nft.GET("/collections/:id/items", handlers.GetCollectionItems)
	nft.GET("/items/:tokenId", handlers.GetNFTItem)

	blacklist := api.Group("/blacklist")
	blacklist.GET("", handlers.GetBlacklist)
	blacklist.POST("", handlers.AddToBlacklist)
	blacklist.DELETE("/:id", handlers.RemoveFromBlacklist)

	api.GET("/search", handlers.GlobalSearch)
}
