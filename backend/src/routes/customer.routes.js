const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');

router.get('/list', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomerById);
router.post('/register', customerController.createCustomer);
router.put('/update/:id', customerController.updateCustomer);
router.delete('/delete/:id', customerController.deleteCustomer);
router.get('/search', customerController.findCustomer);

module.exports = router;
