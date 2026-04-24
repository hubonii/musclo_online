// AI chat conversation container (one user can have many sessions).
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatSession = sequelize.define('ChatSession', {
  id: {
    // Primary key for one chat thread.
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    // Foreign-key style reference to the owning user.
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  title: {
    // Editable session label displayed in chat sidebar/list.
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'chat_sessions',
  // Keep snake_case DB column naming consistent across all models.
  underscored: true,
});

module.exports = ChatSession;


