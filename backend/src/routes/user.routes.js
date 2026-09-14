const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const middleware = require('../middlewares/auth.middleware');

router.get('/', userController.getAllUsers);
router.get('/sellers', userController.getSellers);
router.post('/register', userController.createUser);
router.post('/login', userController.loginUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.get('/:id/has-transactions', userController.hasTransactions);

module.exports = router;
