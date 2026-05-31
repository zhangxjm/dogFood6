package database

import (
	"log"
	"nursery-management/models"
	"time"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Init() {
	var err error
	DB, err = gorm.Open(sqlite.Open("nursery.db"), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	err = DB.AutoMigrate(
		&models.SeedlingCategory{},
		&models.PlantingBatch{},
		&models.SeedlingOutput{},
		&models.ShipmentRecord{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	SeedInitialData()
}

func SeedInitialData() {
	var count int64
	DB.Model(&models.SeedlingCategory{}).Count(&count)
	if count > 0 {
		return
	}

	categories := []models.SeedlingCategory{
		{Name: "红枫", ScientificName: "Acer palmatum", Description: "落叶小乔木，观赏价值高", Unit: "株"},
		{Name: "香樟", ScientificName: "Cinnamomum camphora", Description: "常绿大乔木，行道树首选", Unit: "株"},
		{Name: "桂花", ScientificName: "Osmanthus fragrans", Description: "常绿灌木，花香浓郁", Unit: "株"},
		{Name: "紫薇", ScientificName: "Lagerstroemia indica", Description: "落叶灌木，花期长", Unit: "株"},
		{Name: "樱花", ScientificName: "Cerasus serrulata", Description: "落叶乔木，春季开花", Unit: "株"},
		{Name: "红叶石楠", ScientificName: "Photinia serrulata", Description: "常绿灌木，新叶红色", Unit: "株"},
		{Name: "金森女贞", ScientificName: "Ligustrum japonicum", Description: "常绿灌木，叶色金黄", Unit: "株"},
		{Name: "金边黄杨", ScientificName: "Euonymus japonicus", Description: "常绿灌木，叶缘金黄", Unit: "株"},
	}

	for _, cat := range categories {
		DB.Create(&cat)
	}

	batches := []models.PlantingBatch{
		{CategoryID: 1, BatchNo: "HM2024001", PlantingDate: parseDate("2024-03-15"), Quantity: 5000, Location: "A区-1号圃地", Status: "生长中"},
		{CategoryID: 1, BatchNo: "HM2024002", PlantingDate: parseDate("2024-04-20"), Quantity: 3000, Location: "A区-2号圃地", Status: "生长中"},
		{CategoryID: 2, BatchNo: "XZ2024001", PlantingDate: parseDate("2024-02-28"), Quantity: 2000, Location: "B区-1号圃地", Status: "可出苗"},
		{CategoryID: 3, BatchNo: "GH2024001", PlantingDate: parseDate("2024-03-10"), Quantity: 4000, Location: "C区-1号圃地", Status: "生长中"},
		{CategoryID: 5, BatchNo: "YH2023001", PlantingDate: parseDate("2023-10-15"), Quantity: 1500, Location: "D区-1号圃地", Status: "可出苗"},
		{CategoryID: 6, BatchNo: "HY2024001", PlantingDate: parseDate("2024-05-01"), Quantity: 8000, Location: "E区-1号圃地", Status: "苗期"},
	}

	for _, batch := range batches {
		DB.Create(&batch)
	}

	outputs := []models.SeedlingOutput{
		{BatchID: 3, OutputDate: parseDate("2024-05-10"), Quantity: 500, Quality: "一级", Operator: "张三"},
		{BatchID: 3, OutputDate: parseDate("2024-05-15"), Quantity: 300, Quality: "二级", Operator: "张三"},
		{BatchID: 5, OutputDate: parseDate("2024-04-20"), Quantity: 200, Quality: "一级", Operator: "李四"},
		{BatchID: 5, OutputDate: parseDate("2024-04-25"), Quantity: 150, Quality: "一级", Operator: "李四"},
		{BatchID: 5, OutputDate: parseDate("2024-05-05"), Quantity: 100, Quality: "二级", Operator: "李四"},
	}

	for _, output := range outputs {
		DB.Create(&output)
	}

	shipments := []models.ShipmentRecord{
		{CustomerName: "上海园林绿化工程有限公司", Contact: "王经理", Phone: "13800138001", Address: "上海市浦东新区", ShipDate: parseDate("2024-05-12"), CategoryID: 2, Quantity: 500, UnitPrice: 120.00, TotalAmount: 60000.00, Status: "已发货", Logistics: "顺丰速运", TrackingNo: "SF1234567890"},
		{CustomerName: "杭州城市建设集团", Contact: "刘总", Phone: "13900139002", Address: "杭州市西湖区", ShipDate: parseDate("2024-04-22"), CategoryID: 5, Quantity: 200, UnitPrice: 280.00, TotalAmount: 56000.00, Status: "已签收", Logistics: "中通快递", TrackingNo: "ZT9876543210"},
		{CustomerName: "南京景观设计公司", Contact: "陈工", Phone: "13700137003", Address: "南京市鼓楼区", ShipDate: parseDate("2024-04-28"), CategoryID: 5, Quantity: 150, UnitPrice: 280.00, TotalAmount: 42000.00, Status: "已签收", Logistics: "圆通速递", TrackingNo: "YT1122334455"},
		{CustomerName: "苏州园林发展股份有限公司", Contact: "周经理", Phone: "13600136004", Address: "苏州市姑苏区", ShipDate: parseDate("2024-05-08"), CategoryID: 5, Quantity: 100, UnitPrice: 260.00, TotalAmount: 26000.00, Status: "运输中", Logistics: "德邦物流", TrackingNo: "DP5566778899"},
	}

	for _, shipment := range shipments {
		DB.Create(&shipment)
	}

	log.Println("Initial data seeded successfully")
}

func parseDate(dateStr string) time.Time {
	t, _ := time.Parse("2006-01-02", dateStr)
	return t
}
