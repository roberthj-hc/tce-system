const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplier.controller');

router.get('/list', supplierController.getAllSuppliers);
router.post('/register', supplierController.createSupplier);
router.put('/edit/:id', supplierController.updateSupplier);
router.delete('/delete/:id', supplierController.deleteSupplier);

module.exports = router;
