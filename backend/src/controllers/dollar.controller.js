const Dollar = require('../models/dollar.model');

// El tipo de cambio es variable: cada registro es solo un valor histórico/vigente.
// Los productos guardan el tipo de cambio con el que se calcularon (products.exchange_rate)
// y NO se recalculan cuando cambia el dólar.

function parseRate(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 && n < 1000 ? Math.round(n * 10000) / 10000 : null;
}

exports.getAll = async (req, res) => {
  try {
    res.json(await Dollar.getAll());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los tipos de cambio' });
  }
};

exports.getCurrent = async (req, res) => {
  try {
    const current = await Dollar.findLastRegister();
    res.json(current || null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el tipo de cambio actual' });
  }
};

exports.create = async (req, res) => {
  try {
    const price = parseRate(req.body.price);
    if (!price) return res.status(400).json({ error: 'Tipo de cambio inválido.' });
    const id = await Dollar.create({ price, observation: req.body.observation });
    res.status(201).json({ id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar el tipo de cambio' });
  }
};

exports.update = async (req, res) => {
  try {
    const price = parseRate(req.body.price);
    if (!price) return res.status(400).json({ error: 'Tipo de cambio inválido.' });
    const result = await Dollar.update(req.params.id, { price, observation: req.body.observation });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json({ message: 'Tipo de cambio actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el tipo de cambio' });
  }
};

exports.remove = async (req, res) => {
  try {
    if ((await Dollar.count()) <= 1) {
      return res.status(400).json({ error: 'Debe existir al menos un tipo de cambio.' });
    }
    const result = await Dollar.delete(req.params.id);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json({ message: 'Registro eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el registro' });
  }
};
