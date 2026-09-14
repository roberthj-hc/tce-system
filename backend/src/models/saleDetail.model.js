const db = require('../config/db');

module.exports = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM sale_details');
    return rows;
  },

  async create(detail, connection = db) {
    const { sale_id, product_id, quantity, unit_price } = detail;
    const [result] = await connection.query(
      'INSERT INTO sale_details (sale_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
      [sale_id, product_id, quantity, unit_price]
    );
    return result.insertId;
  },

  async getBySaleId(saleId) {
    const [rows] = await db.query(`
      SELECT 
        sd.sale_details_id,
        sd.product_id,
        p.name AS product_name,
        sd.quantity,
        sd.unit_price
      FROM sale_details sd
      JOIN products p ON sd.product_id = p.product_id
      WHERE sd.sale_id = ?
    `, [saleId]);
    return rows;
  },
};
