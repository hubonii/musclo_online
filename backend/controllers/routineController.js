// Routine controller: create/update routine templates and fetch today's plan.
const { Routine, Program, Exercise, SetData, RoutineExercise, WorkoutLog } = require('../models');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

exports.getTodayRoutine = async (req, res) => {
  try {
    // JS getDay() returns 0-6 (Sun-Sat), matching stored day_of_week values.
    const dayOfWeek = new Date().getDay(); // 0-6 (Sunday-Saturday)
    
    const routine = await Routine.findOne({
      where: { user_id: req.user.id, day_of_week: dayOfWeek.toString() },
      include: [{ model: Exercise, include: [SetData] }, SetData]
    });

    if (!routine) return res.json({ data: null });

    res.json({ data: transformRoutine(routine) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProgramRoutines = async (req, res) => {
  try {
    const routines = await Routine.findAll({
      where: { program_id: req.params.programId, user_id: req.user.id },
      include: [Exercise, SetData],
      order: [['updated_at', 'DESC']]
    });

    res.json({ data: routines.map(r => transformRoutine(r)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create endpoint that inserts routine row under validated `program_id` ownership.
exports.createRoutine = async (req, res) => {
  // Uses one DB transaction for routine row, pivot rows, and template set rows.
  const t = await sequelize.transaction();
  try {
    const programId = req.params.programId || req.body.program_id;
    
    if (programId) {
      const program = await Program.findByPk(programId);
      if (!program || program.user_id !== req.user.id) {
        await t.rollback();
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    const { name, notes, day_of_week, exercises } = req.body;
    const routine = await Routine.create({
      name,
      notes,
      day_of_week,
      user_id: req.user.id,
      program_id: programId || null
    }, { transaction: t });

    if (exercises && exercises.length > 0) {
      await syncExercisesAndSets(routine, exercises, t);
    }

    await t.commit();
    
    const finalRoutine = await Routine.findByPk(routine.id, { include: [Exercise, SetData] });
    res.status(201).json({ data: transformRoutine(finalRoutine) });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};

exports.getRoutine = async (req, res) => {
  try {
    const routine = await Routine.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [Exercise, SetData]
    });

    if (!routine) return res.status(404).json({ message: 'Routine not found' });

    res.json({ data: transformRoutine(routine) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update routine metadata and replace linked exercises/sets when provided.
exports.updateRoutine = async (req, res) => {
  // Starts a transaction for routine update and optional exercise/set synchronization.
  const t = await sequelize.transaction();
  try {
    const routine = await Routine.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!routine) return res.status(404).json({ message: 'Routine not found' });

    const { name, notes, day_of_week, exercises } = req.body;
    await routine.update({ name, notes, day_of_week }, { transaction: t });

    if (exercises) {
      await syncExercisesAndSets(routine, exercises, t);
    }

    await t.commit();
    
    const finalRoutine = await Routine.findByPk(routine.id, { include: [Exercise, SetData] });
    res.json({ data: transformRoutine(finalRoutine) });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};

// Delete endpoint that removes one routine row filtered by `id` and `user_id`.
exports.deleteRoutine = async (req, res) => {
  try {
    const routine = await Routine.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!routine) return res.status(404).json({ message: 'Routine not found' });

    await routine.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Converts stored media paths to public URL path format.
const formatUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('https')) return url;
  if (url.startsWith('/storage') || url.startsWith('storage/')) {
    return url.startsWith('/') ? url : `/${url}`;
  }
  return `/storage/${url.startsWith('/') ? url.slice(1) : url}`;
};

// Shape a workout model into the response contract used by routine screens.
function transformWorkoutLog(log) {
  if (!log) return null;
  const json = log.toJSON ? log.toJSON() : log;
  return {
    id: json.id,
    name: json.name,
    started_at: json.started_at,
    completed_at: json.completed_at,
    duration_seconds: json.duration_seconds,
    total_volume: json.total_volume,
    notes: json.notes,
    created_at: json.created_at,
    updated_at: json.updated_at
  };
}

// Shape routine + joined exercises/sets for the frontend builder/player.
function transformRoutine(r) {
  if (!r) return null;
  const json = r.toJSON ? r.toJSON() : r;
  
  const exercises = (json.Exercises || []).map(ex => {
    const pivot = ex.RoutineExercise || {};
    return {
      id: ex.id,
      name: ex.name,
      muscle_group: ex.muscle_group,
      equipment: ex.equipment,
      body_part: ex.body_part,
      category: ex.category,
      thumbnail_url: formatUrl(ex.thumbnail_url),
      gif_url: formatUrl(ex.gif_url),
      pivot: {
        sort_order: pivot.sort_order || 0,
        target_sets: pivot.target_sets || 3,
        target_reps: pivot.target_reps || 10,
        override_type: pivot.override_type,
        override_metric: pivot.override_metric,
        rest_timer_seconds: pivot.rest_timer_seconds,
      },
      sets: (json.SetData || []).filter(s => s.exercise_id === ex.id && s.workout_log_id === null)
    };
  });

  return {
    id: json.id,
    name: json.name,
    notes: json.notes,
    day_of_week: json.day_of_week,
    exercises: exercises,
    created_at: json.created_at,
    updated_at: json.updated_at
  };
}

exports.getLastLog = async (req, res) => {
  try {
    const lastLog = await WorkoutLog.findOne({
      where: { routine_id: req.params.id, user_id: req.user.id },
      order: [['started_at', 'DESC']],
      include: [SetData]
    });

    res.json({ data: transformWorkoutLog(lastLog) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

async function syncExercisesAndSets(routine, exercises, transaction) {
  // Rebuilds all routine-exercise pivot rows from request payload order and targets.
  await RoutineExercise.destroy({ where: { routine_id: routine.id }, transaction });
  
  const pivotData = (exercises || []).map(ex => ({
    routine_id: routine.id,
    exercise_id: ex.id,
    sort_order: ex.sort_order || 0,
    target_sets: ex.target_sets || 3,
    target_reps: ex.target_reps || 10,
    override_type: ex.override_type,
    override_metric: ex.override_metric,
    rest_timer_seconds: ex.rest_timer_seconds
  }));
  await RoutineExercise.bulkCreate(pivotData, { transaction });

  // Deletes template set rows where `workout_log_id` is null for this routine id.
  await SetData.destroy({ 
    where: { 
      routine_id: routine.id, 
      workout_log_id: null 
    }, 
    transaction 
  });

  // Rebuild set templates from the payload in order.
  const setsToInsert = [];
  (exercises || []).forEach(ex => {
    if (ex.sets && ex.sets.length > 0) {
      ex.sets.forEach((set, index) => {
        setsToInsert.push({
          routine_id: routine.id,
          exercise_id: ex.id,
          set_number: index + 1,
          set_type: set.set_type || 'normal',
          weight_kg: set.weight_kg,
          reps: set.reps,
          duration_seconds: set.duration_seconds,
          rpe: set.rpe
        });
      });
    }
  });

  if (setsToInsert.length > 0) {
    await SetData.bulkCreate(setsToInsert, { transaction });
  }
}
