const db = require('../config/db');
const Sale = require('../models/sale.model');
const SaleDetail = require('../models/saleDetail.model');
const Product = require('../models/product.model');

exports.getAllSales = async (req, res) => {
  try {
    const sale = await Sale.getAll();
    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las ventas' });
  }
};

exports.createSale = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { sale, details } = req.body;

    if (!sale || !details || !Array.isArray(details)) {
      return res.status(400).json({ error: 'Datos de venta faltantes o inválidos' });
    }

    await connection.beginTransaction();

    const saleId = await Sale.create(sale, connection);

    for (const detail of details) {
      const currentStock = await Product.getStock(detail.product_id, connection);

      if (currentStock === null) {
        throw new Error(`Producto con ID ${detail.product_id} no encontrado`);
      }

      if (currentStock < detail.quantity) {
        throw new Error(`Stock insuficiente para el producto. ${detail.product_id}`);
      }

      await SaleDetail.create({ ...detail, sale_id: saleId }, connection);

      const newStock = currentStock - detail.quantity;
      await Product.updateStock(detail.product_id, newStock, connection);

      const productInfo = await Product.getById(detail.product_id, connection);
      if (newStock <= productInfo.stock_minimum) {
        await db.query(
          `INSERT INTO notifications (type, title, message, role_id, date, expiration_date)
          VALUES (?, ?, ?, ?, NOW(), NULL)`,
          [
            newStock <= 0 ? 'error' : 'warning',
            newStock <= 0 ? 'Producto agotado' : 'Stock bajo',
            `El producto "${productInfo.name}" tiene ${newStock} unidades restantes.`,
            2
          ]
        );
      }
    }

    await connection.commit();
    res.status(201).json({ saleId });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({
      error: 'Error al registrar la venta',
      message: error.message
    });
  } finally {
    connection.release();
  }
};

exports.getFilteredSales = async (req, res) => {
  try {
    const { from, to, seller } = req.query;
    const sales = await Sale.getFiltered({ from, to, seller });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar las ventas' });
  }
};

exports.getSaleDetails = async (req, res) => {
  try {
    const saleId = req.params.saleId;
    if (!saleId) return res.status(400).json({ error: 'Falta el ID de la venta' });

    const details = await SaleDetail.getBySaleId(saleId);
    res.json(details);
  } catch (error) {
    console.error('Error al obtener detalles de la venta:', error);
    res.status(500).json({ error: 'Error al cargar los detalles de la venta' });
  }
};
