/**
 * ProgressPhoto model for tracking user physical transformations.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProgressPhoto = sequelize.define('ProgressPhoto', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    // Owner id used for user-scoped photo queries.
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  photo_path: {
    // Physical file path saved by upload middleware.
    type: DataTypes.STRING,
    allowNull: false,
  },
  measurement_id: {
    // Optional link to measurement logged on the same day.
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
  },
  pose: {
    // Capture angle label used for filtering and side-by-side comparison.
    type: DataTypes.ENUM('front', 'back', 'side', 'other'),
    defaultValue: 'other',
  },
  taken_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'progress_photos',
  underscored: true,
});

/**
 * ProgressPhoto model represents metadata for uploaded progress photos.
 */
module.exports = ProgressPhoto;


