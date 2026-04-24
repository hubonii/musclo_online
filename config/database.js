// Shared Sequelize connection used by all models.
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Sequelize instance initialized from environment variables.
const sequelize = new Sequelize(
  // Database/schema name.
  process.env.DB_DATABASE,
  // Database user credentials.
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    // Connection target details.
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    // Keep SQL logs quiet unless debugging is needed.
    logging: false,
    define: {
      // Apply these defaults to every model automatically.
      timestamps: true,
      underscored: true,
    },
  }
);

module.exports = sequelize;
