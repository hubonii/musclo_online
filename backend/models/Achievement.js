// Achievement definitions (static badge catalog and unlock criteria).
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Achievement = sequelize.define('Achievement', {
  id: {
    // Primary key for one achievement definition.
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  slug: {
    // Stable unique key used by code/tests to reference an achievement.
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  category: {
    // Group label used by profile UI sections (streak, volume, etc.).
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  criteria: {
    // Serialized rule payload consumed by `achievementService` during unlock checks.
    type: DataTypes.TEXT,
    allowNull: false,
  },
  xp_reward: {
    // XP points granted when this achievement is unlocked.
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
  },
}, {
  tableName: 'achievements',
  underscored: true,
});

module.exports = Achievement;
