const express = require('express');
const router = express.Router();
const saleController = require('../controllers/sale.controller');

router.get('/list', saleController.getFilteredSales);
router.get('/details/:saleId', saleController.getSaleDetails);
router.post('/register', saleController.createSale);

module.exports = router;
