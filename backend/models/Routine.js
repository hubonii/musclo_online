// Routine template (day-specific workout inside a program).
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Routine = sequelize.define('Routine', {
  id: {
    // Primary key for one routine template row.
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  program_id: {
    // Optional parent program id for routines created inside a program.
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  day_of_week: {
    // Day label/index value used by today-routine queries.
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'routines',
  underscored: true,
  // Soft delete keeps historical references valid in workout logs.
  paranoid: true,
});

module.exports = Routine;
