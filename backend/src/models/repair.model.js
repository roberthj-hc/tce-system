const db = require('../config/db');

module.exports = {
  async create(repair) {
    const {
      customer_id,
      description,
      model,
      total_price,
      deposit,
      spare_part_cost,
      status,
      observations,
      user_id
    } = repair;
    const [result] = await db.query(
      `INSERT INTO repairs (
        customer_id, description, model, total_price, deposit,
        spare_part_cost, status, received_at,
        observations, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
      [
        customer_id, description, model, total_price, deposit,
        spare_part_cost, status,
        observations, user_id
      ]
    );
    return result.insertId;
  },

  async list() {
    const [rows] = await db.query(`SELECT * FROM repairs ORDER BY received_at DESC`);
    return rows;
  },

  async delete(id) {
    const [result] = await db.query(`DELETE FROM repairs WHERE repair_id = ?`, [id]);
    return result.affectedRows > 0;
  },

  async getById(id) {
    const [rows] = await db.query(`
    SELECT *,
      (total_price - deposit) AS balance,
      (total_price - spare_part_cost) AS profit
    FROM repairs
    WHERE repair_id = ?
  `, [id]);
    return rows[0];
  },

  async update(id, repair) {
    const {
      customer_id,
      description,
      model,
      total_price,
      deposit,
      spare_part_cost,
      status,
      delivered_at,
      observations,
      user_id
    } = repair;
    const [result] = await db.query(
      `UPDATE repairs SET
        customer_id = ?, description = ?, model = ?, total_price = ?, deposit = ?,
        spare_part_cost = ?, status = ?, delivered_at = ?, observations = ?, user_id = ?
      WHERE repair_id = ?`,
      [
        customer_id, description, model, total_price, deposit,
        spare_part_cost, status, delivered_at, observations, user_id, id
      ]
    );
    return result.affectedRows > 0;
  },

  async getDetailedById(id) {
    const [rows] = await db.query(`
    SELECT r.*, 
           u.name AS user_name, u.email AS user_email,
           c.name AS customer_name, c.phone AS customer_phone, c.email AS customer_email
    FROM repairs r
    JOIN users u ON r.user_id = u.id
    LEFT JOIN customers c ON r.customer_id = c.customer_id
    WHERE r.repair_id = ?
  `, [id]);
    return rows[0];
  },

  async updateFields(id, fields) {
    const allowedFields = ["total_price", "deposit", "spare_part_cost"];
    const entries = Object.entries(fields).filter(([key, value]) =>
      allowedFields.includes(key) && value !== undefined
    );
    if (entries.length === 0) return false;
    const setClause = entries.map(([key]) => `${key} = ?`).join(", ");
    const values = entries.map(([, value]) => value);
    const [result] = await db.query(
      `UPDATE repairs SET ${setClause} WHERE repair_id = ?`,
      [...values, id]
    );
    return result.affectedRows > 0;
  },

  async updateStatus(id, status) {
    const query = `
    UPDATE repairs
    SET status = ?, delivered_at = ${status === 'delivered' ? 'NOW()' : 'NULL'}
    WHERE repair_id = ?
  `;
    const [result] = await db.query(query, [status, id]);
    return result.affectedRows > 0;
  },

  async getFilteredByDate(from, to) {
    const [rows] = await db.query(`
    SELECT 
      r.repair_id,
      r.user_id,
      r.customer_id,
      r.model,
      r.total_price,
      r.deposit,
      r.spare_part_cost,
      (r.total_price - r.deposit) AS balance,
      (r.total_price - r.spare_part_cost) AS profit,
      r.status,
      r.received_at AS repair_date,
      r.delivered_at
    FROM repairs r
    WHERE r.delivered_at IS NULL
       OR DATE(r.received_at) BETWEEN ? AND ?
    ORDER BY r.received_at DESC
  `, [from, to]);
    return rows;
  },

  async getRepairsWithCustomerDetails(from, to) {
    const [rows] = await db.query(`
        SELECT 
            r.*, 
            (r.total_price - r.deposit) AS balance,
            (r.total_price - r.spare_part_cost) AS profit,
            c.name AS customer_name, 
            c.email AS customer_email, 
            c.phone AS customer_phone,
            c.ci AS customer_ci,
            u.name AS user_name, 
            u.email AS user_email
        FROM repairs r
        LEFT JOIN customers c ON r.customer_id = c.customer_id
        LEFT JOIN users u ON r.user_id = u.id
        WHERE DATE(r.delivered_at) IS NULL
            OR DATE(r.received_at) BETWEEN ? AND ?
        ORDER BY r.received_at DESC
    `, [from, to]);
    return rows;
  }
};
