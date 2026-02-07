module.exports = (req, res, next) => {
  if (req.session.user && req.session.user.level === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
};
