package models

import (
	"time"

	"gorm.io/gorm"
)

func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&Product{},
		&Purchase{},
		&Sale{},
	)
}

func SeedData(db *gorm.DB) error {
	var count int64
	db.Model(&Product{}).Count(&count)
	if count > 0 {
		return nil
	}

	products := []Product{
		{Name: "金龙鱼调和油", Category: "食用油", Unit: "桶", Stock: 50, WarningStock: 10, RetailPrice: 75.00, PurchasePrice: 58.00, Supplier: "金龙鱼经销商"},
		{Name: "鲁花花生油", Category: "食用油", Unit: "桶", Stock: 30, WarningStock: 8, RetailPrice: 128.00, PurchasePrice: 98.00, Supplier: "鲁花经销商"},
		{Name: "福临门大米", Category: "粮食", Unit: "袋", Stock: 80, WarningStock: 20, RetailPrice: 65.00, PurchasePrice: 48.00, Supplier: "中粮集团"},
		{Name: "五常大米", Category: "粮食", Unit: "袋", Stock: 45, WarningStock: 15, RetailPrice: 128.00, PurchasePrice: 95.00, Supplier: "五常米业"},
		{Name: "面粉", Category: "粮食", Unit: "袋", Stock: 60, WarningStock: 15, RetailPrice: 42.00, PurchasePrice: 30.00, Supplier: "本地面粉厂"},
		{Name: "东北黑木耳", Category: "干货", Unit: "斤", Stock: 25, WarningStock: 5, RetailPrice: 68.00, PurchasePrice: 45.00, Supplier: "东北特产商行"},
		{Name: "香菇", Category: "干货", Unit: "斤", Stock: 20, WarningStock: 5, RetailPrice: 55.00, PurchasePrice: 38.00, Supplier: "福建特产商行"},
		{Name: "粉丝", Category: "干货", Unit: "袋", Stock: 40, WarningStock: 10, RetailPrice: 15.00, PurchasePrice: 9.00, Supplier: "本地批发"},
		{Name: "花生米", Category: "干货", Unit: "斤", Stock: 35, WarningStock: 8, RetailPrice: 12.00, PurchasePrice: 8.00, Supplier: "本地批发"},
		{Name: "绿豆", Category: "粮食", Unit: "斤", Stock: 30, WarningStock: 8, RetailPrice: 10.00, PurchasePrice: 6.50, Supplier: "本地批发"},
	}

	for _, p := range products {
		if err := db.Create(&p).Error; err != nil {
			return err
		}
	}

	now := time.Now()
	purchases := []Purchase{
		{ProductID: 1, Quantity: 50, UnitPrice: 58.00, TotalAmount: 2900.00, Supplier: "金龙鱼经销商", Operator: "管理员", Remark: "初始进货"},
		{ProductID: 2, Quantity: 30, UnitPrice: 98.00, TotalAmount: 2940.00, Supplier: "鲁花经销商", Operator: "管理员", Remark: "初始进货"},
		{ProductID: 3, Quantity: 80, UnitPrice: 48.00, TotalAmount: 3840.00, Supplier: "中粮集团", Operator: "管理员", Remark: "初始进货"},
		{ProductID: 4, Quantity: 45, UnitPrice: 95.00, TotalAmount: 4275.00, Supplier: "五常米业", Operator: "管理员", Remark: "初始进货"},
		{ProductID: 5, Quantity: 60, UnitPrice: 30.00, TotalAmount: 1800.00, Supplier: "本地面粉厂", Operator: "管理员", Remark: "初始进货"},
	}

	for _, p := range purchases {
		p.CreatedAt = now.AddDate(0, 0, -7)
		if err := db.Create(&p).Error; err != nil {
			return err
		}
	}

	sales := []Sale{
		{ProductID: 1, Quantity: 2, UnitPrice: 75.00, TotalAmount: 150.00, Customer: "散客", Operator: "收银员", Remark: ""},
		{ProductID: 3, Quantity: 1, UnitPrice: 65.00, TotalAmount: 65.00, Customer: "散客", Operator: "收银员", Remark: ""},
		{ProductID: 5, Quantity: 3, UnitPrice: 42.00, TotalAmount: 126.00, Customer: "张女士", Operator: "收银员", Remark: ""},
		{ProductID: 6, Quantity: 0.5, UnitPrice: 68.00, TotalAmount: 34.00, Customer: "散客", Operator: "收银员", Remark: ""},
		{ProductID: 2, Quantity: 1, UnitPrice: 128.00, TotalAmount: 128.00, Customer: "李先生", Operator: "收银员", Remark: ""},
		{ProductID: 4, Quantity: 2, UnitPrice: 128.00, TotalAmount: 256.00, Customer: "王女士", Operator: "收银员", Remark: ""},
		{ProductID: 7, Quantity: 1, UnitPrice: 55.00, TotalAmount: 55.00, Customer: "散客", Operator: "收银员", Remark: ""},
		{ProductID: 10, Quantity: 2, UnitPrice: 10.00, TotalAmount: 20.00, Customer: "散客", Operator: "收银员", Remark: ""},
	}

	for _, s := range sales {
		s.CreatedAt = now.AddDate(0, 0, -3)
		if err := db.Create(&s).Error; err != nil {
			return err
		}
	}

	return nil
}
