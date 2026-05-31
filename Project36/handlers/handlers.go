package handlers

import (
	"nursery-management/database"
	"nursery-management/models"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
)

func GetCategories(c *fiber.Ctx) error {
	var categories []models.SeedlingCategory
	database.DB.Find(&categories)
	return c.JSON(categories)
}

func GetCategory(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var category models.SeedlingCategory
	result := database.DB.First(&category, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Category not found"})
	}
	return c.JSON(category)
}

func CreateCategory(c *fiber.Ctx) error {
	category := new(models.SeedlingCategory)
	if err := c.BodyParser(category); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	database.DB.Create(category)
	return c.JSON(category)
}

func UpdateCategory(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var category models.SeedlingCategory
	result := database.DB.First(&category, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Category not found"})
	}
	if err := c.BodyParser(&category); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	database.DB.Save(&category)
	return c.JSON(category)
}

func DeleteCategory(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	result := database.DB.Delete(&models.SeedlingCategory{}, id)
	if result.Error != nil {
		return c.Status(400).JSON(fiber.Map{"error": result.Error.Error()})
	}
	if result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Category not found"})
	}
	return c.JSON(fiber.Map{"message": "Category deleted successfully"})
}

func GetBatches(c *fiber.Ctx) error {
	var batches []models.PlantingBatch
	database.DB.Preload("Category").Find(&batches)
	return c.JSON(batches)
}

func GetBatch(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var batch models.PlantingBatch
	result := database.DB.Preload("Category").First(&batch, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Batch not found"})
	}
	return c.JSON(batch)
}

func CreateBatch(c *fiber.Ctx) error {
	batch := new(models.PlantingBatch)
	if err := c.BodyParser(batch); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	batch.PlantingDate = time.Now()
	database.DB.Create(batch)
	return c.JSON(batch)
}

func UpdateBatch(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var batch models.PlantingBatch
	result := database.DB.First(&batch, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Batch not found"})
	}
	if err := c.BodyParser(&batch); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	database.DB.Save(&batch)
	return c.JSON(batch)
}

func DeleteBatch(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	result := database.DB.Delete(&models.PlantingBatch{}, id)
	if result.Error != nil {
		return c.Status(400).JSON(fiber.Map{"error": result.Error.Error()})
	}
	if result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Batch not found"})
	}
	return c.JSON(fiber.Map{"message": "Batch deleted successfully"})
}

func GetOutputs(c *fiber.Ctx) error {
	var outputs []models.SeedlingOutput
	database.DB.Preload("Batch.Category").Find(&outputs)
	return c.JSON(outputs)
}

func GetOutput(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var output models.SeedlingOutput
	result := database.DB.Preload("Batch.Category").First(&output, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Output not found"})
	}
	return c.JSON(output)
}

func CreateOutput(c *fiber.Ctx) error {
	output := new(models.SeedlingOutput)
	if err := c.BodyParser(output); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	output.OutputDate = time.Now()
	database.DB.Create(output)
	return c.JSON(output)
}

func UpdateOutput(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var output models.SeedlingOutput
	result := database.DB.First(&output, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Output not found"})
	}
	if err := c.BodyParser(&output); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	database.DB.Save(&output)
	return c.JSON(output)
}

func DeleteOutput(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	result := database.DB.Delete(&models.SeedlingOutput{}, id)
	if result.Error != nil {
		return c.Status(400).JSON(fiber.Map{"error": result.Error.Error()})
	}
	if result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Output not found"})
	}
	return c.JSON(fiber.Map{"message": "Output deleted successfully"})
}

func GetShipments(c *fiber.Ctx) error {
	var shipments []models.ShipmentRecord
	database.DB.Preload("Category").Find(&shipments)
	return c.JSON(shipments)
}

func GetShipment(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var shipment models.ShipmentRecord
	result := database.DB.Preload("Category").First(&shipment, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Shipment not found"})
	}
	return c.JSON(shipment)
}

func CreateShipment(c *fiber.Ctx) error {
	shipment := new(models.ShipmentRecord)
	if err := c.BodyParser(shipment); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	shipment.ShipDate = time.Now()
	shipment.TotalAmount = float64(shipment.Quantity) * shipment.UnitPrice
	database.DB.Create(shipment)
	return c.JSON(shipment)
}

func UpdateShipment(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var shipment models.ShipmentRecord
	result := database.DB.First(&shipment, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Shipment not found"})
	}
	if err := c.BodyParser(&shipment); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	shipment.TotalAmount = float64(shipment.Quantity) * shipment.UnitPrice
	database.DB.Save(&shipment)
	return c.JSON(shipment)
}

func DeleteShipment(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	result := database.DB.Delete(&models.ShipmentRecord{}, id)
	if result.Error != nil {
		return c.Status(400).JSON(fiber.Map{"error": result.Error.Error()})
	}
	if result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Shipment not found"})
	}
	return c.JSON(fiber.Map{"message": "Shipment deleted successfully"})
}
