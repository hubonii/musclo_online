const { Achievement } = require('../models');

const achievements = [
  {
    slug: 'first-workout',
    name: 'First Blood',
    description: 'Complete your very first workout session.',
    icon: '🔥',
    category: 'Milestone',
    criteria: JSON.stringify({ type: 'workout_count', count_gte: 1 }),
    xp_reward: 100
  },
  {
    slug: 'workout-10',
    name: 'Deca Lifter',
    description: 'Complete 10 workout sessions.',
    icon: '🔟',
    category: 'Milestone',
    criteria: JSON.stringify({ type: 'workout_count', count_gte: 10 }),
    xp_reward: 500
  },
  {
    slug: 'workout-50',
    name: 'Half-Century',
    description: 'Complete 50 workout sessions.',
    icon: '🏅',
    category: 'Milestone',
    criteria: JSON.stringify({ type: 'workout_count', count_gte: 50 }),
    xp_reward: 2000
  },
  {
    slug: 'consistent-lifter',
    name: '3-Day Streak',
    description: 'Maintain a 3-day workout streak.',
    icon: '📅',
    category: 'Streak',
    criteria: JSON.stringify({ type: 'streak', days_gte: 3 }),
    xp_reward: 300
  },
  {
    slug: 'streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day workout streak.',
    icon: '⚡',
    category: 'Streak',
    criteria: JSON.stringify({ type: 'streak', days_gte: 7 }),
    xp_reward: 1000
  },
  {
    slug: 'volume-warrior',
    name: 'Volume Warrior',
    description: 'Lift a total of 10,000kg across all workouts.',
    icon: '🏋️',
    category: 'Volume',
    criteria: JSON.stringify({ type: 'total_volume', volume_gte: 10000 }),
    xp_reward: 500
  },
  {
    slug: 'volume-100k',
    name: 'Heavy Hitter',
    description: 'Lift a total of 100,000kg across all workouts.',
    icon: '🏢',
    category: 'Volume',
    criteria: JSON.stringify({ type: 'total_volume', volume_gte: 100000 }),
    xp_reward: 2500
  },
  {
    slug: 'variety-king',
    name: 'Variety King',
    description: 'Perform at least 5 different exercises in a single workout.',
    icon: '🧬',
    category: 'Variety',
    criteria: JSON.stringify({ type: 'exercise_variety', distinct_exercises_gte: 5 }),
    xp_reward: 200
  },
  {
    slug: 'early-bird',
    name: 'Early Bird',
    description: 'Complete a workout before 8:00 AM.',
    icon: '🌅',
    category: 'Timing',
    criteria: JSON.stringify({ type: 'time_of_day', before_hour: 8 }),
    xp_reward: 150
  },
  {
    slug: 'night-owl',
    name: 'Night Owl',
    description: 'Complete a workout after 10:00 PM.',
    icon: '🦉',
    category: 'Timing',
    criteria: JSON.stringify({ type: 'time_of_day', after_hour: 22 }),
    xp_reward: 150
  },
  {
    slug: 'first-pr',
    name: 'Personal Best',
    description: 'Break your first personal record in any exercise.',
    icon: '🌟',
    category: 'Strength',
    criteria: JSON.stringify({ type: 'first_pr' }),
    xp_reward: 250
  },
  {
    slug: 'squat-100',
    name: 'Plate Master (Squat)',
    description: 'Squat 100kg or more.',
    icon: '🦵',
    category: 'Strength',
    criteria: JSON.stringify({ type: 'pr_weight', exercise_name: 'Squat', weight_gte: 100 }),
    xp_reward: 1000
  },
  {
    slug: 'deadlift-140',
    name: 'Ground Breaker',
    description: 'Deadlift 140kg (3 plates) or more.',
    icon: '💀',
    category: 'Strength',
    criteria: JSON.stringify({ type: 'pr_weight', exercise_name: 'Deadlift', weight_gte: 140 }),
    xp_reward: 1500
  },
  {
    slug: 'bench-press-100',
    name: 'Century Press',
    description: 'Bench press 100kg or more.',
    icon: '💯',
    category: 'Strength',
    criteria: JSON.stringify({ type: 'pr_weight', exercise_name: 'Bench Press', weight_gte: 100 }),
    xp_reward: 1000
  }
];

async function seedAchievements() {
  try {
    console.log('Seeding achievements...');
    for (const ach of achievements) {
      await Achievement.findOrCreate({
        where: { slug: ach.slug },
        defaults: ach
      });
    }
    console.log('Achievements seeded successfully.');
  } catch (err) {
    console.error('Error seeding achievements:', err);
  }
}

module.exports = seedAchievements;
