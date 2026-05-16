
const { Exercise, User, RoutineExercise } = require('../models');
const { Op, Sequelize } = require('sequelize');

/**
 * Retrieves a paginated list of exercises with optional filters.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getExercises = async (req, res) => {
  try {

    const { search, muscle_group, muscle, equipment, body_part, has_video, per_page, limit } = req.query;
    
    const userId = req.user.id;

    const where = {
      [Op.or]: [
        { is_custom: false },
        { user_id: userId }
      ]
    };

    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    if (muscle_group) {
      where.muscle_group = muscle_group;
    }

    if (muscle) {

      where[Op.or] = [
        Sequelize.fn('JSON_CONTAINS', Sequelize.col('primary_muscles'), JSON.stringify(muscle)),
        Sequelize.fn('JSON_CONTAINS', Sequelize.col('secondary_muscles_json'), JSON.stringify(muscle))
      ];
    }

    if (equipment) {
      where.equipment = { [Op.like]: `%${equipment}%` };
    }

    if (body_part) {
      where.body_part = { [Op.like]: `${body_part}%` };
    }

    if (has_video === 'true' || has_video === '1') {
      where.video_url = { [Op.ne]: null };
    }


    const pageSize = Math.min(parseInt(per_page || limit || 25), 2000);
    const page = parseInt(req.query.page || 1);
    const offset = (page - 1) * pageSize;

    const { count, rows: exercises } = await Exercise.findAndCountAll({
      where,
      limit: pageSize,
      offset,

      order: [
        [Sequelize.literal(`
          CASE 
            WHEN LOWER(equipment) LIKE '%barbell%' THEN 1
            WHEN LOWER(equipment) LIKE '%dumbbell%' THEN 2
            WHEN LOWER(equipment) LIKE '%smith%' THEN 3
            WHEN LOWER(equipment) LIKE '%machine%' OR LOWER(equipment) LIKE '%lever%' THEN 4
            WHEN LOWER(equipment) LIKE '%cable%' THEN 5
            WHEN LOWER(equipment) = 'body weight' OR LOWER(equipment) LIKE '%bodyweight%' THEN 6
            WHEN LOWER(equipment) LIKE '%band%' THEN 7
            ELSE 8
          END
        `), 'ASC'],
        ['name', 'ASC']
      ]
    });

    const transformed = exercises.map(ex => transformExercise(ex));

    res.json({
      data: transformed,
      meta: {
        current_page: page,
        per_page: pageSize,
        total: count,
        last_page: Math.ceil(count / pageSize)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Convert model fields to the API shape expected by frontend.
 * @param {Object} ex - The exercise model instance.
 * @returns {Object} Transformed exercise data.
 */
const transformExercise = (ex) => {
  const iconUrl = Exercise.bodyPartIconUrl(ex.body_part);
  
  let anatomyLayers = null;
  if (ex.instructional_images) {
    const paths = typeof ex.instructional_images === 'string' ? JSON.parse(ex.instructional_images) : ex.instructional_images;
    if (paths && paths.length > 0) {
      const allUrls = paths.map(p => `${p.startsWith('/') ? p.slice(1) : p}`);
      const backIndex = ex.back_anatomy_index;
      
      if (backIndex !== null && backIndex !== undefined) {
        anatomyLayers = {
          front_layers: allUrls.slice(0, backIndex),
          back_layers: allUrls.slice(backIndex)
        };
      } else {
        anatomyLayers = {
          front_layers: allUrls,
          back_layers: []
        };
      }
    }
  }


  const formatUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('https')) return url;
    if (url.startsWith('/storage') || url.startsWith('storage/')) {
      return url.startsWith('/') ? url : `/${url}`;
    }
    return `/storage/${url.startsWith('/') ? url.slice(1) : url}`;
  };

  return {
    id: ex.id,
    exercisedb_id: ex.exercisedb_id,
    name: ex.name,
    muscle_group: ex.muscle_group,
    primary_muscles: ex.primary_muscles,
    secondary_muscles: ex.secondary_muscles_json || ex.secondary_muscles,
    equipment: ex.equipment,
    body_part: ex.body_part,
    body_part_icon: iconUrl,
    category: ex.category,
    instructions: ex.instructions,
    thumbnail_url: formatUrl(ex.thumbnail_url),
    video_url: formatUrl(ex.video_url),
    instructional_images: anatomyLayers,
    gif_url: formatUrl(ex.gif_url),
    is_custom: ex.is_custom,
  };
};

