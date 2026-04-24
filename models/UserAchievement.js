// Pivot table storing when a user unlocked each achievement.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserAchievement = sequelize.define('UserAchievement', {
  id: {
    // Primary key for one user-achievement link row.
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    // Linked user id who unlocked the achievement.
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  achievement_id: {
    // Linked achievement definition id.
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  unlocked_at: {
    // Timestamp shown in profile achievements timeline.
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'user_achievements',
  underscored: true,
});

module.exports = UserAchievement;


