const db = require('../config/db');

module.exports = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM categories WHERE is_active = true ORDER BY name ASC');
    return rows;
  },

  async getBySection(section_id) {
    const [rows] = await db.query(
      'SELECT * FROM categories WHERE section_id = ? ORDER BY name ASC',
      [section_id]
    )
    return rows;
  },

  async create(name, description, section_id) {
    const [result] = await db.query(
      'INSERT INTO categories (name, description, section_id) VALUES (?, ?, ?)',
      [name, description, section_id]
    );
    return result.insertId;
  },

  async update(category_id, name, description, section_id) {
    const [result] = await db.query(
      'UPDATE categories SET name = ?, description = ?, section_id = ? WHERE category_id = ?',
      [name, description, section_id, category_id]
    );
    return result.affectedRows;
  },

  async delete(category_id) {
    const [result] = await db.query(
      'DELETE FROM categories WHERE category_id = ?',
      [category_id]
    );
    return result.affectedRows;
  },

  async deactivate(category_id) {
    const [result] = await db.query(
      'UPDATE categories SET is_active = FALSE WHERE category_id = ?',
      [category_id]
    );
    return result.affectedRows;
  },

  async activate(category_id) {
    const [result] = await db.query(
      'UPDATE categories SET is_active = TRUE WHERE category_id = ?',
      [category_id]
    );
    return result.affectedRows;
  },

  async getById(category_id) {
    const [rows] = await db.query(
      'SELECT * FROM categories WHERE category_id = ?',
      [category_id]
    );
    return rows[0];
  },

  async hasProducts(category_id) {
    const [rows] = await db.query(
      'SELECT COUNT(*) AS count FROM products WHERE category_id = ?',
      [category_id]
    )
    return rows[0].count > 0
  }

};