/**
 * Retrieves a list of exercise categories based on body parts.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getCategories = async (req, res) => {
  try {

    const results = await Exercise.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('body_part')), 'body_part']],
      where: {
        is_custom: false,
        body_part: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: '' }] }
      }
    });

    const categoriesMap = {};
    results.forEach(r => {
      const bp = r.body_part;
      const primary = Exercise.normalizeBodyPart(bp);
      if (primary && !categoriesMap[primary]) {
        categoriesMap[primary] = {
          name: primary,
          icon_url: Exercise.bodyPartIconUrl(bp),
          count: 0
        };
      }
    });

    const categories = Object.values(categoriesMap).sort((a, b) => a.name.localeCompare(b.name));
    res.json({ data: categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Retrieves all available filter options (equipment, muscles, etc.).
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getFilters = async (req, res) => {
  try {

    const [equipmentList, bodyPartsList, primaryMuscles, secondaryMuscles, categoriesList] = await Promise.all([
      Exercise.findAll({ attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('equipment')), 'equipment']], where: { equipment: { [Op.ne]: null } }, raw: true }),
      Exercise.findAll({ attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('body_part')), 'body_part']], where: { body_part: { [Op.ne]: null } }, raw: true }),
      Exercise.findAll({ attributes: [[Sequelize.fn('DISTINCT', Sequelize.literal('JSON_UNQUOTE(JSON_EXTRACT(primary_muscles, "$[*]"))')), 'muscle']], where: { primary_muscles: { [Op.ne]: null } }, raw: true }),
      Exercise.findAll({ attributes: [[Sequelize.fn('DISTINCT', Sequelize.literal('JSON_UNQUOTE(JSON_EXTRACT(secondary_muscles_json, "$[*]"))')), 'muscle']], where: { secondary_muscles_json: { [Op.ne]: null } }, raw: true }),
      Exercise.findAll({ attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('category')), 'category']], where: { category: { [Op.ne]: null } }, raw: true })
    ]);

    const equipment = equipmentList.map(e => e.equipment).filter(e => e).sort();
    const body_parts = [...new Set(bodyPartsList.map(b => Exercise.normalizeBodyPart(b.body_part)).filter(b => b))].sort();
    const muscles = [...new Set([...primaryMuscles.map(m => m.muscle), ...secondaryMuscles.map(m => m.muscle)].filter(m => m))].sort();
    const categories = categoriesList.map(c => c.category).filter(c => c).sort();

    res.json({
      data: { body_parts, equipment, muscle_groups: muscles, categories }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Toggles an exercise as a favorite for the authenticated user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.toggleFavorite = async (req, res) => {
  try {
    const user = req.user;
    const exerciseId = req.params.exerciseId;
    
    const exercise = await Exercise.findByPk(exerciseId);
    if (!exercise) return res.status(404).json({ message: 'Exercise not found' });

    const hasFavorite = await user.hasFavoriteExercise(exercise);
    if (hasFavorite) {
      await user.removeFavoriteExercise(exercise);
      return res.json({ favorited: false, message: 'Removed from favorites' });
    } else {
      await user.addFavoriteExercise(exercise);
      return res.json({ favorited: true, message: 'Added to favorites' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Retrieves details for a single exercise.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByPk(req.params.id);
    if (!exercise) return res.status(404).json({ message: 'Exercise not found' });
    

    if (exercise.is_custom && exercise.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json({ data: transformExercise(exercise) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Creates a new custom exercise for the authenticated user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.createExercise = async (req, res) => {
  try {
    const { name, muscle_group, equipment, body_part, instructions, category } = req.body;
    
    const exercise = await Exercise.create({
      name,
      muscle_group,
      equipment,
      body_part,
      instructions,
      category: category || 'strength',
      is_custom: true,
      user_id: req.user.id
    });

    res.status(201).json({ data: transformExercise(exercise) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Retrieves the list of favorite exercise IDs for the authenticated user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getFavorites = async (req, res) => {
  try {
    const favorites = await req.user.getFavoriteExercises({ attributes: ['id'] });
    res.json({ data: favorites.map(f => f.id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
