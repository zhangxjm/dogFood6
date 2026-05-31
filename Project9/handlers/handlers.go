package handlers

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"classroom-booking-system/database"
	"classroom-booking-system/models"

	"github.com/gin-gonic/gin"
)

func GetClassrooms(c *gin.Context) {
	var classrooms []models.Classroom
	result := database.DB.Find(&classrooms)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Code:    500,
			Message: "获取教室列表失败",
		})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{
		Code:    200,
		Message: "获取成功",
		Data:    classrooms,
	})
}

func GetClassroom(c *gin.Context) {
	id := c.Param("id")
	var classroom models.Classroom
	result := database.DB.First(&classroom, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Code:    404,
			Message: "教室不存在",
		})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{
		Code:    200,
		Message: "获取成功",
		Data:    classroom,
	})
}

func CreateClassroom(c *gin.Context) {
	var classroom models.Classroom
	if err := c.ShouldBindJSON(&classroom); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Code:    400,
			Message: "参数错误: " + err.Error(),
		})
		return
	}
	classroom.Status = "available"
	result := database.DB.Create(&classroom)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Code:    500,
			Message: "创建教室失败",
		})
		return
	}
	c.JSON(http.StatusCreated, models.APIResponse{
		Code:    201,
		Message: "创建成功",
		Data:    classroom,
	})
}

func UpdateClassroom(c *gin.Context) {
	id := c.Param("id")
	var classroom models.Classroom
	if err := database.DB.First(&classroom, id).Error; err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Code:    404,
			Message: "教室不存在",
		})
		return
	}
	if err := c.ShouldBindJSON(&classroom); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Code:    400,
			Message: "参数错误",
		})
		return
	}
	idUint, _ := strconv.ParseUint(id, 10, 32)
	classroom.ID = uint(idUint)
	database.DB.Save(&classroom)
	c.JSON(http.StatusOK, models.APIResponse{
		Code:    200,
		Message: "更新成功",
		Data:    classroom,
	})
}

func DeleteClassroom(c *gin.Context) {
	id := c.Param("id")
	result := database.DB.Delete(&models.Classroom{}, id)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Code:    500,
			Message: "删除失败",
		})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{
		Code:    200,
		Message: "删除成功",
	})
}

func GetCourses(c *gin.Context) {
	var courses []models.Course
	result := database.DB.Find(&courses)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Code:    500,
			Message: "获取课程列表失败",
		})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{
		Code:    200,
		Message: "获取成功",
		Data:    courses,
	})
}

func CreateCourse(c *gin.Context) {
	var course models.Course
	if err := c.ShouldBindJSON(&course); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Code:    400,
			Message: "参数错误",
		})
		return
	}
	result := database.DB.Create(&course)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Code:    500,
			Message: "创建课程失败",
		})
		return
	}
	c.JSON(http.StatusCreated, models.APIResponse{
		Code:    201,
		Message: "创建成功",
		Data:    course,
	})
}

func GetBookings(c *gin.Context) {
	date := c.Query("date")
	classroomID := c.Query("classroom_id")

	var bookings []models.Booking
	query := database.DB.Preload("Classroom").Preload("Course")

	if date != "" {
		query = query.Where("date = ?", date)
	}
	if classroomID != "" {
		query = query.Where("classroom_id = ?", classroomID)
	}

	result := query.Order("date desc, start_time asc").Find(&bookings)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Code:    500,
			Message: "获取预约列表失败",
		})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{
		Code:    200,
		Message: "获取成功",
		Data:    bookings,
	})
}

func checkTimeConflict(classroomID uint, date, startTime, endTime string, excludeID ...uint) bool {
	var bookings []models.Booking
	query := database.DB.Where("classroom_id = ? AND date = ? AND status = ?", classroomID, date, "confirmed")
	if len(excludeID) > 0 {
		query = query.Where("id != ?", excludeID[0])
	}
	query.Find(&bookings)

	for _, booking := range bookings {
		if timesOverlap(startTime, endTime, booking.StartTime, booking.EndTime) {
			return true
		}
	}
	return false
}

func timesOverlap(start1, end1, start2, end2 string) bool {
	return start1 < end2 && end1 > start2
}

func CreateBooking(c *gin.Context) {
	var booking models.Booking
	if err := c.ShouldBindJSON(&booking); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Code:    400,
			Message: "参数错误: " + err.Error(),
		})
		return
	}

	if checkTimeConflict(booking.ClassroomID, booking.Date, booking.StartTime, booking.EndTime) {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Code:    409,
			Message: "该时间段已被预约，请选择其他时间",
		})
		return
	}

	booking.Status = "confirmed"
	result := database.DB.Create(&booking)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Code:    500,
			Message: "创建预约失败",
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Code:    201,
		Message: "预约成功",
		Data:    booking,
	})
}

func UpdateBooking(c *gin.Context) {
	id := c.Param("id")
	var booking models.Booking
	if err := database.DB.First(&booking, id).Error; err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Code:    404,
			Message: "预约不存在",
		})
		return
	}

	var updateData models.Booking
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Code:    400,
			Message: "参数错误",
		})
		return
	}

	if checkTimeConflict(updateData.ClassroomID, updateData.Date, updateData.StartTime, updateData.EndTime, booking.ID) {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Code:    409,
			Message: "该时间段已被预约，请选择其他时间",
		})
		return
	}

	booking.ClassroomID = updateData.ClassroomID
	booking.CourseID = updateData.CourseID
	booking.Date = updateData.Date
	booking.StartTime = updateData.StartTime
	booking.EndTime = updateData.EndTime
	booking.Notes = updateData.Notes

	database.DB.Save(&booking)
	c.JSON(http.StatusOK, models.APIResponse{
		Code:    200,
		Message: "更新成功",
		Data:    booking,
	})
}

