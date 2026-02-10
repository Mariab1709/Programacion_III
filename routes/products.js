const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isAdmin, isAuthenticated } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Rutas públicas
router.get('/', productController.getAllProducts);
router.get('/code/:code', productController.getProductByCode);

// Rutas protegidas para administradores
router.post('/', isAuthenticated, isAdmin, upload.single('image'), productController.createProduct);
router.put('/:id', isAuthenticated, isAdmin, productController.updateProduct);
router.delete('/:id', isAuthenticated, isAdmin, productController.deleteProduct);

module.exports = router;
