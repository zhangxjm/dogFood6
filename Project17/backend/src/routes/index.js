const express = require('express');
const router = express.Router();
const DeclarationController = require('../controllers/declarationController');
const ProductController = require('../controllers/productController');

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Cross-border Cultural and Creative Goods Customs Declaration System API is running',
    timestamp: new Date().toISOString()
  });
});

router.get('/declarations', DeclarationController.getDeclarations);
router.get('/declarations/:id', DeclarationController.getDeclarationById);
router.post('/declarations', DeclarationController.createDeclaration);
router.post('/declarations/:id/submit', DeclarationController.submitDeclaration);
router.post('/declarations/calculate-taxes', DeclarationController.calculateTaxes);
router.post('/declarations/batch-submit', DeclarationController.batchSubmit);
router.get('/tasks/:task_id', DeclarationController.getTaskStatus);
router.get('/statistics', DeclarationController.getStatistics);

router.post('/hs-code/verify', DeclarationController.verifyHsCode);

router.get('/categories', ProductController.getCategories);
router.get('/categories/:hs_code', ProductController.getCategoryByHsCode);
router.get('/products', ProductController.getProducts);
router.get('/products/:id', ProductController.getProductById);
router.post('/products', ProductController.createProduct);
router.put('/products/:id', ProductController.updateProduct);
router.delete('/products/:id', ProductController.deleteProduct);

module.exports = router;
