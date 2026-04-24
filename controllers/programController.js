// Program controller: manage training programs and nested routines.
const { Program, Routine, Exercise, SetData } = require('../models');

// Convert a routine model (with joins) to the API contract used by the UI.
function transformRoutine(r) {
  if (!r) return null;
  const json = r.toJSON ? r.toJSON() : r;
  
  // Attach exercise-level pivot data and template sets for each routine exercise.
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
    is_public: !!json.is_public,
    exercises: exercises,
    exercises_count: exercises.length > 0 ? exercises.length : (json.exercises_count || 0),
    created_at: json.created_at,
    updated_at: json.updated_at
  };
}

// Convert a program model to a consistent response shape.
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

exports.getPrograms = async (req, res) => {
  try {
    // Program query scoped by `user_id` with nested routine exercise id include.
    const programs = await Program.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: Routine,
        as: 'Routines',
        include: [{ model: Exercise, attributes: ['id'] }]
      }],
      order: [['created_at', 'DESC']]
    });

    // Compute `exercises_count` per routine before final response transform.
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

// Create a new program owned by the authenticated user.
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

exports.getProgram = async (req, res) => {
  try {
    // Single program details with routines, exercises, and template sets.
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

// Update one user-owned program.
exports.updateProgram = async (req, res) => {
  try {
    // Restrict update to programs owned by current authenticated user.
    const program = await Program.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!program) return res.status(404).json({ message: 'Program not found' });

    await program.update(req.body);
    res.json({ data: transformProgram(program) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete one user-owned program.
exports.deleteProgram = async (req, res) => {
  try {
    // Restrict delete to programs owned by current authenticated user.
    const program = await Program.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!program) return res.status(404).json({ message: 'Program not found' });

    await program.destroy();
    res.json({ message: 'Program deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Quick endpoint to create a routine directly under a specific program.
exports.addRoutineToProgram = async (req, res) => {
  try {
    // Ensure parent program exists and belongs to current user before insert.
    const program = await Program.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!program) return res.status(404).json({ message: 'Program not found' });

    const routine = await Routine.create({
      ...req.body,
      user_id: req.user.id,
      program_id: program.id
    });

    res.status(201).json({ data: transformRoutine(routine) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


