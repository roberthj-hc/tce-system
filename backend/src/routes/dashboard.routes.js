const express = require("express")
const router = express.Router()
const db = require("../config/db")
const dayjs = require("dayjs")

router.get("/", async (req, res) => {
  try {
    const today = dayjs().format("YYYY-MM-DD")

    const [salesTodayRows] = await db.query(
      "SELECT IFNULL(SUM(total), 0) AS total FROM sales WHERE DATE(date) = ?", [today]
    )

    const [stockAlertsRows] = await db.query(
      "SELECT COUNT(*) AS count FROM products WHERE stock < stock_minimum"
    )

    const [topProductsRows] = await db.query(`
      SELECT p.name, SUM(sd.quantity) AS sales
      FROM sale_details sd
      JOIN products p ON sd.product_id = p.product_id
      GROUP BY p.product_id
      ORDER BY sales DESC
      LIMIT 3
    `)

    const [categorySalesRows] = await db.query(`
      SELECT c.name AS category, SUM(sd.quantity * sd.unit_price) AS sales
      FROM sale_details sd
      JOIN products p ON sd.product_id = p.product_id
      JOIN categories c ON p.category_id = c.category_id
      GROUP BY c.category_id
    `)

    const [weeklySalesRows] = await db.query(`
      SELECT DAYNAME(date) AS day, SUM(total) AS sales
      FROM sales
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DAYNAME(date)
    `)

    const [totalStockRows] = await db.query(
      "SELECT name, stock FROM products ORDER BY stock DESC LIMIT 10"
    )

    const [topSellingRows] = await db.query(`
      SELECT p.name, SUM(sd.quantity) AS sales
      FROM sale_details sd
      JOIN products p ON sd.product_id = p.product_id
      GROUP BY p.product_id
      ORDER BY sales DESC
      LIMIT 10
    `)

    const [rateRows] = await db.query(
      "SELECT price, register_date FROM dollar_exchange ORDER BY register_date DESC, dollar_exchange_id DESC LIMIT 1"
    )

    const [profitTodayRows] = await db.query(`
      SELECT IFNULL(SUM(sd.quantity * (sd.unit_price - COALESCE(sd.unit_cost, p.cost))), 0) AS profit
      FROM sales s
      JOIN sale_details sd ON sd.sale_id = s.sale_id
      JOIN products p ON p.product_id = sd.product_id
      WHERE DATE(s.date) = ?
    `, [today])

    const response = {
      exchangeRate: rateRows[0]
        ? { price: parseFloat(rateRows[0].price), date: rateRows[0].register_date }
        : null,
      summary: {
        profitToday: parseFloat(profitTodayRows[0].profit || 0),
        salesToday: parseFloat(salesTodayRows[0].total || 0),
        lowStockAlerts: stockAlertsRows[0].count || 0,
        topProducts: topProductsRows.map(p => ({
          name: p.name,
          sales: p.sales
        }))
      },
      categorySales: categorySalesRows.map(c => ({
        category: c.category,
        sales: parseFloat(c.sales)
      })),
      weeklySales: weeklySalesRows.map(w => ({
        day: w.day,
        sales: parseFloat(w.sales)
      })),
      totalStock: totalStockRows.map(s => ({
        name: s.name,
        stock: s.stock
      })),
      topSelling: topSellingRows.map(t => ({
        name: t.name,
        sales: t.sales
      }))
    }

    res.json(response)

  } catch (error) {
    console.error("Dashboard error:", error)
    res.status(500).json({ error: "Error al cargar los datos del panel" })
  }
})

module.exports = router
