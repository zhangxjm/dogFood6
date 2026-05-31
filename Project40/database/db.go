package database

import (
	"fmt"
	"log"

	"freight-dispatch/models"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Init(dbPath string) error {
	var err error
	DB, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		return fmt.Errorf("failed to connect database: %w", err)
	}

	err = DB.AutoMigrate(&models.Vehicle{}, &models.Route{}, &models.Order{}, &models.DeliveryStatus{})
	if err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	seedData()
	return nil
}

func seedData() {
	var vehicleCount int64
	DB.Model(&models.Vehicle{}).Count(&vehicleCount)
	if vehicleCount > 0 {
		return
	}

	log.Println("Initializing seed data...")

	vehicles := []models.Vehicle{
		{LicensePlate: "京A12345", VehicleType: "轻型厢式货车", LoadCapacity: 2.0, DriverName: "张伟", DriverPhone: "13800138001", Status: "可用"},
		{LicensePlate: "京B23456", VehicleType: "中型平板车", LoadCapacity: 5.0, DriverName: "李强", DriverPhone: "13800138002", Status: "可用"},
		{LicensePlate: "京C34567", VehicleType: "重型厢式货车", LoadCapacity: 10.0, DriverName: "王刚", DriverPhone: "13800138003", Status: "可用"},
		{LicensePlate: "京D45678", VehicleType: "轻型冷藏车", LoadCapacity: 3.0, DriverName: "赵明", DriverPhone: "13800138004", Status: "维修中"},
		{LicensePlate: "京E56789", VehicleType: "中型厢式货车", LoadCapacity: 8.0, DriverName: "刘洋", DriverPhone: "13800138005", Status: "可用"},
	}
	for i := range vehicles {
		DB.Create(&vehicles[i])
	}

	routes := []models.Route{
		{Name: "朝阳-海淀线", StartPoint: "朝阳区望京物流园", EndPoint: "海淀区中关村配送中心", Distance: 18.5, EstimatedTime: 45},
		{Name: "丰台-大兴线", StartPoint: "丰台区花乡货运站", EndPoint: "大兴区亦庄开发区仓库", Distance: 25.0, EstimatedTime: 55},
		{Name: "通州-顺义线", StartPoint: "通州区马驹桥物流港", EndPoint: "顺义区天竺综合保税区", Distance: 32.0, EstimatedTime: 65},
		{Name: "西城-昌平线", StartPoint: "西城区广安门货运点", EndPoint: "昌平区回龙观配送站", Distance: 22.0, EstimatedTime: 50},
	}
	for i := range routes {
		DB.Create(&routes[i])
	}

	orders := []models.Order{
		{OrderNo: "ORD20260530001", VehicleID: 1, RouteID: 1, CargoName: "电子产品", CargoWeight: 1.5, ShipperName: "陈建华", ShipperPhone: "13900139001", ReceiverName: "周丽萍", ReceiverPhone: "13900139002", Status: "已送达"},
		{OrderNo: "ORD20260530002", VehicleID: 2, RouteID: 2, CargoName: "日用百货", CargoWeight: 4.0, ShipperName: "吴小明", ShipperPhone: "13900139003", ReceiverName: "郑芳", ReceiverPhone: "13900139004", Status: "运输中"},
		{OrderNo: "ORD20260530003", VehicleID: 3, RouteID: 3, CargoName: "生鲜食品", CargoWeight: 8.0, ShipperName: "孙立", ShipperPhone: "13900139005", ReceiverName: "马超", ReceiverPhone: "13900139006", Status: "运输中"},
		{OrderNo: "ORD20260530004", VehicleID: 5, RouteID: 4, CargoName: "办公家具", CargoWeight: 6.0, ShipperName: "黄海", ShipperPhone: "13900139007", ReceiverName: "林小红", ReceiverPhone: "13900139008", Status: "待调度"},
		{OrderNo: "ORD20260530005", VehicleID: 1, RouteID: 2, CargoName: "服装纺织", CargoWeight: 1.8, ShipperName: "杨光", ShipperPhone: "13900139009", ReceiverName: "何敏", ReceiverPhone: "13900139010", Status: "已送达"},
		{OrderNo: "ORD20260530006", VehicleID: 2, RouteID: 1, CargoName: "五金建材", CargoWeight: 4.5, ShipperName: "徐鹏", ShipperPhone: "13900139011", ReceiverName: "罗琳", ReceiverPhone: "13900139012", Status: "已取消"},
	}
	for i := range orders {
		DB.Create(&orders[i])
	}

	deliveries := []models.DeliveryStatus{
		{OrderID: 1, Status: "已揽收", Location: "朝阳区望京物流园", Remark: "货物已揽收"},
		{OrderID: 1, Status: "运输中", Location: "北四环中路", Remark: "运输途中"},
		{OrderID: 1, Status: "派送中", Location: "海淀区中关村", Remark: "正在派送"},
		{OrderID: 1, Status: "已签收", Location: "海淀区中关村配送中心", Remark: "收件人已签收"},
		{OrderID: 2, Status: "已揽收", Location: "丰台区花乡货运站", Remark: "货物已揽收"},
		{OrderID: 2, Status: "运输中", Location: "南四环", Remark: "运输途中，预计30分钟到达"},
		{OrderID: 3, Status: "已揽收", Location: "通州区马驹桥物流港", Remark: "货物已揽收"},
		{OrderID: 3, Status: "运输中", Location: "京通快速路", Remark: "运输途中"},
		{OrderID: 4, Status: "已揽收", Location: "西城区广安门货运点", Remark: "等待调度车辆"},
		{OrderID: 5, Status: "已揽收", Location: "丰台区花乡货运站", Remark: "货物已揽收"},
		{OrderID: 5, Status: "运输中", Location: "京开高速", Remark: "运输途中"},
		{OrderID: 5, Status: "已签收", Location: "大兴区亦庄开发区仓库", Remark: "收件人已签收"},
	}
	for i := range deliveries {
		DB.Create(&deliveries[i])
	}

	log.Println("Seed data initialized successfully")
}
