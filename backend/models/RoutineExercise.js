/**
 * RoutineExercise join model linking exercises to routines with custom order/notes.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RoutineExercise = sequelize.define('RoutineExercise', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  routine_id: {
    // Parent routine id for this linked exercise.
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  exercise_id: {
    // Linked exercise id in the routine plan.
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  sort_order: {
    // Exercise order used by routine builder and workout player screens.
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  target_sets: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
  },
  target_reps: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  override_type: {
    // Optional routine-level type override for linked exercise rows.
    type: DataTypes.STRING,
    allowNull: true,
  },
  override_metric: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  rest_timer_seconds: {
    // Optional per-exercise rest timer override.
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'routine_exercise',
  underscored: true,
});

/**
 * RoutineExercise model links routines to exercises with per-exercise targets.
 */
module.exports = RoutineExercise;


