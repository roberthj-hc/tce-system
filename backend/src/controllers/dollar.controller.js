const Dollar = require('../models/dollar.model');

exports.getAllRegister = async (req, res) => {
  try {
    const dollar = await Dollar.getAll();
    res.json(dollar);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los registros del dolar' });
  }
};

exports.getDollarById = async (req, res) => {
  try {
    const dollar = await Dollar.getById(req.params.id);
    if (!dollar) {
      return res.status(404).json({ error: 'Dolar no encontrado' });
    }
    res.json(dollar);
  } catch (error) {
    res.status(500).json({ error: 'Error al recuperar el dolar' });
  }
};

exports.createDollar = async (req, res) => {
  try {
    const id = await Dollar.create(req.body);
    res.status(201).json({ customer_id: id });
  } catch (error) {
    console.error("Error al crear el cliente:", error);
    res.status(500).json({ error: 'Error al crear el cliente' });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    await Customer.update(req.params.id, req.body);
    res.json({ message: 'Cliente actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el cliente' });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Customer.delete(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.status(200).json({ message: 'Cliente eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el cliente' });
  };
};

exports.findCustomer = async (req, res) => {
  try {
    const { ci, phone } = req.query;
    const customer = await Customer.findByCIOrPhone(ci, phone);
    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar el cliente' });
  }
};
