const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');

router.get('/list', inventoryController.getInventory);
router.post('/register', inventoryController.registerMovement);

module.exports = router;
