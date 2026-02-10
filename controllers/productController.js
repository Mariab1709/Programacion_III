const Product = require('../models/Product');

// Obtener todos los productos
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos', error: error.message });
  }
};

// Crear un producto
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    let { image, code } = req.body;

    // Si se subió un archivo, usamos esa ruta
    if (req.file) {
      image = `/uploads/products/${req.file.filename}`;
    }

    const product = await Product.create({
      name,
      code, // Puede ser null, el hook del modelo lo generará
      description,
      price,
      stock,
      image: image || '/images/default-pc.png'
    });

    // Si la petición viene de un formulario (EJS)
    if (req.body._ui === 'true') {
      return res.redirect('/admin/dashboard');
    }

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear producto', error: error.message });
  }
};

// Obtener un producto por código
exports.getProductByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const product = await Product.findOne({ where: { code } });

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener producto', error: error.message });
  }
};

// Actualizar un producto
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Actualizamos solo los campos permitidos y presentes en el body
    const allowedFields = ['name', 'code', 'description', 'price', 'stock', 'image'];
    const updateData = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    await product.update(updateData);

    res.json(product);
  } catch (error) {
    console.error('Error en updateProduct:', error);
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => {
        if (err.path === 'price') return 'El precio debe ser mayor a 0';
        return err.message;
      });
      return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: 'Error interno del servidor al actualizar', error: error.message });
  }
};

// Eliminar un producto
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    await product.destroy();
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar producto', error: error.message });
  }
};
