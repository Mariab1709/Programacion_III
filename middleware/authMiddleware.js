const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.level === 'admin') {
        return next();
    }
    // Si no es admin, redirigir o devolver error
    if (req.headers['accept'] && req.headers['accept'].includes('text/html')) {
        return res.redirect('/');
    }
    return res.status(403).json({ message: 'Acceso denegado: Se requieren permisos de administrador' });
};

const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    if (req.headers['accept'] && req.headers['accept'].includes('text/html')) {
        return res.redirect('/login');
    }
    return res.status(401).json({ message: 'Debe iniciar sesión' });
};

module.exports = { isAdmin, isAuthenticated };
