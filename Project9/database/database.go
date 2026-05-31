package database

import (
	"fmt"
	"log"
	"time"

	"classroom-booking-system/models"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Init() {
	var err error
	DB, err = gorm.Open(sqlite.Open("classroom_booking.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect database:", err)
	}

	err = DB.AutoMigrate(
		&models.Classroom{},
		&models.Course{},
		&models.Booking{},
		&models.UsageRecord{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	fmt.Println("Database initialized successfully")
	SeedData()
}

func SeedData() {
	var count int64
	DB.Model(&models.Classroom{}).Count(&count)
	if count > 0 {
		fmt.Println("Seed data already exists, skipping initialization")
		return
	}

	classrooms := []models.Classroom{
		{Name: "A101 多媒体教室", Location: "教学楼A栋1楼", Capacity: 30, Equipment: "投影仪、白板、音响系统", Status: "available", Description: "适合小型培训班使用"},
		{Name: "A201 多功能厅", Location: "教学楼A栋2楼", Capacity: 80, Equipment: "投影仪、音响系统、麦克风阵列", Status: "available", Description: "适合大型讲座和会议"},
		{Name: "B101 计算机教室", Location: "教学楼B栋1楼", Capacity: 40, Equipment: "40台电脑、投影仪、网络设备", Status: "available", Description: "计算机类课程专用"},
		{Name: "B201 语音教室", Location: "教学楼B栋2楼", Capacity: 35, Equipment: "语音系统、耳机、投影仪", Status: "available", Description: "语言类课程专用"},
		{Name: "C101 实训教室", Location: "实训楼C栋1楼", Capacity: 25, Equipment: "实训设备、投影仪、工具柜", Status: "available", Description: "实践操作类课程"},
	}

	for _, classroom := range classrooms {
		DB.Create(&classroom)
	}

	courses := []models.Course{
		{Name: "Web前端开发", Instructor: "张老师", Description: "HTML、CSS、JavaScript全栈开发", Duration: 2, Color: "#3498db"},
		{Name: "Python编程", Instructor: "李老师", Description: "Python基础与应用开发", Duration: 3, Color: "#2ecc71"},
		{Name: "人工智能入门", Instructor: "王老师", Description: "机器学习与深度学习基础", Duration: 2, Color: "#e74c3c"},
		{Name: "英语培训", Instructor: "Miss Chen", Description: "英语口语与听力提升", Duration: 1, Color: "#9b59b6"},
		{Name: "UI设计课程", Instructor: "刘老师", Description: "界面设计与用户体验", Duration: 2, Color: "#f39c12"},
		{Name: "网络安全", Instructor: "赵老师", Description: "网络安全基础知识", Duration: 3, Color: "#1abc9c"},
	}

	for _, course := range courses {
		DB.Create(&course)
	}

	now := time.Now()
	bookings := []models.Booking{
		{ClassroomID: 1, CourseID: 1, Date: now.Format("2006-01-02"), StartTime: "09:00", EndTime: "11:00", Status: "confirmed", Notes: "前端开发实训课"},
		{ClassroomID: 3, CourseID: 2, Date: now.Format("2006-01-02"), StartTime: "14:00", EndTime: "17:00", Status: "confirmed", Notes: "Python编程实操"},
		{ClassroomID: 2, CourseID: 3, Date: now.AddDate(0, 0, 1).Format("2006-01-02"), StartTime: "09:00", EndTime: "11:00", Status: "confirmed", Notes: "AI基础讲座"},
		{ClassroomID: 4, CourseID: 4, Date: now.AddDate(0, 0, 1).Format("2006-01-02"), StartTime: "10:00", EndTime: "11:00", Status: "confirmed", Notes: "英语口语练习"},
		{ClassroomID: 1, CourseID: 5, Date: now.AddDate(0, 0, 2).Format("2006-01-02"), StartTime: "14:00", EndTime: "16:00", Status: "confirmed", Notes: "UI设计实训"},
	}

	for _, booking := range bookings {
		DB.Create(&booking)
	}

	for _, booking := range bookings {
		record := models.UsageRecord{
			BookingID:   booking.ID,
			ClassroomID: booking.ClassroomID,
			CourseID:    booking.CourseID,
			Date:        booking.Date,
			StartTime:   booking.StartTime,
			EndTime:     booking.EndTime,
			Duration:    2,
			ActualUsers: 25,
		}
		DB.Create(&record)
	}

	fmt.Println("Seed data initialized successfully")
}
