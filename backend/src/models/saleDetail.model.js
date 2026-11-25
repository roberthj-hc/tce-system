const db = require('../config/db');

module.exports = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM sale_details');
    return rows;
  },

  // rate: tipo de cambio vigente si la venta usa el "cambio más reciente"; null = costo registrado del producto
  async create(detail, connection = db, rate = null) {
    const { sale_id, product_id, quantity, unit_price } = detail;
    // unit_cost: costo (Bs) al momento de la venta. Con tipo de cambio más reciente y producto con costo
    // en USD: costo_usd * tipo de cambio; en otro caso, el costo registrado del producto.
    const [result] = await connection.query(
      `INSERT INTO sale_details (sale_id, product_id, quantity, unit_price, unit_cost)
       SELECT ?, ?, ?, ?,
         IF(? IS NOT NULL AND p.cost_usd IS NOT NULL, ROUND(p.cost_usd * ?, 2), p.cost)
       FROM products p WHERE p.product_id = ?`,
      [sale_id, product_id, quantity, unit_price, rate, rate, product_id]
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
