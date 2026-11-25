const db = require('./db');

async function columnExists(table, column) {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS n FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows[0].n > 0;
}

async function addColumn(table, column, definition) {
  if (!(await columnExists(table, column))) {
    await db.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
    console.log(`[schema] ${table}.${column} agregado`);
    return true;
  }
  return false;
}

// Migraciones idempotentes: se ejecutan al arrancar y sirven tanto para BD nuevas como existentes.
async function ensureSchema() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS dollar_exchange (
      dollar_exchange_id INT AUTO_INCREMENT PRIMARY KEY,
      price DECIMAL(10,4) NOT NULL,
      observation VARCHAR(250),
      register_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  // el tipo de cambio puede tener más de 2 decimales
  const [scale] = await db.query(
    `SELECT NUMERIC_SCALE AS s FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dollar_exchange' AND COLUMN_NAME = 'price'`
  );
  if (scale[0] && Number(scale[0].s) < 4) {
    await db.query('ALTER TABLE dollar_exchange MODIFY price DECIMAL(10,4) NOT NULL');
  }

  // Costo en dólares y margen de cada producto (precio = costo * (1 + margen/100))
  await addColumn('products', 'cost_usd', 'DECIMAL(12,4) NULL');
  await addColumn('products', 'margin_percent', 'DECIMAL(7,2) NULL');
  // Tipo de cambio con el que se calculó el costo del producto (cada producto conserva el suyo)
  if (await addColumn('products', 'exchange_rate', 'DECIMAL(10,4) NULL')) {
    await db.query(
      'UPDATE products SET exchange_rate = ROUND(cost / cost_usd, 4) WHERE cost_usd > 0 AND cost > 0'
    );
  }

  // Tipo de cambio usado en la venta (NULL = se usó el costo registrado de cada producto)
  await addColumn('sales', 'exchange_rate', 'DECIMAL(10,4) NULL');

  // Costo (Bs) del producto en el momento de la venta, para que los reportes de utilidad
  // no cambien retroactivamente cuando cambia el dólar.
  if (await addColumn('sale_details', 'unit_cost', 'DECIMAL(12,4) NULL')) {
    await db.query(`
      UPDATE sale_details sd JOIN products p ON p.product_id = sd.product_id
      SET sd.unit_cost = p.cost WHERE sd.unit_cost IS NULL
    `);
  }
}

module.exports = { ensureSchema };
