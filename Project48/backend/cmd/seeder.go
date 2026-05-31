package main

import (
	"iiot-predictive-maintenance/internal/model"
	"iiot-predictive-maintenance/internal/pkg/database"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type InitDataSeeder struct{}

func (s *InitDataSeeder) Seed() error {
	passwordHash, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	users := []model.User{
		{
			Username:     "admin",
			PasswordHash: string(passwordHash),
			Role:         "admin",
			Name:         "系统管理员",
			Email:        "admin@example.com",
		},
		{
			Username:     "engineer1",
			PasswordHash: string(passwordHash),
			Role:         "engineer",
			Name:         "张工",
			Email:        "zhang@example.com",
		},
		{
			Username:     "manager1",
			PasswordHash: string(passwordHash),
			Role:         "manager",
			Name:         "李主管",
			Email:        "li@example.com",
		},
	}

	for _, user := range users {
		if err := database.DB.Create(&user).Error; err != nil {
			return err
		}
	}

	installDate1, _ := time.Parse("2006-01-02", "2023-01-15")
	installDate2, _ := time.Parse("2006-01-02", "2023-03-20")
	installDate3, _ := time.Parse("2006-01-02", "2022-06-10")
	installDate4, _ := time.Parse("2006-01-02", "2023-08-01")
	installDate5, _ := time.Parse("2006-01-02", "2022-11-30")
	installDate6, _ := time.Parse("2006-01-02", "2023-05-12")

	devices := []model.Device{
		{
			Name:        "CNC数控车床-001",
			Code:        "CNC-001",
			Type:        "cnc",
			Location:    "车间A-01",
			Status:      "online",
			HealthScore: 92,
			InstallDate: installDate1,
			Description: "高精度数控车床，用于精密零件加工",
		},
		{
			Name:        "工业机器人-002",
			Code:        "ROB-002",
			Type:        "robot",
			Location:    "车间A-02",
			Status:      "online",
			HealthScore: 85,
			InstallDate: installDate2,
			Description: "六轴焊接机器人",
		},
		{
			Name:        "空压机-003",
			Code:        "COMP-003",
			Type:        "compressor",
			Location:    "动力房",
			Status:      "online",
			HealthScore: 78,
			InstallDate: installDate3,
			Description: "螺杆式空气压缩机",
		},
		{
			Name:        "传送带-004",
			Code:        "CONV-004",
			Type:        "conveyor",
			Location:    "车间B",
			Status:      "online",
			HealthScore: 95,
			InstallDate: installDate4,
			Description: "物料传送系统",
		},
		{
			Name:        "注塑机-005",
			Code:        "INJ-005",
			Type:        "injection",
			Location:    "车间C",
			Status:      "warning",
			HealthScore: 65,
			InstallDate: installDate5,
			Description: "精密注塑成型机",
		},
		{
			Name:        "激光切割机-006",
			Code:        "LASER-006",
			Type:        "laser",
			Location:    "车间A-03",
			Status:      "online",
			HealthScore: 88,
			InstallDate: installDate6,
			Description: "光纤激光切割机",
		},
	}

	for i := range devices {
		if err := database.DB.Create(&devices[i]).Error; err != nil {
			return err
		}
	}

	sensors := []model.Sensor{
		{DeviceID: 1, Name: "主轴温度", Type: "temperature", Unit: "°C", MinValue: 20, MaxValue: 80},
		{DeviceID: 1, Name: "振动幅度", Type: "vibration", Unit: "mm/s", MinValue: 0, MaxValue: 10},
		{DeviceID: 1, Name: "主轴转速", Type: "rotation", Unit: "rpm", MinValue: 0, MaxValue: 5000},
		{DeviceID: 1, Name: "负载电流", Type: "current", Unit: "A", MinValue: 0, MaxValue: 50},
		{DeviceID: 2, Name: "关节1温度", Type: "temperature", Unit: "°C", MinValue: 20, MaxValue: 70},
		{DeviceID: 2, Name: "关节2温度", Type: "temperature", Unit: "°C", MinValue: 20, MaxValue: 70},
		{DeviceID: 2, Name: "TCP速度", Type: "velocity", Unit: "m/s", MinValue: 0, MaxValue: 2},
		{DeviceID: 3, Name: "排气压力", Type: "pressure", Unit: "MPa", MinValue: 0, MaxValue: 1.2},
		{DeviceID: 3, Name: "油温", Type: "temperature", Unit: "°C", MinValue: 20, MaxValue: 90},
		{DeviceID: 3, Name: "电机电流", Type: "current", Unit: "A", MinValue: 0, MaxValue: 100},
		{DeviceID: 4, Name: "皮带张力", Type: "tension", Unit: "N", MinValue: 0, MaxValue: 500},
		{DeviceID: 4, Name: "电机转速", Type: "rotation", Unit: "rpm", MinValue: 0, MaxValue: 1500},
		{DeviceID: 5, Name: "料筒温度", Type: "temperature", Unit: "°C", MinValue: 150, MaxValue: 300},
		{DeviceID: 5, Name: "注射压力", Type: "pressure", Unit: "MPa", MinValue: 0, MaxValue: 200},
		{DeviceID: 5, Name: "锁模力", Type: "force", Unit: "kN", MinValue: 0, MaxValue: 5000},
		{DeviceID: 6, Name: "激光器温度", Type: "temperature", Unit: "°C", MinValue: 15, MaxValue: 40},
		{DeviceID: 6, Name: "激光功率", Type: "power", Unit: "W", MinValue: 0, MaxValue: 2000},
		{DeviceID: 6, Name: "切割头位置", Type: "position", Unit: "mm", MinValue: 0, MaxValue: 3000},
	}

	for _, sensor := range sensors {
		if err := database.DB.Create(&sensor).Error; err != nil {
			return err
		}
	}

	parts := []model.InventoryPart{
		{Name: "主轴轴承", SKU: "SKF-6205", Category: "传动部件", Quantity: 15, SafeStock: 10, Unit: "个", Location: "A-01-01", Supplier: "SKF"},
		{Name: "伺服电机", SKU: "MOT-SG-100", Category: "电气部件", Quantity: 5, SafeStock: 8, Unit: "台", Location: "A-02-03", Supplier: "安川"},
		{Name: "液压油", SKU: "OIL-HL-46", Category: "润滑油", Quantity: 200, SafeStock: 150, Unit: "L", Location: "B-01-01", Supplier: "壳牌"},
		{Name: "空气滤芯", SKU: "FIL-AIR-100", Category: "过滤部件", Quantity: 8, SafeStock: 12, Unit: "个", Location: "A-03-01", Supplier: "曼胡默尔"},
		{Name: "同步皮带", SKU: "BELT-T5-1000", Category: "传动部件", Quantity: 12, SafeStock: 10, Unit: "条", Location: "A-01-02", Supplier: "盖茨"},
		{Name: "编码器", SKU: "ENC-1024", Category: "电气部件", Quantity: 3, SafeStock: 5, Unit: "个", Location: "A-02-01", Supplier: "欧姆龙"},
		{Name: "PLC模块", SKU: "PLC-S7-1200", Category: "电气部件", Quantity: 2, SafeStock: 3, Unit: "个", Location: "A-02-02", Supplier: "西门子"},
		{Name: "密封圈套件", SKU: "SEAL-KIT-001", Category: "密封部件", Quantity: 25, SafeStock: 20, Unit: "套", Location: "A-04-01", Supplier: "NOK"},
		{Name: "喷嘴", SKU: "NOZ-INJ-001", Category: "注塑部件", Quantity: 6, SafeStock: 5, Unit: "个", Location: "C-01-01", Supplier: "赫斯基"},
		{Name: "激光保护镜", SKU: "LENS-LASER-001", Category: "光学部件", Quantity: 4, SafeStock: 6, Unit: "片", Location: "A-05-01", Supplier: "II-VI"},
	}

	for _, part := range parts {
		if err := database.DB.Create(&part).Error; err != nil {
			return err
		}
	}

	return nil
}
