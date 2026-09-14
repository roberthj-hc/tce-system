const Category = require('../models/category.model');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.getAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las categorías' });
  }
};

exports.getCategoriesBySection = async (req, res) => {
  try {
    const section_id = req.params.section_id;
    const categories = await Category.getBySection(section_id);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías por sección' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description, section_id } = req.body;
    if (!name || !section_id)
      return res.status(400).json({ error: 'Nombre y sección son obligatorios' });

    const id = await Category.create(name, description, section_id);
    res.status(201).json({ id });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la categoría' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category_id = req.params.id;
    const { name, description, section_id } = req.body;

    const updated = await Category.update(category_id, name, description, section_id);
    if (!updated) return res.status(404).json({ error: 'Categoría no encontrada' });

    res.json({ message: 'Categoría actualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la categoría' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category_id = req.params.id;

    const hasLinkedProducts = await Category.hasProducts(category_id);
    if (hasLinkedProducts) {
      await Category.deactivate(category_id);
      return res.status(200).json({
        message: 'La categoría tiene productos asociados y fue desactivada'
      });
    }

    const deleted = await Category.delete(category_id);
    if (!deleted)
      return res.status(404).json({ error: 'Categoría no encontrada' });

    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar la categoría:', error);
    res.status(500).json({ error: 'Error al eliminar la categoría' });
  }
};

exports.activateCategory = async (req, res) => {
  try {
    const category_id = req.params.id;
    const activated = await Category.activate(category_id);
    if (!activated) return res.status(404).json({ error: 'Categoría no encontrada' });

    res.json({ message: 'Categoría activada' });
  } catch {
    res.status(500).json({ error: 'Error al activar la categoría' });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.getById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la categoría' });
  }
};
