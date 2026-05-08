/**
 * UserSetting model for persisting UI preferences and unit configurations.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserSetting = sequelize.define('UserSetting', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    // One settings row per user account.
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    unique: true,
  },
  unit_system: {
    // Controls unit formatting/conversion in frontend inputs and displays.
    type: DataTypes.ENUM('metric', 'imperial'),
    defaultValue: 'metric',
  },
  theme: {
    // Theme preference consumed by UI theme store.
    type: DataTypes.ENUM('light', 'dark', 'system'),
    defaultValue: 'system',
  },
  default_rest_timer_seconds: {
    // Used when new exercises/sets do not define a custom rest timer.
    type: DataTypes.INTEGER,
    defaultValue: 90,
  },
}, {
  tableName: 'user_settings',
  underscored: true,
  // Keep `created_at` and `updated_at` for preference change tracking.
  timestamps: true,
});

/**
 * UserSetting model represents per-user application preferences.
 */
module.exports = UserSetting;


