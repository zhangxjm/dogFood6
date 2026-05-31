package main

import (
	"log"
	"nursery-management/config"
	"nursery-management/database"
	"nursery-management/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/template/html/v2"
)

func main() {
	database.Init()

	engine := html.New("./web/templates", ".html")
	engine.Reload(true)

	app := fiber.New(fiber.Config{
		Views: engine,
	})

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Content-Type, Authorization",
	}))
	app.Use(logger.New())
	app.Use(recover.New())

	app.Static("/static", "./web/static", fiber.Static{
		CacheDuration: 0,
	})

	routes.SetupRoutes(app)

	log.Printf("Server starting on port %s...", config.AppConfig.Port)
	log.Printf("Open http://localhost:%s in your browser", config.AppConfig.Port)
	log.Fatal(app.Listen(":" + config.AppConfig.Port))
}
