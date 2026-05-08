
const { WorkoutLog, SetData, Exercise, Routine, Program } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Routine model transformer for analytics response payloads.
 * @param {Object} r - The routine model instance.
 * @returns {Object|null} Transformed routine data.
 */
function transformRoutine(r) {
  if (!r) return null;
  const json = r.toJSON ? r.toJSON() : r;

  return {
    id: json.id,
    name: json.name,
    notes: json.notes,
    day_of_week: json.day_of_week,
    exercises_count: json.Exercises?.length || 0,
    exercises: (json.Exercises || []).map(ex => ({
      id: ex.id,
      name: ex.name,
      muscle_group: ex.muscle_group,
      pivot: ex.RoutineExercise || {}
    }))
  };
}

/**
 * Convert program model to analytics response shape.
 * @param {Object} p - The program model instance.
 * @returns {Object|null} Transformed program data.
 */
function transformProgram(p) {
  if (!p) return null;
  const json = p.toJSON ? p.toJSON() : p;
  return {
    id: json.id,
    name: json.name,
    description: json.description,
    is_active: !!json.is_active,
    routines: (json.Routines || []).map(r => transformRoutine(r))
  };
}

/**
 * Retrieves aggregate workout statistics for the dashboard.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);


    const weekISO = sequelize.escape(lastWeek.toISOString());
    const monthISO = sequelize.escape(lastMonth.toISOString());

    const stats = await WorkoutLog.findOne({
      attributes: [

        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.literal(`SUM(CASE WHEN started_at >= ${weekISO} THEN 1 ELSE 0 END)`), 'this_week'],
        [sequelize.literal(`SUM(CASE WHEN started_at >= ${monthISO} THEN 1 ELSE 0 END)`), 'this_month'],
        [sequelize.fn('SUM', sequelize.col('total_volume')), 'total_kg'],
        [sequelize.literal(`SUM(CASE WHEN started_at >= ${weekISO} THEN total_volume ELSE 0 END)`), 'this_week_kg'],
        [sequelize.fn('SUM', sequelize.col('duration_seconds')), 'total_seconds'],
        [sequelize.literal(`SUM(CASE WHEN started_at >= ${weekISO} THEN duration_seconds ELSE 0 END)`), 'this_week_seconds'],
      ],
      where: { user_id: userId },

      raw: true
    });

    const recent_programs = await Program.findAll({
      where: { user_id: userId },
      include: [{ model: Routine, as: 'Routines' }],
      order: [['created_at', 'DESC']],
      limit: 3
    });

    const recent_routines = await Routine.findAll({
      where: { user_id: userId },
      include: [{ model: Exercise }],
      order: [['created_at', 'DESC']],
      limit: 3
    });


    res.json({
      data: {
        workouts: {
          total: parseInt(stats.total || 0),
          this_week: parseInt(stats.this_week || 0),
          this_month: parseInt(stats.this_month || 0)
        },
        volume: {
          total_kg: parseFloat(stats.total_kg || 0),
          this_week_kg: parseFloat(stats.this_week_kg || 0)
        },
        time: {
          total_seconds: parseInt(stats.total_seconds || 0),
          this_week_seconds: parseInt(stats.this_week_seconds || 0)
        },
        recent_programs: recent_programs.map(p => transformProgram(p)),
        recent_routines: recent_routines.map(r => transformRoutine(r))
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Retrieves progression data for a specific exercise over time.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getProgression = async (req, res) => {
  try {
    const { exerciseId } = req.params;
    const userId = req.user.id;


    const progression = await SetData.findAll({
      attributes: [
        [sequelize.fn('MAX', sequelize.literal('weight_kg * reps')), 'one_rep_max'],
        [sequelize.col('WorkoutLog.started_at'), 'date']
      ],
      include: [{
        model: WorkoutLog,
        attributes: [],
        where: { user_id: userId }
      }],
      where: { exercise_id: exerciseId, is_completed: true },
      group: [sequelize.col('WorkoutLog.started_at')],
      order: [[sequelize.col('WorkoutLog.started_at'), 'ASC']],
      raw: true
    });

    res.json({
      data: progression.map(p => ({
        date: p.date,
        value: parseFloat(p.one_rep_max || 0)
      }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Retrieves muscle group volume distribution for charts.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getVolumeAnalytics = async (req, res) => {
  try {
    const { range = 'all' } = req.query;
    const userId = req.user.id;


    let where = { '$WorkoutLog.user_id$': userId };
    if (range === 'week') {
      where['$WorkoutLog.started_at$'] = { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    } else if (range === 'month') {
      where['$WorkoutLog.started_at$'] = { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    }


    const volumes = await SetData.findAll({
      attributes: [
        [sequelize.col('Exercise.muscle_group'), 'muscle'],
        [sequelize.fn('SUM', sequelize.literal('weight_kg * reps')), 'volume']
      ],
      include: [
        { model: WorkoutLog, attributes: [] },
        { model: Exercise, attributes: [] }
      ],
      where,
      group: ['Exercise.muscle_group'],
      raw: true
    });

    const totalVolume = volumes.reduce((acc, v) => acc + parseFloat(v.volume || 0), 0);

    const muscles = volumes.map(v => ({

      muscle: v.muscle ? v.muscle.toLowerCase().replace(/ /g, '_') : 'other',
      volume: parseFloat(v.volume || 0),
      percentage: totalVolume > 0 ? Math.round((parseFloat(v.volume || 0) / totalVolume) * 100 * 10) / 10 : 0
    }));

    res.json({
      data: {
        range,
        muscles,
        total_volume: totalVolume
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAnatomy = exports.getVolumeAnalytics;
// `getAnatomy` intentionally reuses volume analytics data.

/**
 * Placeholder for muscle symmetry analysis.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getSymmetry = async (req, res) => {
  try {
    // Placeholder endpoint currently returns empty dataset.
    res.json({ data: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Retrieves workout frequency data for calendar heatmaps.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getCalendar = async (req, res) => {
  try {

    const userId = req.user.id;
    const logs = await WorkoutLog.findAll({
      attributes: ['started_at', 'total_volume', 'duration_seconds'],
      where: { user_id: userId },
      order: [['started_at', 'ASC']],
      raw: true
    });


    res.json({
      data: logs.map(l => ({
        date: l.started_at,
        volume: l.total_volume,
        duration: l.duration_seconds
      }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
