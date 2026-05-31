package routes

import (
	"nursery-management/handlers"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")

	categories := api.Group("/categories")
	categories.Get("/", handlers.GetCategories)
	categories.Get("/:id", handlers.GetCategory)
	categories.Post("/", handlers.CreateCategory)
	categories.Put("/:id", handlers.UpdateCategory)
	categories.Delete("/:id", handlers.DeleteCategory)

	batches := api.Group("/batches")
	batches.Get("/", handlers.GetBatches)
	batches.Get("/:id", handlers.GetBatch)
	batches.Post("/", handlers.CreateBatch)
	batches.Put("/:id", handlers.UpdateBatch)
	batches.Delete("/:id", handlers.DeleteBatch)

	outputs := api.Group("/outputs")
	outputs.Get("/", handlers.GetOutputs)
	outputs.Get("/:id", handlers.GetOutput)
	outputs.Post("/", handlers.CreateOutput)
	outputs.Put("/:id", handlers.UpdateOutput)
	outputs.Delete("/:id", handlers.DeleteOutput)

	shipments := api.Group("/shipments")
	shipments.Get("/", handlers.GetShipments)
	shipments.Get("/:id", handlers.GetShipment)
	shipments.Post("/", handlers.CreateShipment)
	shipments.Put("/:id", handlers.UpdateShipment)
	shipments.Delete("/:id", handlers.DeleteShipment)

	app.Get("/", func(c *fiber.Ctx) error {
		return c.Render("index", fiber.Map{
			"Title": "苗木种植基地种苗信息管理系统",
		})
	})

	app.Get("/categories", func(c *fiber.Ctx) error {
		return c.Render("categories", fiber.Map{
			"Title": "种苗品类管理",
		})
	})

	app.Get("/batches", func(c *fiber.Ctx) error {
		return c.Render("batches", fiber.Map{
			"Title": "种植批次管理",
		})
	})

	app.Get("/outputs", func(c *fiber.Ctx) error {
		return c.Render("outputs", fiber.Map{
			"Title": "出苗数量管理",
		})
	})

	app.Get("/shipments", func(c *fiber.Ctx) error {
		return c.Render("shipments", fiber.Map{
			"Title": "外销发货记录",
		})
	})
}
