const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

router.get('/list/:role_id', notificationController.getNotifications);
router.post('/register', notificationController.createNotification);

module.exports = router;
