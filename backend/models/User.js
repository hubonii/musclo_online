/**
 * User model for account management and profile settings.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  email_verified_at: {
    // Timestamp set after email verification flow completes.
    type: DataTypes.DATE,
    allowNull: true,
  },
  password: {
    // Stores bcrypt hash, never plain text.
    type: DataTypes.STRING,
    allowNull: false,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  avatar_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_public: {
    // Controls whether non-owners can view this profile.
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  remember_token: {
    // Optional token column kept for compatibility with existing schema.
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  verification_code: {
    // 6-digit code sent for email verification.
    type: DataTypes.STRING(6),
    allowNull: true,
  },
  reset_code: {
    // 6-digit code sent for password reset.
    type: DataTypes.STRING(6),
    allowNull: true,
  },
  reset_code_expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  google_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  pending_email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
}, {
  tableName: 'users',
  underscored: true,
});

/**
 * User model represents application user accounts and profile settings.
 */
module.exports = User;
