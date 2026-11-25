const db = require('../config/db');

module.exports = {
  async getAll() {
    const [rows] = await db.query(
      'SELECT * FROM dollar_exchange ORDER BY register_date DESC, dollar_exchange_id DESC'
    );
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM dollar_exchange WHERE dollar_exchange_id = ?', [id]);
    return rows[0];
  },

  async findLastRegister(connection = db) {
    const [rows] = await connection.query(
      'SELECT * FROM dollar_exchange ORDER BY register_date DESC, dollar_exchange_id DESC LIMIT 1'
    );
    return rows[0];
  },

  async create({ price, observation }, connection = db) {
    const [result] = await connection.query(
      'INSERT INTO dollar_exchange (price, observation) VALUES (?, ?)',
      [price, observation || null]
    );
    return result.insertId;
  },

  async update(id, { price, observation }, connection = db) {
    const [result] = await connection.query(
      'UPDATE dollar_exchange SET price = ?, observation = ? WHERE dollar_exchange_id = ?',
      [price, observation || null, id]
    );
    return result;
  },

  async count() {
    const [rows] = await db.query('SELECT COUNT(*) AS n FROM dollar_exchange');
    return rows[0].n;
  },

  async delete(id) {
    const [result] = await db.query('DELETE FROM dollar_exchange WHERE dollar_exchange_id = ?', [id]);
    return result;
  },
};
