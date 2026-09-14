const Repair = require('../models/repair.model');

exports.createRepair = async (req, res) => {
  try {
    const id = await Repair.create(req.body);
    res.status(201).json({ repair_id: id });
  } catch (error) {
    console.error("Error al crear la reparación:", error);
    res.status(500).json({ error: 'Error al crear la reparación' });
  }
};

exports.listRepairs = async (req, res) => {
  try {
    const repairs = await Repair.list();
    res.json(repairs);
  } catch (error) {
    console.error("Error al obtener las reparaciones:", error);
    res.status(500).json({ error: 'Error al obtener las reparaciones' });
  }
};

exports.deleteRepair = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await Repair.delete(id);
    if (success) {
      res.json({ message: 'Reparación eliminada correctamente' });
    } else {
      res.status(404).json({ error: 'Reparación no encontrada' });
    }
  } catch (error) {
    console.error("Error al eliminar la reparación:", error);
    res.status(500).json({ error: 'Error al eliminar la reparación' });
  }
};

exports.getRepairById = async (req, res) => {
  try {
    const { id } = req.params;
    const repair = await Repair.getById(id);
    if (repair) {
      res.json(repair);
    } else {
      res.status(404).json({ error: 'Reparación no encontrada' });
    }
  } catch (error) {
    console.error("Error al obtener la reparación:", error);
    res.status(500).json({ error: 'Error al obtener la reparación' });
  }
};

exports.updateRepair = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await Repair.update(id, req.body);
    if (success) {
      res.json({ message: 'Reparación actualizada correctamente' });
    } else {
      res.status(404).json({ error: 'Reparación no encontrada' });
    }
  } catch (error) {
    console.error("Error al actualizar la reparación:", error);
    res.status(500).json({ error: 'Error al actualizar la reparación' });
  }
};

exports.getDetailedRepair = async (req, res) => {
  try {
    const { id } = req.params;
    const repair = await Repair.getDetailedById(id);
    if (repair) {
      res.json(repair);
    } else {
      res.status(404).json({ error: 'Reparación no encontrada' });
    }
  } catch (error) {
    console.error("Error al obtener la reparación detallada:", error);
    res.status(500).json({ error: 'Error al obtener la reparación detallada' });
  }
};

exports.updateRepairFields = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await Repair.updateFields(id, req.body);

    if (!success) {
      return res.status(404).json({ error: 'Reparación no encontrada' });
    }
    const updatedRepair = await Repair.getById(id);
    res.json(updatedRepair);
  } catch (error) {
    console.error("Error al actualizar los campos de la reparación:", error);
    res.status(500).json({ error: 'Error al actualizar la reparación' });
  }
};

exports.getFilteredRepairs = async (req, res) => {
  try {
    const { from, to, repair } = req.query;
    const repairs = await Sale.getFiltered({ from, to, repair });
    res.json(repairs);
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar las reparaciones' });
  }
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const success = await Repair.updateStatus(id, status);
    if (success) {
      res.status(200).json({ message: "Estado actualizado correctamente" });
    } else {
      res.status(404).json({ error: "Reparación no encontrada" });
    }
  } catch (err) {
    res.status(500).json({ error: "Error del servidor" });
  }
};

exports.listByDate = async (req, res) => {
  const { from, to } = req.query;
  try {
    const repairs = await Repair.getFilteredByDate(from, to);
    res.json(repairs);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener las reparaciones" });
  }
};

exports.listRepairsWithDetails = async (req, res) => {
  const { from, to } = req.query;
  try {
    const repairs = await Repair.getRepairsWithCustomerDetails(from, to);
    res.json(repairs);
  } catch (err) {
    console.error("Error al obtener las reparaciones con detalles:", err);
    res.status(500).json({ error: "Error al obtener las reparaciones" });
  }
};