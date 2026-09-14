const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');

router.get('/sales-report', reportController.generateSalesReport);
router.get('/repairs-report', reportController.generateRepairsReport);

module.exports = router;
