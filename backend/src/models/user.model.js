const db = require('../config/db.js');
const bcrypt = require('bcrypt');

module.exports = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM users');
    return rows;
  },

  async getByRoleId(role_id) {
    const [rows] = await db.query('SELECT * FROM users WHERE role_id = ?', [role_id]);
    return rows;
  },

  async getByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  async create(user) {
    const { name, last_name, email, phone, password, address, role_id } = user;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const [result] = await db.query(
      'INSERT INTO users (name, last_name, email, phone, password, address, role_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, last_name, email, phone, hashedPassword, address, role_id]
    );
    return result.insertId;
  },

  async getSellers() {
    const [rows] = await db.query('SELECT id, name FROM users');
    return rows;
  },

  async updateUser(id, user) {
    const { name, last_name, email, phone, address, role_id, is_active } = user;
    const [result] = await db.query(
      'UPDATE users SET name = ?, last_name = ?, email = ?, phone = ?, address = ?, role_id = ?, is_active = ? WHERE id = ?',
      [name, last_name, email, phone, address, role_id, is_active, id]
    );
    return result.affectedRows;
  },

  async deleteUser(id) {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows;
  },

  async getOne(id) {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  async hasTransactions(userId) {
    const [sales] = await db.query('SELECT COUNT(*) as count FROM sales WHERE seller_id = ?', [userId]);
    const [repairs] = await db.query('SELECT COUNT(*) as count FROM repairs WHERE user_id = ?', [userId]);
    const [inventory] = await db.query('SELECT COUNT(*) as count FROM inventory WHERE user_id = ?', [userId]);
    const total = sales[0].count + repairs[0].count + inventory[0].count;
    return total > 0;
  }
};
