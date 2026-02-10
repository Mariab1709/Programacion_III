const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    console.log('Sesión actual:', req.session.user);
    res.render('index', { user: req.session.user || null });
});

router.get('/login', (req, res) => {
    res.render('login', { error: req.query.error || null, user: req.session.user || null });
});

router.get('/register', (req, res) => {
    res.render('register', { error: null, user: req.session.user || null });
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;
