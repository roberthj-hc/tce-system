const db = require('../config/db');

module.exports = {
  async getByRole(role_id) {
    const [rows] = role_id === 1 ?
      await db.query('SELECT * FROM notifications WHERE role_id = ? ORDER BY date DESC', [role_id])
      :
      await db.query('SELECT * FROM notifications ORDER BY date DESC');
    return rows;
  },

  async create(notification) {
    const { role_id, type, title, message, expiration_offset_days = 30 } = notification;

    try {
      const [result] = await db.query(
        `INSERT INTO notifications (role_id, type, title, message, date, expiration_date)
       VALUES (?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY))`,
        [role_id, type, title, message, expiration_offset_days]
      );
      return result.insertId;
    } catch (err) {
      console.error("Error en Notification.create:", err.message);
      throw err;
    }
  }

};
