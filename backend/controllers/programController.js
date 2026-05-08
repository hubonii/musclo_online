const { Program, Routine, Exercise, SetData, RoutineExercise } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Transforms a routine model instance into the API response shape.
 * @param {Object} r - The routine model instance.
 * @returns {Object|null} Transformed routine data.
 */
function transformRoutine(r) {
  if (!r) return null;
  const json = r.toJSON ? r.toJSON() : r;
  

  const exercises = (json.Exercises || []).map(ex => ({
    id: ex.id,
    name: ex.name,
    muscle_group: ex.muscle_group,
    equipment: ex.equipment,
    target_metric: ex.target_metric,
    pivot: ex.RoutineExercise || {},
    sets: (json.SetData || []).filter(s => s.exercise_id === ex.id && s.workout_log_id === null)
  }));

  return {
    id: json.id,
    name: json.name,
    notes: json.notes,
    day_of_week: json.day_of_week,
    exercises: exercises,
    exercises_count: exercises.length > 0 ? exercises.length : (json.exercises_count || 0),
    created_at: json.created_at,
    updated_at: json.updated_at
  };
}

/**
 * Transforms a program model instance into the API response shape.
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
    routines: (json.Routines || []).map(r => transformRoutine(r)),
    created_at: json.created_at,
    updated_at: json.updated_at
  };
}

/**
 * Retrieves all training programs for the authenticated user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getPrograms = async (req, res) => {
  try {

    const programs = await Program.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: Routine,
        as: 'Routines',
        include: [
          { model: Exercise, attributes: ['id', 'name', 'muscle_group', 'equipment'] },
          { model: SetData }
        ]
      }],
      order: [['created_at', 'DESC']]
    });


    const transformed = programs.map(p => {
      const routines = (p.Routines || []).map(r => ({
        ...r.toJSON(),
        exercises_count: r.Exercises?.length || 0
      }));
      return transformProgram({ ...p.toJSON(), Routines: routines });
    });

    res.json({ data: transformed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Creates a new training program for the authenticated user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.createProgram = async (req, res) => {
  try {
    const { name, description, is_active } = req.body;
    const program = await Program.create({
      name,
      description,
      is_active,
      user_id: req.user.id
    });

    res.status(201).json({ data: transformProgram(program) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Retrieves details for a specific training program.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getProgram = async (req, res) => {
  try {

    const program = await Program.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [{
        model: Routine,
        as: 'Routines',
        include: [{ model: Exercise }, { model: SetData }]
      }]
    });

    if (!program) return res.status(404).json({ message: 'Program not found' });

    res.json({ data: transformProgram(program) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Updates an existing training program.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.updateProgram = async (req, res) => {
  try {

    const program = await Program.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!program) return res.status(404).json({ message: 'Program not found' });

    await program.update(req.body);
    res.json({ data: transformProgram(program) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Deletes a training program and its associated routines.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.deleteProgram = async (req, res) => {
  try {

    const program = await Program.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!program) return res.status(404).json({ message: 'Program not found' });

    await program.destroy();
    res.json({ message: 'Program deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
/**
 * Creates a complete training program with routines and exercises from AI-structured JSON.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.createProgramFromAI = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { name, description, routines } = req.body;

    if (!name || !routines || !Array.isArray(routines)) {
      throw new Error('Invalid program data: name and routines are required.');
    }

    const program = await Program.create({
      name,
      description: description || 'Generated by Musclo AI',
      user_id: req.user.id,
      is_active: true
    }, { transaction });

    for (const rData of routines) {
      const routine = await Routine.create({
        name: rData.name || 'Untitled Routine',
        day_of_week: rData.day_of_week,
        program_id: program.id,
        user_id: req.user.id
      }, { transaction });

      if (rData.exercises && Array.isArray(rData.exercises)) {
        for (let i = 0; i < rData.exercises.length; i++) {
          const exData = rData.exercises[i];
          
          // Try to find the exercise by name (fuzzy match)
          const exercise = await Exercise.findOne({
            where: {
              name: { [Op.like]: `%${exData.name}%` }
            }
          });

          if (exercise) {
            // Determine if bodyweight or weights based on exercise equipment or AI hint
            const isBodyweight = exData.equipment === 'bodyweight' || exercise.equipment === 'Body Weight';
            
            await RoutineExercise.create({
              routine_id: routine.id,
              exercise_id: exercise.id,
              sort_order: i,
              target_sets: parseInt(exData.sets) || 3,
              target_reps: parseInt(exData.reps) || 10,
              override_type: isBodyweight ? 'Bodyweight' : 'Weights',
              override_metric: exData.metric === 'time' ? 'Time' : 'Reps',
              rest_timer_seconds: parseInt(exData.rest_time) || 60
            }, { transaction });

            // Create the actual sets for the routine template
            const numSets = parseInt(exData.sets) || 3;
            for (let sNum = 1; sNum <= numSets; sNum++) {
              await SetData.create({
                routine_id: routine.id,
                exercise_id: exercise.id,
                set_number: sNum,
                set_type: exData.type === 'warmup' ? 'warmup' : (exData.type === 'dropset' ? 'dropset' : 'working'),
                reps: exData.metric !== 'time' ? (parseInt(exData.reps) || 10) : null,
                duration_seconds: exData.metric === 'time' ? (parseInt(exData.reps) || 30) : null,
                weight_kg: 0 
              }, { transaction });
            }
          }
        }
      }
    }

    await transaction.commit();
    
    // Fetch the fully populated program to return
    const fullProgram = await Program.findOne({
      where: { id: program.id },
      include: [{
        model: Routine,
        as: 'Routines',
        include: [
          { model: Exercise },
          { model: SetData }
        ]
      }]
    });

    res.status(201).json({ data: transformProgram(fullProgram) });
  } catch (err) {
    if (transaction) await transaction.rollback();
    console.error('[AI Program Create] Error:', err);
    res.status(500).json({ message: err.message });
  }
};
