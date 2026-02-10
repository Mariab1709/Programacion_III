const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    allowNull: true, // Permitimos null inicialmente para que el hook lo genere
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '/images/default-pc.png'
  }
}, {
  hooks: {
    beforeValidate: (product) => {
      if (!product.code) {
        // Generar un código aleatorio tipo PC-XXXX
        const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
        product.code = `PC-${randomStr}`;
      }
    }
  }
});

module.exports = Product;
