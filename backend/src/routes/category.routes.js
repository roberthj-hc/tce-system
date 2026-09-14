const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

router.get('/list', categoryController.getAllCategories);
router.get('/section/:section_id', categoryController.getCategoriesBySection);
router.get('/:id', categoryController.getCategoryById);
router.post('/register', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);
router.put('/activate/:id', categoryController.activateCategory);

module.exports = router;
