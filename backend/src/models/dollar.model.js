const db = require('../config/db');

module.exports = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM dollar_exchange');
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM dollar_exchange WHERE dollar_exchange_id = ?', [id]);
    return rows[0];
  },

  async create(dollar_exchange) {
    const { price, observation } = dollar_exchange;
    const [result] = await db.query(
      'INSERT INTO dollar_exchange (price, observation) VALUES (?, ?)',
      [price, observation]
    );
    return result.insertId;
  },

  async update(id, dollar_exchange) {
    const [result] = await db.query(
      'UPDATE dollar_exchange SET ? WHERE dollar_exchange_id = ?',
      [dollar_exchange, id]);
    return result;
  },

  async delete(id) {
    const [result] = await db.query(
      'DELETE FROM dollar_exchange WHERE dollar_exchange_id = ?',
      [id]
    );
    return result;
  },

  async findLastRegister() {
    const [rows] = await db.query(
      'SELECT * FROM dollar_exchange ORDER BY register_date DESC LIMIT 1',
    );
    return rows[0];
  },

};
