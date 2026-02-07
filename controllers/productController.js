const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos', error: error.message });
  }
};

exports.getProductByCode = async (req, res) => {
  try {
    const product = await Product.findOne({ where: { code: req.params.code } });
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el producto', error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, code, price, description } = req.body;
    const product = await Product.create({ name, code, price, description });
    res.status(201).json({ message: 'Producto creado exitosamente', product });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Validación fallida: El precio debe ser mayor a 0' });
    }
    res.status(500).json({ message: 'Error al crear el producto', error: error.message });
  }
};
