const db = require('../config/db');
const Product = require('./product.model');

module.exports = {
  async getAll() {
    const [rows] = await db.query(`
      SELECT
        i.inventory_id,
        i.product_id,
        p.name AS product_name,
        i.supplier_id,
        s.name AS supplier_name,
        i.type,
        i.quantity,
        i.date,
        i.comment,
        i.user_id,
        u.name AS user_name
      FROM inventory i
      LEFT JOIN products p ON i.product_id = p.product_id
      LEFT JOIN suppliers s ON i.supplier_id = s.supplier_id
      LEFT JOIN users u ON i.user_id = u.id
      ORDER BY i.date DESC
      `);
    return rows;
  },

  async register(entry) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const { product_id, supplier_id, type, quantity, date, comment, user_id } = entry;

      const [result] = await connection.query(
        'INSERT INTO inventory (product_id, supplier_id, type, quantity, date, comment, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [product_id, supplier_id, type, quantity, date, comment, user_id]
      );

      const [rows] = await connection.query(
        'SELECT stock FROM products WHERE product_id = ?',
        [product_id]
      );
      if (rows.length === 0) {
        throw new Error('Producto no encontrado');
      }
      const currentStock = rows[0].stock;
      let newStock = currentStock;

      switch (type) {
        case 'Entrada de Stock':
          newStock = currentStock + quantity;
          break;
        case 'Salida de Stock':
          if (quantity > currentStock) {
            throw new Error(
              `No se pudo realizar la salida. Stock disponible: ${currentStock}`
            );
          }
          newStock = currentStock - quantity;
          break;
        case 'Ajuste de Stock':
          newStock = quantity;
          break;
        default:
          throw new Error('Tipo de movimiento no válido');
      }

      await connection.query(
        'UPDATE products SET stock = ? WHERE product_id = ?',
        [newStock, product_id]
      );

      await connection.commit();
      return { insertId: result.insertId, newStock };
    } catch (error) {
      await connection.rollback();
      console.error('Error en register inventory:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
};
