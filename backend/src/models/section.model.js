const db = require('../config/db');

module.exports = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM sections ORDER BY name ASC');
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM sections WHERE section_id = ?', [id]);
    return rows[0];
  },

  async create(name, description) {
    const [result] = await db.query(
      'INSERT INTO sections (name, description) VALUES (?, ?)',
      [name, description]
    );
    return result.insertId;
  },

  async update(id, name, description) {
    const [result] = await db.query(
      'UPDATE sections SET name = ?, description = ? WHERE section_id = ?',
      [name, description, id]
    );
    return result.affectedRows;
  },

  async delete(id) {
    const [result] = await db.query('DELETE FROM sections WHERE section_id = ?', [id]);
    return result.affectedRows;
  },

  async hasCategories(section_id) {
    const [rows] = await db.query(
      'SELECT COUNT(*) AS total FROM categories WHERE section_id = ?',
      [section_id]
    );
    return rows[0].total > 0;
  },

  async deactivate(section_id) {
    const [sectionResult] = await db.query(
      'UPDATE sections SET is_active = FALSE WHERE section_id = ?',
      [section_id]
    );
    const [categoryResult] = await db.query(
      'UPDATE categories SET is_active = FALSE WHERE section_id = ?',
      [section_id]
    );
    return {
      sectionAffected: sectionResult.affectedRows,
      categoriesAffected: categoryResult.affectedRows
    };
  },

  async activate(section_id) {
    const [sectionResult] = await db.query(
      'UPDATE sections SET is_active = TRUE WHERE section_id = ?',
      [section_id]
    );
    const [categoryResult] = await db.query(
      'UPDATE categories SET is_active = TRUE WHERE section_id = ?',
      [section_id]
    );
    return {
      sectionAffected: sectionResult.affectedRows,
      categoriesAffected: categoryResult.affectedRows
    };
  },


};
