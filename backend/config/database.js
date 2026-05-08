/**
 * Database configuration and Sequelize instance initialization.
 */
const { Sequelize } = require('sequelize');
require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';
const dbName = isTest ? (process.env.DB_DATABASE_TEST || `${process.env.DB_DATABASE}_test`) : process.env.DB_DATABASE;

const sequelize = new Sequelize(
  dbName,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
  }
);

module.exports = sequelize;
