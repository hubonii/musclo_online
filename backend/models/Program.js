/**
 * Program model for multi-week structured training plans.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Program = sequelize.define('Program', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    // Program owner. Controllers always filter by this user id.
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  name: {
    // Program title shown in program list and detail views.
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    // Optional free-text notes about program structure/goals.
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_active: {
    // Marks which program is currently selected in client workflows.
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'programs',
  underscored: true,
});

/**
 * Program model represents a named training plan that groups multiple routines.
 */
module.exports = Program;
