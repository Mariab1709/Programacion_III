const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

// Agregar producto al carrito
// Agregar producto al carrito
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const userId = req.session.user.id;
        const qty = Math.max(1, parseInt(quantity) || 1);

        // Verificar si el producto existe y tiene stock SUFICIENTE (pero no descontar aún)
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Verificar stock disponible considerando lo que ya tiene en el carrito
        let cartItem = await CartItem.findOne({ where: { userId, productId } });
        const currentQty = cartItem ? cartItem.quantity : 0;

        if (product.stock < (currentQty + qty)) {
            return res.status(400).json({ message: 'Stock insuficiente para la cantidad solicitada' });
        }

        if (cartItem) {
            cartItem.quantity += qty;
            await cartItem.save();
        } else {
            cartItem = await CartItem.create({ userId, productId, quantity: qty });
        }

        // NO DESCONTAMOS STOCK AQUÍ

        res.json({
            message: 'Producto añadido al carrito',
            cartItem,
            updatedStock: product.stock // Stock sigue igual visualmente hasta la compra
        });
    } catch (error) {
        console.error('Error en addToCart:', error);
        res.status(500).json({ message: 'Error al añadir al carrito', error: error.message });
    }
};

// Obtener el carrito con total calculado
exports.getCart = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const cartItems = await CartItem.findAll({
            where: { userId },
            include: [{ model: Product }]
        });

        let total = 0;
        const items = cartItems.map(item => {
            const subtotal = item.Product ? item.Product.price * item.quantity : 0;
            total += subtotal;
            return {
                ...item.toJSON(),
                subtotal
            };
        });

        res.json({ items, total: parseFloat(total.toFixed(2)) });
    } catch (error) {
        console.error('Error en getCart:', error);
        res.status(500).json({ message: 'Error al obtener el carrito', error: error.message });
    }
};

// Vaciar carrito
exports.clearCart = async (req, res) => {
    try {
        const userId = req.session.user.id;
        // Solo borramos los ítems, NO devolvemos stock porque no lo quitamos
        await CartItem.destroy({ where: { userId } });
        res.json({ message: 'Carrito vaciado correctamente' });
    } catch (error) {
        console.error('Error en clearCart:', error);
        res.status(500).json({ message: 'Error al vaciar el carrito', error: error.message });
    }
};

// Eliminar un ítem específico
exports.removeFromCart = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.user.id;
        // Solo borramos el ítem
        await CartItem.destroy({ where: { id, userId } });
        res.json({ message: 'Producto eliminado del carrito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar ítem', error: error.message });
    }
};

// Actualizar cantidad de un ítem
exports.updateQuantity = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        const userId = req.session.user.id;
        const newQty = parseInt(quantity);

        if (isNaN(newQty) || newQty < 1) {
            return res.status(400).json({ message: 'Cantidad inválida' });
        }

        const item = await CartItem.findOne({ where: { id, userId } });
        if (!item) return res.status(404).json({ message: 'Ítem no encontrado' });

        const product = await Product.findByPk(item.productId);

        // Verificar si hay stock suficiente para la NUEVA cantidad total
        if (product.stock < newQty) {
            return res.status(400).json({ message: 'Stock insuficiente' });
        }

        // Solo actualizamos el carrito
        item.quantity = newQty;
        await item.save();

        res.json({ message: 'Cantidad actualizada', item, updatedStock: product.stock });
    } catch (error) {
        console.error('Error en updateQuantity:', error);
        res.status(500).json({ message: 'Error al actualizar cantidad' });
    }
};

// Finalizar Compra (Checkout)
exports.checkout = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const cartItems = await CartItem.findAll({ where: { userId } });

        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'El carrito está vacío' });
        }

        // 1. Verificar stock de TODOS los productos antes de procesar
        for (const item of cartItems) {
            const product = await Product.findByPk(item.productId);
            if (!product || product.stock < item.quantity) {
                return res.status(400).json({
                    message: `Stock insuficiente para ${product ? product.name : 'un producto'}`
                });
            }
        }

        // 2. Descontar stock
        for (const item of cartItems) {
            const product = await Product.findByPk(item.productId);
            product.stock -= item.quantity;
            await product.save();
        }

        // 3. Vaciar carrito
        await CartItem.destroy({ where: { userId } });

        res.json({ message: 'Compra finalizada con éxito' });
    } catch (error) {
        console.error('Error en checkout:', error);
        res.status(500).json({ message: 'Error al procesar la compra' });
    }
};
