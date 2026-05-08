/**
 * Achievement model defining unlockable badges and milestones.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Achievement = sequelize.define('Achievement', {
  id: {
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

/**
 * Achievement model defines the static badge catalog and unlock criteria.
 */
module.exports = Achievement;
