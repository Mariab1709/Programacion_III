const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, level } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }

    const user = await User.create({ name, email, password, level });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: { id: user.id, name: user.name, email: user.email, level: user.level }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, _ui } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const isValid = await user.validPassword(password);
    if (!isValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, level: user.level },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    req.session.user = { id: user.id, name: user.name, level: user.level };

    req.session.save((err) => {
      if (err) return res.status(500).send('Error de sesión');

      // Si viene de la interfaz (EJS) o es una petición de navegador, redirigir
      if (_ui === 'true' || (req.headers['accept'] && req.headers['accept'].includes('text/html'))) {
        return res.redirect('/');
      }

      res.json({
        message: 'Inicio de sesión exitoso',
        token,
        user: { id: user.id, name: user.name, email: user.email, level: user.level }
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};
