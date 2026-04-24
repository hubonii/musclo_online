// Individual set rows used for both routine templates and completed workouts.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SetData = sequelize.define('SetData', {
  id: {
    // Primary key for one set entry row.
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  workout_log_id: {
    // Null means this row is a routine template set (not yet logged in a workout).
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
  },
  routine_id: {
    // Source routine id when this set belongs to a routine template.
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
  },
  exercise_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  set_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  set_type: {
    // Logical set category (warmup, working, drop, etc.).
    type: DataTypes.STRING(20),
    defaultValue: 'working',
  },
  weight_kg: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
  },
  reps: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  duration_seconds: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  rir: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  rpe: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  is_pr: {
    // Flag set to true when controller detects a personal-record set.
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'set_data',
  underscored: true,
  // Keep audit columns (`created_at`, `updated_at`) on every set row.
  timestamps: true,
});

module.exports = SetData;
