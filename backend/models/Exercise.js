/**
 * Exercise model for built-in and user-created custom movements.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Exercise = sequelize.define('Exercise', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  exercisedb_id: {
    // Optional external provider id for imported exercise records.
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
  },
  name: {
    // Display name used in search, cards, and workout logs.
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  muscle_group: {
    // Main targeted muscle group used in filters and charts.
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  secondary_muscles: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  secondary_muscles_json: {
    // Preferred JSON representation used by newer imports.
    type: DataTypes.JSON,
    allowNull: true,
  },
  primary_muscles: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  equipment: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  body_part: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING(30),
    defaultValue: 'strength',
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  target_metric: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  gif_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  thumbnail_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  video_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  instructional_images: {
    // Layer image paths used by anatomy overlay UI.
    type: DataTypes.JSON,
    allowNull: true,
  },
  is_custom: {
    // Marks user-created exercises versus global catalog exercises.
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  user_id: {
    // Owner id for custom exercises (`null` for global exercises).
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
  },
  has_front_anatomy: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  has_back_anatomy: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  back_anatomy_index: {
    // Split index that separates front/back anatomy image layers.
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'exercises',
  underscored: true,
});

/**
 * Splits composite body-part labels and returns the first segment.
 * @param {string} bodyPart - The raw body part string.
 * @returns {string|null} The normalized body part name.
 */
Exercise.normalizeBodyPart = (bodyPart) => {
  if (!bodyPart) return null;
  const primary = bodyPart.split(',')[0].trim();
  return primary ? primary.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : null;
};

/**
 * Maps body part names to icon asset filenames used by the frontend.
 * @param {string} bodyPart - The body part name to map.
 * @returns {string|null} The URL path to the icon.
 */
Exercise.bodyPartIconUrl = (bodyPart) => {
  const normalized = Exercise.normalizeBodyPart(bodyPart);
  if (!normalized) return null;

  const iconMap = {
    'waist': 'abs',
    'abs': 'abs',
    'thighs': 'quadriceps',
    'upper arms': 'biceps',
  };

  let slug = normalized.toLowerCase();
  slug = iconMap[slug] || slug;
  slug = slug.replace(/ /g, '_');

  return `https://muscloasset2.blob.core.windows.net/exercises/icons/ic_${slug}.svg`;
};

/**
 * Exercise model represents library items (built-in + user-created custom exercises).
 */
module.exports = Exercise;
