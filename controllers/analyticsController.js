// Analytics controller for workout aggregates and chart data endpoints.
const { WorkoutLog, SetData, Exercise, Routine, Program } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Routine model transformer for analytics response payloads.
function transformRoutine(r) {
  if (!r) return null;
  const json = r.toJSON ? r.toJSON() : r;
  // Normalize ORM instances and plain objects to one API shape.
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

// Convert program model to analytics response shape.
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

exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    // Shared rolling window timestamps for week and month aggregate fields.
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Escape date values through Sequelize to avoid raw string interpolation in SQL.
    const weekISO = sequelize.escape(lastWeek.toISOString());
    const monthISO = sequelize.escape(lastMonth.toISOString());

    const stats = await WorkoutLog.findOne({
      attributes: [
        // Single aggregate query with SQL CASE expressions for time-window counters.
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.literal(`SUM(CASE WHEN started_at >= ${weekISO} THEN 1 ELSE 0 END)`), 'this_week'],
        [sequelize.literal(`SUM(CASE WHEN started_at >= ${monthISO} THEN 1 ELSE 0 END)`), 'this_month'],
        [sequelize.fn('SUM', sequelize.col('total_volume')), 'total_kg'],
        [sequelize.literal(`SUM(CASE WHEN started_at >= ${weekISO} THEN total_volume ELSE 0 END)`), 'this_week_kg'],
        [sequelize.fn('SUM', sequelize.col('duration_seconds')), 'total_seconds'],
        [sequelize.literal(`SUM(CASE WHEN started_at >= ${weekISO} THEN duration_seconds ELSE 0 END)`), 'this_week_seconds'],
      ],
      where: { user_id: userId },
      // Sequelize raw mode returns plain object values for aggregate columns.
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

    // Builds dashboard summary payload sections from aggregate query results.
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

exports.getProgression = async (req, res) => {
  try {
    const { exerciseId } = req.params;
    const userId = req.user.id;

    // Track progression as max (weight * reps) per workout date.
    // Aggregate one value per workout date for chart points.
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

exports.getVolumeAnalytics = async (req, res) => {
  try {
    const { range = 'all' } = req.query;
    const userId = req.user.id;

    // Optional range filter for week/month chart toggles.
    let where = { '$WorkoutLog.user_id$': userId };
    if (range === 'week') {
      where['$WorkoutLog.started_at$'] = { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    } else if (range === 'month') {
      where['$WorkoutLog.started_at$'] = { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    }

    // Groups total lifted volume by muscle group for distribution charts.
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
    // Keep muscle keys predictable for chart components.
    const muscles = volumes.map(v => ({
      // Normalize to snake_case keys expected by existing frontend chart labels.
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

exports.getSymmetry = async (req, res) => {
  try {
    // Placeholder endpoint currently returns empty dataset.
    res.json({ data: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCalendar = async (req, res) => {
  try {
    // Lightweight payload: one point per workout date for calendar heatmaps.
    const userId = req.user.id;
    const logs = await WorkoutLog.findAll({
      attributes: ['started_at', 'total_volume', 'duration_seconds'],
      where: { user_id: userId },
      order: [['started_at', 'ASC']],
      raw: true
    });

    // Maps raw workout rows into date-based calendar cells.
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
