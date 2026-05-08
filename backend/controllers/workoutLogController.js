
const { WorkoutLog, SetData, Exercise, Routine } = require('../models');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

/**
 * Normalizes stored media paths into a public URL path.
 * @param {string} url - The stored path or URL.
 * @returns {string|null} Formatted URL.
 */
const formatUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('https')) return url;
  if (url.startsWith('/storage') || url.startsWith('storage/')) {
    return url.startsWith('/') ? url : `/${url}`;
  }
  return `/storage/${url.startsWith('/') ? url.slice(1) : url}`;
};

/**
 * Transforms a workout log model instance into the API response shape.
 * @param {Object} log - The workout log model instance.
 * @returns {Object|null} Transformed workout log data.
 */
function transformWorkoutLog(log) {
  if (!log) return null;
  const json = log.toJSON ? log.toJSON() : log;
  
  const rawSets = json.SetData || [];

  const sets = rawSets.map(s => ({
    id: s.id,
    exercise_id: s.exercise_id,
    set_number: s.set_number,
    set_type: s.set_type,
    weight_kg: s.weight_kg,
    reps: s.reps,
    duration_seconds: s.duration_seconds,
    rpe: s.rpe,
    is_pr: !!s.is_pr,
    exercise: s.Exercise ? {
      id: s.Exercise.id,
      name: s.Exercise.name,
      muscle_group: s.Exercise.muscle_group,
      category: s.Exercise.category,
      thumbnail_url: formatUrl(s.Exercise.thumbnail_url),
      gif_url: formatUrl(s.Exercise.gif_url)
    } : null
  }));


  const muscleVol = {};
  rawSets.forEach(s => {
    if (s.Exercise && (s.set_type === 'working' || s.set_type === 'normal')) {
      const muscle = s.Exercise.muscle_group;
      const vol = (parseFloat(s.weight_kg) || 0) * (parseInt(s.reps) || 0);
      muscleVol[muscle] = (muscleVol[muscle] || 0) + vol;
    }
  });
  const topMuscles = Object.entries(muscleVol)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([muscle]) => muscle.charAt(0).toUpperCase() + muscle.slice(1));

  return {
    id: json.id,
    name: json.name,
    started_at: json.started_at,
    completed_at: json.completed_at,
    duration_seconds: json.duration_seconds,
    total_volume: json.total_volume,
    notes: json.notes,
    sets: sets,
    top_muscles: topMuscles,
    routine: json.Routine ? {
      id: json.Routine.id,
      name: json.Routine.name
    } : null,
    created_at: json.created_at,
    updated_at: json.updated_at
  };
}


