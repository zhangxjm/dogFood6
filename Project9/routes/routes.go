package routes

import (
	"classroom-booking-system/handlers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	r.Static("/static", "./frontend")

	r.GET("/", func(c *gin.Context) {
		c.File("./frontend/index.html")
	})

	api := r.Group("/api")
	{
		classrooms := api.Group("/classrooms")
		{
			classrooms.GET("", handlers.GetClassrooms)
			classrooms.GET("/:id", handlers.GetClassroom)
			classrooms.POST("", handlers.CreateClassroom)
			classrooms.PUT("/:id", handlers.UpdateClassroom)
			classrooms.DELETE("/:id", handlers.DeleteClassroom)
		}

		courses := api.Group("/courses")
		{
			courses.GET("", handlers.GetCourses)
			courses.POST("", handlers.CreateCourse)
		}

		bookings := api.Group("/bookings")
		{
			bookings.GET("", handlers.GetBookings)
			bookings.POST("", handlers.CreateBooking)
			bookings.PUT("/:id", handlers.UpdateBooking)
			bookings.PUT("/:id/cancel", handlers.CancelBooking)
			bookings.DELETE("/:id", handlers.DeleteBooking)
		}

		records := api.Group("/records")
		{
			records.GET("", handlers.GetUsageRecords)
		}

		statistics := api.Group("/statistics")
		{
			statistics.GET("", handlers.GetStatistics)
		}

		api.GET("/available-slots", handlers.GetAvailableTimeSlots)
	}
}
