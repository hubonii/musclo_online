/**
 * Database configuration and Sequelize instance initialization.
 */
const { Sequelize } = require('sequelize');
require('dotenv').config();


const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {

    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    // Keep SQL logs quiet to maintain clean console output.
    logging: false,
    define: {

      timestamps: true,
      underscored: true,
    },
  }
);

module.exports = sequelize;
