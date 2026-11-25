const express = require('express');
const router = express.Router();
const dollarController = require('../controllers/dollar.controller');

router.get('/list', dollarController.getAll);
router.get('/current', dollarController.getCurrent);
router.post('/register', dollarController.create);
router.put('/update/:id', dollarController.update);
router.delete('/delete/:id', dollarController.remove);

module.exports = router;