/**
 * Stores a new workout log and its associated set data.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.storeWorkout = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { routine_id, name, started_at, completed_at, duration_seconds, notes, sets } = req.body;
    

    console.log(`[WorkoutLog] Starting save for user ${req.user.id}, routine ${routine_id || 'manual'}`);

    const workoutLog = await WorkoutLog.create({
      user_id: req.user.id,
      routine_id,
      name: name || 'Workout',
      started_at,
      completed_at: completed_at || new Date(),
      duration_seconds,
      notes
    }, { transaction: t });

    let totalVolume = 0;
    for (const setData of sets) {

      const set = await SetData.create({
        exercise_id: setData.exercise_id,
        set_number: setData.set_number,
        set_type: setData.set_type,
        weight_kg: setData.weight_kg,
        reps: setData.reps,
        duration_seconds: setData.duration_seconds,
        rir: setData.rir,
        rpe: setData.rpe,
        workout_log_id: workoutLog.id,
        routine_id: routine_id || null
      }, { transaction: t });


      if (set.set_type === 'working' || set.set_type === 'normal') {
        const currentVol = (parseFloat(set.weight_kg) || 0) * (parseInt(set.reps) || 0);
        if (currentVol > 0) {
          // Efficiently find previous max volume without complex joins if possible.
          // Note: '$WorkoutLog.user_id$' syntax allows filtering by association fields.
          const previousBest = await SetData.findOne({
            attributes: [[sequelize.fn('MAX', sequelize.literal('weight_kg * reps')), 'max_volume']],
            include: [{
              model: WorkoutLog,
              attributes: [],
              where: { user_id: req.user.id }
            }],
            where: {
              exercise_id: set.exercise_id,
              set_type: { [Op.in]: ['working', 'normal'] },
              workout_log_id: { [Op.ne]: workoutLog.id }
            },
            raw: true,
            transaction: t
          });

          const maxVol = previousBest ? parseFloat(previousBest.max_volume) || 0 : 0;
          if (currentVol > maxVol) {
            await set.update({ is_pr: true }, { transaction: t });
          }
        }
        totalVolume += currentVol;
      }
    }

    await workoutLog.update({ total_volume: totalVolume }, { transaction: t });
    await t.commit();
    console.log(`[WorkoutLog] Successfully saved workout ${workoutLog.id}`);

    const finalModel = await WorkoutLog.findByPk(workoutLog.id, {
      include: [{ model: SetData, include: [Exercise] }, Routine]
    });

    res.status(201).json({ data: transformWorkoutLog(finalModel) });
  } catch (err) {
    console.error('[WorkoutLog] Save failed:', err);
    if (t) await t.rollback();
    res.status(500).json({ message: err.message });
  }
};


/**
 * Retrieves a paginated history of workout logs for the authenticated user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.per_page || 15);
    const page = parseInt(req.query.page || 1);
    const offset = (page - 1) * limit;

    const { count, rows: logs } = await WorkoutLog.findAndCountAll({
      where: { user_id: req.user.id },
      include: [{ model: SetData, include: [Exercise] }, Routine],
      order: [['started_at', 'DESC']],
      limit,
      offset
    });

    res.json({
      data: logs.map(l => transformWorkoutLog(l)),
      meta: {
        current_page: page,
        per_page: limit,
        total: count,
        last_page: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Retrieves details and analytics for a specific workout log.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getWorkout = async (req, res) => {
  try {
    const workoutLog = await WorkoutLog.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [{ model: SetData, include: [Exercise] }, Routine]
    });

    if (!workoutLog) return res.status(404).json({ message: 'Workout not found' });

    const transformed = transformWorkoutLog(workoutLog);


    const radar = {};
    const colors = ['#a4d255', '#facc15', '#60a5fa', '#f472b6', '#c084fc', '#34d399', '#fbbf24'];
    

    const exercisesMap = {};
    workoutLog.SetData.forEach(set => {
      const ex = set.Exercise;
      if (!ex) return;

      if (!exercisesMap[ex.id]) {
        exercisesMap[ex.id] = {
          exercise_id: ex.id,
          name: ex.name,
          muscle_group: ex.muscle_group,
          gif_url: ex.gif_url || ex.thumbnail_url,
          sets: []
        };
      }
      exercisesMap[ex.id].sets.push(set);

      if (set.set_type === 'working' || set.set_type === 'normal') {
        const muscle = ex.muscle_group.charAt(0).toUpperCase() + ex.muscle_group.slice(1);
        const vol = (parseFloat(set.weight_kg) || 0) * (parseInt(set.reps) || 0);
        radar[muscle] = (radar[muscle] || 0) + vol;
      }
    });


    const radarChart = Object.entries(radar).map(([muscle, volume]) => ({ muscle, volume }));
    const totalVol = Object.values(radar).reduce((a, b) => a + b, 0);
    const doughnutChart = Object.entries(radar).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length]
    }));
    const heatmapChart = Object.entries(radar).map(([muscle, vol]) => ({
      muscle: muscle.toLowerCase(),
      percentage: totalVol > 0 ? (vol / totalVol) * 100 : 0
    })).sort((a, b) => b.percentage - a.percentage);

    const data = {
      ...transformed,
      exercises: Object.values(exercisesMap),
      analytics: {
        radar: radarChart,
        doughnut: doughnutChart,
        heatmap: heatmapChart
      }
    };

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Deletes a workout log.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.deleteWorkout = async (req, res) => {
  try {
    const workoutLog = await WorkoutLog.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!workoutLog) return res.status(404).json({ message: 'Workout not found' });

    await workoutLog.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Retrieves historical sets for a specific exercise.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getExerciseHistory = async (req, res) => {
  try {
    const exerciseId = req.params.exerciseId;
    const limit = parseInt(req.query.limit || 20);

    const sets = await SetData.findAll({
      where: { exercise_id: exerciseId },
      include: [{
        model: WorkoutLog,
        where: { user_id: req.user.id },
        attributes: ['id', 'started_at']
      }],
      order: [['created_at', 'DESC']],
      limit: limit * 8
    });


    const grouped = sets.reduce((acc, set) => {
      const logId = set.workout_log_id;
      if (!acc[logId]) acc[logId] = [];
      acc[logId].push(set);
      return acc;
    }, {});

    res.json({ data: grouped });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
