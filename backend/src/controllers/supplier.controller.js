const Supplier = require('../models/supplier.model');

exports.getAllSuppliers = async (req, res) => {
  try {
    const { status } = req.query;
    const suppliers = await Supplier.getAll(status);
    res.status(200).json(suppliers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los proveedores' });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const { name, contact_name, email, phone, address } = req.body;
    if (!name || !contact_name || !phone) {
      return res.status(400).json({ error: 'Nombre, contacto y teléfono son obligatorios' });
    }

    const id = await Supplier.create({ name, contact_name, email, phone, address });
    res.status(201).json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear el proveedor' });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact_name, phone, email, address } = req.body;

    if (!name || !contact_name || !phone) {
      return res.status(400).json({ error: 'Nombre, contacto y teléfono son obligatorios' });
    }

    const result = await Supplier.update(id, { name, contact_name, phone, email, address });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    res.status(200).json({ message: 'Proveedor actualizado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el proveedor' });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const hasProducts = await Supplier.hasProducts(id);

    if (hasProducts) {
      const result = await Supplier.deactivate(id);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Proveedor no encontrado' });
      }
      return res.status(200).json({ message: 'Proveedor desactivado porque tiene productos asociados' });
    }

    const result = await Supplier.delete(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    res.status(200).json({ message: 'Proveedor eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar el proveedor' });
  }
};
