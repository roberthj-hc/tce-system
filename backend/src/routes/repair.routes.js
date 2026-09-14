const express = require('express');
const router = express.Router();
const repairController = require('../controllers/repair.controller');

router.post('/register', repairController.createRepair);
router.get('/list', repairController.listByDate);
router.get('/list-detailed', repairController.listRepairsWithDetails);
router.get('/details/:id', repairController.getDetailedRepair); 
router.put('/update-status/:id', repairController.updateStatus);
router.put('/update-fields/:id', repairController.updateRepairFields);
router.get('/:id', repairController.getRepairById);
router.put('/update/:id', repairController.updateRepair);

module.exports = router;
