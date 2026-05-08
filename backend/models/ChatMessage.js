/**
 * ChatMessage model for individual messages within a coach session.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatMessage = sequelize.define('ChatMessage', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  chat_session_id: {
    // Links message row to its parent ChatSession.
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  role: {
    // Message origin role used by chat renderer and prompt-history builder.
    type: DataTypes.ENUM('user', 'assistant'),
    allowNull: false,
  },
  content: {
    // Stores plain-text body returned by user input or model output.
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'chat_messages',
  underscored: true,
});

/**
 * ChatMessage model represents individual messages in an AI chat session.
 */
module.exports = ChatMessage;


