const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    });
} else if (process.env.NODE_ENV === 'production' || process.env.DB_DIALECT === 'postgres') {
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            dialect: 'postgres',
            port: process.env.DB_PORT || 5432,
            logging: false,
            dialectOptions: {
                ssl: process.env.NODE_ENV === 'production' ? {
                    require: true,
                    rejectUnauthorized: false
                } : false
            }
        }
    );
} else {
    // Configuración de SQLite para desarrollo local
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: './database.sqlite',
        logging: false
    });
}

module.exports = sequelize;
