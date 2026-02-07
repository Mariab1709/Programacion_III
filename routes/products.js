const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const isAdmin = require('../middleware/isAdmin');

router.get('/', productController.getAllProducts);
router.get('/:code', productController.getProductByCode);
router.post('/', isAdmin, productController.createProduct);

module.exports = router;
