const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

router.get('/list', productController.getAllProducts);
router.get('/exists', productController.checkBarcodeExists);
router.get('/:id', productController.getProductById);
router.post('/register', productController.createProduct);
router.post('/upload', productController.uploadProductPhoto);
router.put('/update/:id', productController.updateProduct);
router.delete('/delete/:id', productController.deleteProduct );

module.exports = router;
