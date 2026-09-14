const Inventory = require('../models/inventory.model');

exports.getInventory = async (req, res) => {
  try {
    const entries = await Inventory.getAll();
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el inventario' });
  }
};

exports.registerMovement = async (req, res) => {
  try {
    const { type, supplier_id } = req.body;
    if (type === "Entrada de Stock" && (!supplier_id || supplier_id === -1)) {
      return res.status(400).json({ error: "supplier_id es obligatorio para entradas de stock" });
    }
    const { insertId, newStock } = await Inventory.register(req.body);
    res.status(201).json({
      id: insertId,
      newStock,
      message: `Movimiento registrado y stock actualizado a ${newStock}`
    });
  } catch (error) {
    console.error("Error al registrar movimiento:", error);
    res.status(400).json({
      message: error.message
    });
  }
};
