const db = require('../config/db');

module.exports = {
  async getAll(status = "active") {
    let query = `
      SELECT 
        p.product_id,
        p.name,
        p.barcode,
        p.brand,
        p.price,
        p.cost,
        p.stock,
        p.stock_minimum,
        p.photo,
        p.description,
        p.active,
        p.category_id,
        c.name AS category,
        c.section_id,
        s.name AS supplier,
        sec.name AS section
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      JOIN suppliers s ON p.supplier_id = s.supplier_id
      LEFT JOIN sections sec ON c.section_id = sec.section_id
    `;

    if (status === "active") query += " WHERE p.active = true";
    else if (status === "inactive") query += " WHERE p.active = false";

    query += " ORDER BY p.name ASC";

    const [rows] = await db.query(query);
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM products WHERE product_id = ?', [id]);
    return rows[0];
  },

  async create(product) {
    const {
      name,
      barcode,
      brand,
      price,
      cost,
      stock,
      stock_minimum,
      photo,
      description,
      active,
      category_id,
      supplier_id
    } = product;

    const [result] = await db.query(
      'INSERT INTO products (name, barcode, brand, price, cost, stock, stock_minimum, photo, description, active, category_id, supplier_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, barcode, brand, price, cost, stock, stock_minimum, photo, description, active, category_id, supplier_id]
    );

    return { id: result.insertId, name };
  },

  async update(id, product) {
    const [result] = await db.query(
      'UPDATE products SET ? WHERE product_id = ?',
      [product, id]);
    return result;
  },

  async hasSales(productId) {
    const [rows] = await db.query(
      'SELECT COUNT(*) AS total FROM sale_details WHERE product_id = ?',
      [productId]
    );
    return rows[0].total > 0;
  },

  async deactivate(productId) {
    const [result] = await db.query(
      'UPDATE products SET active = false WHERE product_id = ?',
      [productId]
    );
    return result;
  },

  async delete(productId) {
    const [result] = await db.query(
      'DELETE FROM products WHERE product_id = ?',
      [productId]
    );
    return result;
  },

  async getStock(productId, connection = db) {
    const [rows] = await connection.query(
      'SELECT stock FROM products WHERE product_id = ?',
      [productId]
    );
    return rows[0]?.stock ?? null;
  },

  async updateStock(productId, newStock, connection = db) {
    await connection.query(
      'UPDATE products SET stock = ? WHERE product_id = ?',
      [newStock, productId]
    );
  },

  async barcodeExists(barcode) {
    const [rows] = await db.query(
      'SELECT COUNT(*) AS count FROM products WHERE barcode = ?',
      [barcode]
    );
    return rows[0].count > 0;
  }
};
