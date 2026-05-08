/**
 * WorkoutLog model for completed training sessions and aggregate stats.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkoutLog = sequelize.define('WorkoutLog', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    // Owner id used in all user-scoped history queries.
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  routine_id: {
    // Optional source routine id when workout started from a routine template.
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  duration_seconds: {
    // Session length used in history cards and dashboard time stats.
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  total_volume: {
    // Sum of working set volume (weight x reps), computed on save.
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'workout_logs',
  underscored: true,
  // Soft delete retains references for analytics and audit history.
  paranoid: true,
});

/**
 * WorkoutLog model represents a completed workout session record.
 */
module.exports = WorkoutLog;
