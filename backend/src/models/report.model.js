const db = require('../config/db');
const { format } = require('date-fns');

module.exports = {
  async getDailySalesList(date) {
    const [sales] = await db.query(`
    SELECT
      s.sale_id,
      DATE(s.date) AS sale_date,
      TIME(s.date) AS sale_time,
      u.name AS seller_name,
      s.total AS total_sale,
      (SELECT SUM(sd.quantity * (sd.unit_price - p.cost))
       FROM sale_details sd
       JOIN products p ON sd.product_id = p.product_id
       WHERE sd.sale_id = s.sale_id) AS total_profit,
      sct.name AS section_name, -- Solo sección
      sct.section_id AS section_id -- Solo sección
    FROM sales s
    LEFT JOIN users u ON s.seller_id = u.id
    LEFT JOIN sale_details sd ON s.sale_id = sd.sale_id
    LEFT JOIN products p ON sd.product_id = p.product_id
    LEFT JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN sections sct ON c.section_id = sct.section_id -- Solo unimos con la tabla sections
    WHERE DATE(s.date) = ?
    ORDER BY s.date ASC
  `, [date]);

    return sales.map(sale => ({
      sale_id: sale.sale_id,
      sale_date: sale.sale_date,
      sale_time: sale.sale_time,
      seller_name: sale.seller_name,
      total_sale: parseFloat(sale.total_sale || 0),
      total_profit: parseFloat(sale.total_profit || 0),
      section_name: sale.section_name,
      section_id: sale.section_id 
    }));
  },

  async getDetailedDailySalesReport(date) {
    const [sales] = await db.query(`
      SELECT
        s.sale_id,
        DATE(s.date) AS sale_date,
        u.name AS seller_name,
        s.total AS total_sale,
        SUM(sd.quantity * (sd.unit_price - p.cost)) AS total_profit,
        GROUP_CONCAT(
          JSON_OBJECT(
            'product_name', p.name,
            'category_name', c.name,
            'quantity', sd.quantity,
            'unit_price', sd.unit_price,
            'cost', p.cost,
            'profit', sd.quantity * (sd.unit_price - p.cost)
          )
          ORDER BY p.name ASC SEPARATOR '|'
        ) AS products_json
      FROM sales s
      LEFT JOIN users u ON s.seller_id = u.id
      LEFT JOIN sale_details sd ON s.sale_id = sd.sale_id
      LEFT JOIN products p ON sd.product_id = p.product_id
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE DATE(s.date) = ?
      GROUP BY s.sale_id
      ORDER BY s.date ASC
    `, [date]);
    sales.forEach(sale => {
      sale.total_sale = parseFloat(sale.total_sale || 0);
      sale.total_profit = parseFloat(sale.total_profit || 0);
      if (sale.products_json) {
        sale.products = sale.products_json.split('|').map(pStr => {
          const parsedProduct = JSON.parse(pStr);
          parsedProduct.quantity = parseFloat(parsedProduct.quantity || 0);
          parsedProduct.unit_price = parseFloat(parsedProduct.unit_price || 0);
          parsedProduct.cost = parseFloat(parsedProduct.cost || 0);
          parsedProduct.profit = parseFloat(parsedProduct.profit || 0);
          return parsedProduct;
        });
      } else {
        sale.products = [];
      }
      delete sale.products_json;
    });
    return sales;
  },

  async getMonthlySalesSummary(from, to) {
    const [rows] = await db.query(`
      SELECT
        DATE(s.date) AS sale_date,
        SUM(s.total) AS total_sales,
        SUM(sd.quantity * (sd.unit_price - p.cost)) AS total_profit
      FROM sales s
      JOIN sale_details sd ON s.sale_id = sd.sale_id
      JOIN products p ON sd.product_id = p.product_id
      WHERE DATE(s.date) BETWEEN ? AND ?
      GROUP BY DATE(s.date)
      ORDER BY sale_date ASC
    `, [from, to]);
    return rows.map(row => ({
      date: format(new Date(row.sale_date), 'yyyy-MM-dd'),
      total_sales: parseFloat(row.total_sales || 0),
      total_profit: parseFloat(row.total_profit || 0)
    }));
  },

  async getYearlySalesSummary(from, to) {
    const [rows] = await db.query(`
      SELECT
        DATE_FORMAT(s.date, '%Y-%m') AS sale_month,
        SUM(s.total) AS total_sales,
        SUM(sd.quantity * (sd.unit_price - p.cost)) AS total_profit
      FROM sales s
      JOIN sale_details sd ON s.sale_id = sd.sale_id
      JOIN products p ON sd.product_id = p.product_id
      WHERE DATE(s.date) BETWEEN ? AND ?
      GROUP BY sale_month
      ORDER BY sale_month ASC
    `, [from, to]);
    return rows.map(row => ({
      month: row.sale_month,
      total_sales: parseFloat(row.total_sales || 0),
      total_profit: parseFloat(row.total_profit || 0)
    }));
  },

  async getDailyRepairsList(date) {
    const [repairs] = await db.query(`
      SELECT
        r.repair_id,
        DATE(r.received_at) AS repair_date,
        TIME(r.received_at) AS repair_time,
        u.name AS technician_name,
        c.name AS customer_name,
        r.model,
        r.description,
        r.status,
        r.total_price,
        r.spare_part_cost,
        (r.total_price - r.spare_part_cost) AS total_profit,
        r.observations
      FROM repairs r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN customers c ON r.customer_id = c.customer_id
      WHERE 
        (DATE(r.delivered_at) = ?)
        OR (
          DATE(r.received_at) = ? AND r.delivered_at IS NULL
        )
      ORDER BY r.delivered_at ASC
    `, [date, date, date]);
    return repairs.map(repair => ({
      repair_id: repair.repair_id,
      repair_date: repair.repair_date,
      repair_time: repair.repair_time,
      technician_name: repair.technician_name,
      customer_name: repair.customer_name,
      model: repair.model,
      description: repair.description,
      observations: repair.observations,
      status: repair.status,
      total_price: parseFloat(repair.total_price || 0),
      spare_part_cost: parseFloat(repair.spare_part_cost || 0),
      total_profit: parseFloat(repair.total_profit || 0)
    }));
  },

  async getMonthlyRepairsSummary(from, to) {
    const [rows] = await db.query(`
      SELECT
        DATE(r.received_at) AS repair_date,
        SUM(r.total_price) AS total_repairs,
        SUM(r.total_price - r.spare_part_cost) AS total_profit
      FROM repairs r
      WHERE DATE(r.received_at) BETWEEN ? AND ?
      GROUP BY DATE(r.received_at)
      ORDER BY repair_date ASC
    `, [from, to]);
    return rows.map(row => ({
      date: format(new Date(row.repair_date), 'yyyy-MM-dd'),
      total_repairs: parseFloat(row.total_repairs || 0),
      total_profit: parseFloat(row.total_profit || 0)
    }));
  },

  async getYearlyRepairsSummary(from, to) {
    const [rows] = await db.query(`
      SELECT
        DATE_FORMAT(r.received_at, '%Y-%m') AS repair_month,
        SUM(r.total_price) AS total_repairs,
        SUM(r.total_price - r.spare_part_cost) AS total_profit
      FROM repairs r
      WHERE DATE(r.received_at) BETWEEN ? AND ?
      GROUP BY repair_month
      ORDER BY repair_month ASC
    `, [from, to]);
    return rows.map(row => ({
      month: row.repair_month,
      total_repairs: parseFloat(row.total_repairs || 0),
      total_profit: parseFloat(row.total_profit || 0)
    }));
  }

};