const db = require('../config/db');

exports.hasProducts = async (supplierId) => {
  const [rows] = await db.query(
    'SELECT COUNT(*) AS total FROM products WHERE supplier_id = ?',
    [supplierId]
  );
  return rows[0].total > 0;
};

exports.deactivate = async (supplierId) => {
  const [result] = await db.query(
    'UPDATE suppliers SET active = false WHERE supplier_id = ?',
    [supplierId]
  );
  return result;
};

exports.getAll = async (status = "active") => {
  let query = 'SELECT * FROM suppliers';
  if (status === "active") query += ' WHERE active = true';
  else if (status === "inactive") query += ' WHERE active = false';
  query += ' ORDER BY name ASC';

  const [rows] = await db.query(query);
  return rows;
};

exports.delete = async (supplierId) => {
  const [result] = await db.query(
    'DELETE FROM suppliers WHERE supplier_id = ?',
    [supplierId]
  );
  return result;
};

exports.create = async ({ name, contact_name, email, phone, address }) => {
  const [result] = await db.query(
    `INSERT INTO suppliers (name, contact_name, email, phone, address) 
     VALUES (?, ?, ?, ?, ?)`,
    [name, contact_name, email, phone, address]
  );
  return result.insertId;
};

exports.update = async (id, { name, contact_name, phone, email, address }) => {
  const [result] = await db.query(
    `UPDATE suppliers SET name = ?, contact_name = ?, phone = ?, email = ?, address = ? WHERE supplier_id = ?`,
    [name, contact_name, phone, email, address, id]
  );
  return result;
};
