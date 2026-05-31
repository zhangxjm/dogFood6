package services

import (
	"warehouse-system/internal/models"
)

type ProductService struct{}

func NewProductService() *ProductService {
	return &ProductService{}
}

func (s *ProductService) GetProductList(page, pageSize int, category string) ([]models.Product, int64, error) {
	var products []models.Product
	var total int64

	query := models.DB.Model(&models.Product{})
	if category != "" {
		query = query.Where("category = ?", category)
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Find(&products).Error; err != nil {
		return nil, 0, err
	}

	return products, total, nil
}

func (s *ProductService) GetProductByID(id uint) (*models.Product, error) {
	var product models.Product
	if err := models.DB.First(&product, id).Error; err != nil {
		return nil, err
	}
	return &product, nil
}

func (s *ProductService) CreateProduct(product *models.Product) error {
	return models.DB.Create(product).Error
}

func (s *ProductService) UpdateProduct(product *models.Product) error {
	return models.DB.Save(product).Error
}

func (s *ProductService) DeleteProduct(id uint) error {
	return models.DB.Delete(&models.Product{}, id).Error
}

func (s *ProductService) GetCategories() ([]string, error) {
	var categories []string
	if err := models.DB.Model(&models.Product{}).Distinct("category").Pluck("category", &categories).Error; err != nil {
		return nil, err
	}
	return categories, nil
}

func (s *ProductService) SearchProducts(keyword string) ([]models.Product, error) {
	var products []models.Product
	searchPattern := "%" + keyword + "%"
	if err := models.DB.Where("name LIKE ? OR sku LIKE ? OR category LIKE ?", searchPattern, searchPattern, searchPattern).Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}
