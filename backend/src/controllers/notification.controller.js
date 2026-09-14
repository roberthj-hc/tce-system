const Notification = require('../models/notification.model');

exports.getNotifications = async (req, res) => {
  try {
    const role_id = req.params.role_id;
    const notifications = await Notification.getByRole(role_id);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las notificaciones' });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const id = await Notification.create(req.body);
    res.status(201).json({ id });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la notificación' });
  }
};
