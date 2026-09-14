const User = require('../models/user.model');
const Role = require('../models/role.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, last_name, email, phone, password, address, role_id, code } = req.body;
    const roleId = parseInt(role_id);

    if (roleId === 1) {
      const admins = await User.getByRoleId(1);

      if (admins.length === 0) {
        const adminRole = await Role.getById(1);
        if (!adminRole || adminRole.code !== code) {
          return res.status(403).json({ error: 'Código incorrecto' });
        }
      } else {
        const validAdmin = admins.find((admin) => admin.email === code);
        if (!validAdmin) {
          return res.status(403).json({ error: 'Código incorrecto' });
        }
      }
    }

    const id = await User.create({ name, last_name, email, phone, password, address, role_id: roleId });
    res.status(201).json({ id });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.getByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    if (!user.is_active) {
      return res.status(403).json({ error: 'La cuenta del usuario está desactivada' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Contraseña inválida' });
    }
    const payload = {
      id: user.id,
      role_id: user.role_id,
      name: user.name,
      email: user.email
    };
    const token = jwt.sign(payload, 'my_secret_key', { expiresIn: '14h' });
    res.status(200).json({ message: 'Inicio de sesión exitoso', token });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getSellers = async (req, res) => {
  try {
    const sellers = await User.getSellers();
    res.json(sellers);
  } catch (error) {
    console.error('Error al obtener vendedores:', error);
    res.status(500).json({ error: 'Error al obtener los vendedores' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, last_name, email, phone, address, role_id, is_active } = req.body;
    await User.updateUser(id, { name, last_name, email, phone, address, role_id, is_active });
    res.status(200).json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.getOne(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const hasTransactions = await User.hasTransactions(id);
    if (hasTransactions) {
      return res.status(400).json({ error: 'No se puede eliminar el usuario con transacciones. Por favor, desactívelo en su lugar.' });
    }

    await User.deleteUser(id);
    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};

exports.hasTransactions = async (req, res) => {
  try {
    const { id } = req.params;
    const hasTransactions = await User.hasTransactions(id);
    res.status(200).json({ hasTransactions });
  } catch (error) {
    console.error('Error al verificar transacciones:', error);
    res.status(500).json({ error: 'Error al verificar transacciones' });
  }
};
