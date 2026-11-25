const db = require('../config/db');

module.exports = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM sales');
    return rows;
  },

  async create(sale, connection = db) {
    const { customer_id, seller_id, total, exchange_rate } = sale;
    const [result] = await connection.query(
      'INSERT INTO sales (date, customer_id, seller_id, total, exchange_rate) VALUES (NOW(), ?, ?, ?, ?)',
      [customer_id, seller_id, total, exchange_rate ?? null]
    );
    return result.insertId;
  },

  async getFiltered({ from, to, seller = 'All' }) {
    const conditions = [];
    const params = [];
    if (from && to) {
      conditions.push(`DATE(s.date) BETWEEN ? AND ?`);
      params.push(from, to);
    } else {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();

      const firstDay = new Date(year, month, 1).toISOString().slice(0, 10);
      const lastDay = new Date(year, month + 1, 0).toISOString().slice(0, 10);

      conditions.push(`DATE(s.date) BETWEEN ? AND ?`);
      params.push(firstDay, lastDay);
    }
    if (seller && seller !== 'All') {
      conditions.push(`u.name = ?`);
      params.push(seller);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await db.query(`
    SELECT 
      s.sale_id,
      s.date AS sale_date,
      s.total AS total_sale,
      s.customer_id,
      c.name AS customer_name,
      s.seller_id,
      u.name AS seller_name
    FROM sales s
    LEFT JOIN customers c ON s.customer_id = c.customer_id
    JOIN users u ON s.seller_id = u.id
    ${where}
    ORDER BY s.date DESC
  `, params);
    return rows;
  },

};
