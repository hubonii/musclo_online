/**
 * ChatSession model grouping AI coach messages for a specific user.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatSession = sequelize.define('ChatSession', {
  id: {
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

/**
 * ChatSession model represents an AI chat conversation container.
 */
module.exports = ChatSession;


