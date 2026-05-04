// Measurement model for longitudinal body metric records.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Measurement = sequelize.define('Measurement', {
  id: {
    // Primary key for one measurement entry row.
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    // Owner id used by controllers to scope reads and writes.
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  date: {
    // One log entry date (YYYY-MM-DD). Multiple body metrics can be saved for that day.
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  // Optional metric fields; each row can store partial measurement sets.
  weight_kg: { type: DataTypes.DOUBLE, allowNull: true },
  height_cm: { type: DataTypes.DOUBLE, allowNull: true },
  chest_cm: { type: DataTypes.DOUBLE, allowNull: true },
  waist_cm: { type: DataTypes.DOUBLE, allowNull: true },
  left_arm_cm: { type: DataTypes.DOUBLE, allowNull: true },
  right_arm_cm: { type: DataTypes.DOUBLE, allowNull: true },
  left_leg_cm: { type: DataTypes.DOUBLE, allowNull: true },
  right_leg_cm: { type: DataTypes.DOUBLE, allowNull: true },
  calves_cm: { type: DataTypes.DOUBLE, allowNull: true },
  shoulders_cm: { type: DataTypes.DOUBLE, allowNull: true },
  neck_cm: { type: DataTypes.DOUBLE, allowNull: true },
  body_fat_percent: { type: DataTypes.DOUBLE, allowNull: true },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'measurements',
  underscored: true,
  timestamps: true,
  // Soft delete keeps removed entries recoverable for historical tracking.
  paranoid: true,
});

module.exports = Measurement;


