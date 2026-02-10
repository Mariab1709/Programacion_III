const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { isAdmin, isAuthenticated } = require('../middleware/authMiddleware');

router.get('/', (req, res) => {
    res.render('index', { user: req.session.user || null });
});

// Catálogo de productos (Público)
router.get('/products', async (req, res) => {
    try {
        const products = await Product.findAll();
        res.render('products/index', { products, user: req.session.user || null });
    } catch (error) {
        res.status(500).send('Error al cargar productos');
    }
});

// Detalle del producto (Público)
router.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).send('Producto no encontrado');
        }
        res.render('products/show', { product, user: req.session.user || null });
    } catch (error) {
        res.status(500).send('Error al cargar detalle del producto');
    }
});

// Dashboard de Administración (Solo Admin)
router.get('/admin/dashboard', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const products = await Product.findAll();
        res.render('admin/dashboard', { products, user: req.session.user || null });
    } catch (error) {
        res.status(500).send('Error al cargar panel de administración');
    }
});

// Vista de Edición de Producto (Solo Admin)
router.get('/admin/products/:id/edit', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).send('Producto no encontrado');
        }
        res.render('admin/edit', { product, user: req.session.user || null });
    } catch (error) {
        res.status(500).send('Error al cargar vista de edición');
    }
});

router.get('/login', (req, res) => {
    res.render('login', { error: null, user: req.session.user || null });
});

router.get('/register', (req, res) => {
    res.render('register', { error: null, user: req.session.user || null });
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;
