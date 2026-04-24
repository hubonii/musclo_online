// Seed a small starter exercise catalog used on first run.
const { Exercise } = require('../models');

const seedExercises = async () => {
  // Keep this starter list small and stable so local setup is predictable.
  // Each object matches `Exercise` model columns used in first-run seed.
  const exercises = [
    {
      name: 'Bench Press',
      muscle_group: 'Chest',
      equipment: 'Barbell',
      body_part: 'Chest',
      primary_muscles: ['Pectoralis Major'],
      secondary_muscles_json: ['Triceps', 'Front Deltoids'],
      has_front_anatomy: true,
      category: 'strength'
    },
    {
      name: 'Deadlift',
      muscle_group: 'Back',
      equipment: 'Barbell',
      body_part: 'Back',
      primary_muscles: ['Lower Back', 'Hamstrings', 'Glutes'],
      secondary_muscles_json: ['Forearms', 'Traps'],
      has_back_anatomy: true,
      category: 'strength'
    },
    {
      name: 'Squat',
      muscle_group: 'Legs',
      equipment: 'Barbell',
      body_part: 'Upper Legs',
      primary_muscles: ['Quadriceps', 'Glutes'],
      secondary_muscles_json: ['Hamstrings', 'Calves', 'Lower Back'],
      has_front_anatomy: true,
      has_back_anatomy: true,
      category: 'strength'
    },
    {
      name: 'Overhead Press',
      muscle_group: 'Shoulders',
      equipment: 'Barbell',
      body_part: 'Shoulders',
      primary_muscles: ['Deltoids'],
      secondary_muscles_json: ['Triceps', 'Upper Traps'],
      has_front_anatomy: true,
      category: 'strength'
    },
    {
      name: 'Pull ups',
      muscle_group: 'Back',
      equipment: 'Bodyweight',
      body_part: 'Back',
      primary_muscles: ['Lats'],
      secondary_muscles_json: ['Biceps', 'Rear Deltoids'],
      has_back_anatomy: true,
      category: 'strength'
    },
    {
      name: 'Bicep Curls',
      muscle_group: 'Arms',
      equipment: 'Dumbbells',
      body_part: 'Upper Arms',
      primary_muscles: ['Biceps'],
      secondary_muscles_json: ['Forearms'],
      has_front_anatomy: true,
      category: 'strength'
    }
  ];

  try {
    console.log('Seeding exercises...');
    // Iterate through starter catalog and create missing rows only.
    for (const ex of exercises) {
      // Idempotent seed: create only when exercise name does not exist yet.
      await Exercise.findOrCreate({
        where: { name: ex.name },
        defaults: ex
      });
    }
    console.log('Exercises seeded successfully.');
  } catch (error) {
    console.error('Error seeding exercises:', error);
  }
};

module.exports = seedExercises;


