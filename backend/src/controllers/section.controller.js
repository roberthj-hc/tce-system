const Section = require('../models/section.model');

exports.getAllSections = async (req, res) => {
  try {
    const sections = await Section.getAll();
    res.json(sections);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las secciones' });
  }
};

exports.getSectionById = async (req, res) => {
  try {
    const section = await Section.getById(req.params.id);
    if (!section) return res.status(404).json({ error: 'Sección no encontrada' });
    res.json(section);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la sección' });
  }
};

exports.createSection = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'El nombre es obligatorio' });
    const id = await Section.create(name, description);
    res.status(201).json({ id });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la sección' });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const { name, description } = req.body;
    const updated = await Section.update(req.params.id, name, description);
    if (!updated) return res.status(404).json({ error: 'Sección no encontrada' });
    res.json({ message: 'Sección actualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la sección' });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const section_id = req.params.id

    const hasLinked = await Section.hasCategories(section_id)
    if (hasLinked) {
      await Section.deactivate(section_id)
      return res.status(200).json({
        message: 'La sección tiene categorías asociadas y fue desactivada'
      })
    }

    const deleted = await Section.delete(section_id)
    if (!deleted) return res.status(404).json({ error: 'Sección no encontrada' })

    res.json({ message: 'Sección eliminada' })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la sección' })
  }
};

exports.activateSection = async (req, res) => {
  try {
    const section_id = req.params.id;
    const activated = await Section.activate(section_id);
    if (!activated) return res.status(404).json({ error: 'Sección no encontrada' });

    res.json({ message: 'Sección activada' });
  } catch {
    res.status(500).json({ error: 'Error al activar la sección' });
  }
};