const Product = require('../models/product.model');
const Inventory = require('../models/inventory.model');
const path = require('path');
const fs = require('fs');

exports.getAllProducts = async (req, res) => {
  try {
    const { status } = req.query;
    const products = await Product.getAll(status);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error al recuperar el producto' });
  }
};

exports.createProduct = async (req, res) => {
  const connection = await require('../config/db').getConnection();
  try {
    await connection.beginTransaction();
    const exists = await Product.barcodeExists(req.body.barcode);
    if (exists) {
      connection.release();
      return res.status(400).json({ error: 'El código de barras ya está registrado.' });
    }

    // El stock inicial entra solo por el movimiento de inventario (si no, se contaba dos veces)
    const stockInicial = Number(req.body.stock);
    const { id, name } = await Product.create({ ...req.body, stock: stockInicial > 0 ? 0 : req.body.stock });
    if (stockInicial > 0) {
      const movement = {
        product_id: id,
        supplier_id: req.body.supplier_id || null,
        type: "Entrada de Stock",
        quantity: stockInicial,
        date: new Date(),
        comment: "Stock inicial al registrar producto",
        user_id: req.body.user_id ? Number(req.body.user_id) : null,
      };
      await Inventory.register(movement);
    }
    await connection.commit();
    connection.release();
    res.status(201).json({ id, name, message: 'Producto registrado correctamente y stock inicial añadido a inventario.' });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Error al crear el producto con stock inicial:', error);
    res.status(500).json({ error: 'Error al crear el producto o registrar el stock inicial' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    await Product.update(req.params.id, req.body);
    res.json({ message: 'Producto actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
};


exports.uploadProductPhoto = async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ error: 'No se subió ningún archivo.' });
  }
  const photo = req.files.photo;
  const ext = path.extname(path.basename(photo.name)).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) || !photo.mimetype.startsWith('image/')) {
    return res.status(400).json({ error: 'Solo se permiten imágenes (jpg, png, webp, gif).' });
  }
  const uploadDir = path.join(__dirname, '..', 'public', 'products');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const safeBase = path.basename(photo.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60);
  const fileName = `${Date.now()}-${safeBase}${ext}`;
  const filePath = path.join(uploadDir, fileName);
  const serverPath = `/products/${fileName}`;

  try {
    await photo.mv(filePath);
    res.status(200).json({ filePath: serverPath });
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    res.status(500).json({ error: 'Error al subir la imagen.' });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const hasSales = await Product.hasSales(id);

    if (hasSales) {
      const result = await Product.deactivate(id);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      return res.status(200).json({ message: 'Producto desactivado porque tiene ventas registradas' });
    }

    const result = await Product.delete(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar/desactivar producto:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};

exports.checkBarcodeExists = async (req, res) => {
  try {
    const { barcode } = req.query;
    if (!barcode) {
      return res.status(400).json({ error: "Falta el parámetro 'barcode'" });
    }
    const exists = await Product.barcodeExists(barcode);
    res.json({ exists });
  } catch (error) {
    console.error("Error al verificar código de barras:", error);
    res.status(500).json({ error: "Error al verificar el código de barras" });
  }
};
