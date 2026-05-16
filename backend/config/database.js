/**
 * @file Database Configuration
 * @description Initializes the Sequelize ORM instance with specialized configurations 
 * for Serverless deployment (Vercel) and secure remote database hosting (Aiven MySQL).
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

// Determine environment context and select the target database name
const isTest = process.env.NODE_ENV === 'test';
const dbName = isTest 
  ? (process.env.DB_DATABASE_TEST || `${process.env.DB_DATABASE}_test`) 
  : process.env.DB_DATABASE;

const sequelize = new Sequelize(
  dbName,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    
    // Explicitly bundle the driver module to ensure compatibility with Vercel's runtime
    dialectModule: require('mysql2'),
    
    logging: false,
    
    // Global model settings
    define: {
      timestamps: true,
      underscored: true,
    },

    // Optimize connection pooling to prevent overwhelming Aiven's connection limits
    // Max 1 connection limits each atomic serverless function invocation to a single slot
    pool: {
      max: 1,
      min: 0,
      idle: 5000,
      evict: 5000,
      acquire: 30000
    },

    // Enforce SSL encryption required by default by premium database cluster providers like Aiven
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false
      }
    }
  }
);

module.exports = sequelize;
