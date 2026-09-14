const db = require('../config/db');

module.exports = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM customers');
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM customers WHERE customer_id = ?', [id]);
    return rows[0];
  },

  async create(customer) {
    const { name, ci, email, phone } = customer;
    const [result] = await db.query(
      'INSERT INTO customers (name, ci, email, phone) VALUES (?, ?, ?, ?)',
      [name, ci, email, phone]
    );
    return result.insertId;
  },

  async update(id, customer) {
    const [result] = await db.query(
      'UPDATE customers SET ? WHERE customer_id = ?',
      [customer, id]);
    return result;
  },

  async delete(id) {
    const [result] = await db.query(
      'DELETE FROM customers WHERE customer_id = ?',
      [id]
    );
    return result;
  },

  async findByCIOrPhone(ci, phone) {
    const [rows] = await db.query(
      'SELECT * FROM customers WHERE ci = ? OR phone = ? LIMIT 1',
      [ci, phone]
    );
    return rows[0];
  },

};