func CancelBooking(c *gin.Context) {
	id := c.Param("id")
	var booking models.Booking
	if err := database.DB.First(&booking, id).Error; err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Code:    404,
			Message: "预约不存在",
		})
		return
	}

	booking.Status = "cancelled"
	database.DB.Save(&booking)
	c.JSON(http.StatusOK, models.APIResponse{
		Code:    200,
		Message: "取消成功",
		Data:    booking,
	})
}

func DeleteBooking(c *gin.Context) {
	id := c.Param("id")
	result := database.DB.Delete(&models.Booking{}, id)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Code:    500,
			Message: "删除失败",
		})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{
		Code:    200,
		Message: "删除成功",
	})
}

func GetUsageRecords(c *gin.Context) {
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	var records []models.UsageRecord
	query := database.DB.Preload("Classroom").Preload("Course")

	if startDate != "" {
		query = query.Where("date >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("date <= ?", endDate)
	}

	result := query.Order("date desc").Find(&records)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Code:    500,
			Message: "获取使用记录失败",
		})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{
		Code:    200,
		Message: "获取成功",
		Data:    records,
	})
}

func GetStatistics(c *gin.Context) {
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	if startDate == "" {
		now := time.Now()
		startDate = now.AddDate(0, -1, 0).Format("2006-01-02")
	}
	if endDate == "" {
		endDate = time.Now().Format("2006-01-02")
	}

	var totalBookings int64
	database.DB.Model(&models.Booking{}).
		Where("date BETWEEN ? AND ? AND status = ?", startDate, endDate, "confirmed").
		Count(&totalBookings)

	var totalRecords int64
	database.DB.Model(&models.UsageRecord{}).
		Where("date BETWEEN ? AND ?", startDate, endDate).
		Count(&totalRecords)

	type ClassroomStats struct {
		ClassroomID   uint   `json:"classroom_id"`
		ClassroomName string `json:"classroom_name"`
		UsageCount    int64  `json:"usage_count"`
	}
	var classroomStats []ClassroomStats
	database.DB.Table("usage_records").
		Select("usage_records.classroom_id, classrooms.name as classroom_name, count(*) as usage_count").
		Joins("JOIN classrooms ON usage_records.classroom_id = classrooms.id").
		Where("usage_records.date BETWEEN ? AND ?", startDate, endDate).
		Group("usage_records.classroom_id").
		Order("usage_count desc").
		Scan(&classroomStats)

	type CourseStats struct {
		CourseID   uint   `json:"course_id"`
		CourseName string `json:"course_name"`
		UsageCount int64  `json:"usage_count"`
	}
	var courseStats []CourseStats
	database.DB.Table("usage_records").
		Select("usage_records.course_id, courses.name as course_name, count(*) as usage_count").
		Joins("JOIN courses ON usage_records.course_id = courses.id").
		Where("usage_records.date BETWEEN ? AND ?", startDate, endDate).
		Group("usage_records.course_id").
		Order("usage_count desc").
		Scan(&courseStats)

	type DailyStats struct {
		Date      string `json:"date"`
		UsageCount int64  `json:"usage_count"`
	}
	var dailyStats []DailyStats
	database.DB.Table("usage_records").
		Select("date, count(*) as usage_count").
		Where("date BETWEEN ? AND ?", startDate, endDate).
		Group("date").
		Order("date").
		Scan(&dailyStats)

	c.JSON(http.StatusOK, models.APIResponse{
		Code:    200,
		Message: "获取成功",
		Data: gin.H{
			"start_date":      startDate,
			"end_date":        endDate,
			"total_bookings":  totalBookings,
			"total_records":   totalRecords,
			"classroom_stats": classroomStats,
			"course_stats":    courseStats,
			"daily_stats":     dailyStats,
		},
	})
}

func GetAvailableTimeSlots(c *gin.Context) {
	classroomID := c.Query("classroom_id")
	date := c.Query("date")

	if classroomID == "" || date == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Code:    400,
			Message: "请提供教室ID和日期",
		})
		return
	}

	timeSlots := generateTimeSlots()

	var bookings []models.Booking
	database.DB.Where("classroom_id = ? AND date = ? AND status = ?", classroomID, date, "confirmed").
		Find(&bookings)

	availableSlots := make([]gin.H, 0)
	for _, slot := range timeSlots {
		isBooked := false
		for _, booking := range bookings {
			if timesOverlap(slot["start"].(string), slot["end"].(string), booking.StartTime, booking.EndTime) {
				isBooked = true
				break
			}
		}
		availableSlots = append(availableSlots, gin.H{
			"start":     slot["start"],
			"end":       slot["end"],
			"available": !isBooked,
		})
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Code:    200,
		Message: "获取成功",
		Data:    availableSlots,
	})
}

func generateTimeSlots() []map[string]interface{} {
	slots := make([]map[string]interface{}, 0)
	startHour := 8
	endHour := 21

	for hour := startHour; hour < endHour; hour++ {
		slot := map[string]interface{}{
			"start": strings.ReplaceAll(strconv.Itoa(hour)+":00", " ", ""),
			"end":   strings.ReplaceAll(strconv.Itoa(hour+1)+":00", " ", ""),
		}
		if hour < 10 {
			slot["start"] = "0" + strconv.Itoa(hour) + ":00"
		} else {
			slot["start"] = strconv.Itoa(hour) + ":00"
		}
		if hour+1 < 10 {
			slot["end"] = "0" + strconv.Itoa(hour+1) + ":00"
		} else {
			slot["end"] = strconv.Itoa(hour+1) + ":00"
		}
		slots = append(slots, slot)
	}
	return slots
}
