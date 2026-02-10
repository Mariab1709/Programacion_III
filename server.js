const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');

const session = require('express-session');
const path = require('path');

const app = express();

// Configuración de EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Middlewares
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - Session ID: ${req.sessionID}`);
    next();
});
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    name: 'ecommerce.sid',
    secret: process.env.SESSION_SECRET || 'ecommerce_secret',
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Modelos y Asociaciones
const User = require('./models/User');
const Product = require('./models/Product');
const CartItem = require('./models/CartItem');

// Definir relaciones
User.hasMany(CartItem, { foreignKey: 'userId' });
CartItem.belongsTo(User, { foreignKey: 'userId' });
Product.hasMany(CartItem, { foreignKey: 'productId' });
CartItem.belongsTo(Product, { foreignKey: 'productId' });

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/', require('./routes/viewRoutes'));

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida correctamente.');

        // Sincronizar modelos con la base de datos
        await sequelize.sync({ force: false });
        console.log('Base de datos sincronizada.');

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
}

startServer();
