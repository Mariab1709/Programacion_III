const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Todas las rutas del carrito requieren autenticación
router.use(isAuthenticated);

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.post('/checkout', cartController.checkout);
router.put('/:id', cartController.updateQuantity);
router.delete('/', cartController.clearCart);
router.delete('/:id', cartController.removeFromCart);

module.exports = router;
