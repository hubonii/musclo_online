// Achievement rules for unlocking badges and milestones.
const { Achievement, WorkoutLog, SetData, Exercise } = require('../models');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

class AchievementService {
  async checkAchievements(user, latestWorkoutLog, transaction) {
    // Step 1: loads unlocked achievement ids and filters pending achievement rules.
    const unlocked = [];
    const unlockedAchievements = await user.getAchievements({ attributes: ['id'] });
    const unlockedIds = unlockedAchievements.map(a => a.id);

    // Load only achievements not already unlocked by this user.
    const achievements = await Achievement.findAll({
      where: { id: { [Op.notIn]: unlockedIds.length ? unlockedIds : [0] } }
    });

    if (achievements.length === 0) return [];

    // 2) Precompute summary stats used by multiple criteria checks.
    const totalWorkouts = await WorkoutLog.count({ where: { user_id: user.id } });
    const totalVolume = await WorkoutLog.sum('total_volume', { where: { user_id: user.id } });
    const streak = await this.calculateStreak(user);

    // 3) Gather latest workout details for PR/variety/time-based achievements.
    const sets = await latestWorkoutLog.getSetData({ include: ['Exercise'] });
    const hitPrThisWorkout = sets.some(s => s.is_pr);
    const exercisesInWorkout = [...new Set(sets.map(s => s.Exercise?.name.toLowerCase()).filter(Boolean))];
    const workoutHour = new Date(latestWorkoutLog.started_at).getHours();

    // Evaluate every pending rule against precomputed stats and latest workout details.
    for (const achievement of achievements) {
      const criteria = achievement.criteria;
      const type = criteria.type;
      let shouldUnlock = false;

      // Each achievement type maps to one clear boolean condition.
      switch (type) {
        case 'workout_count':
          if (totalWorkouts >= (criteria.count_gte || 0)) shouldUnlock = true;
          break;
        case 'total_volume':
          if (totalVolume >= (criteria.volume_gte || 0)) shouldUnlock = true;
          break;
        case 'streak':
          if (streak >= (criteria.days_gte || 0)) shouldUnlock = true;
          break;
        case 'first_pr':
          if (hitPrThisWorkout) shouldUnlock = true;
          break;
        case 'exercise_variety':
          if (exercisesInWorkout.length >= (criteria.distinct_exercises_gte || 0)) shouldUnlock = true;
          break;
        case 'time_of_day':
          if (criteria.before_hour !== undefined && workoutHour < criteria.before_hour) shouldUnlock = true;
          if (criteria.after_hour !== undefined && workoutHour >= criteria.after_hour) shouldUnlock = true;
          break;
        case 'pr_weight':
          const exName = (criteria.exercise_name || '').toLowerCase();
          if (exercisesInWorkout.includes(exName)) {
            const maxWeight = await SetData.max('weight_kg', {
              include: [{ model: Exercise, where: { name: exName } }, { model: WorkoutLog, where: { user_id: user.id } }]
            });
            if (maxWeight >= (criteria.weight_gte || 0)) shouldUnlock = true;
          }
          break;
      }

      if (shouldUnlock) {
        // Write unlock timestamp in the pivot table (`UserAchievement`).
        await user.addAchievement(achievement, { through: { unlocked_at: new Date() }, transaction });
        unlocked.push(achievement);
      }
    }

    return unlocked;
  }

  async calculateStreak(user) {
    // Distinct workout days in descending order.
    // Query unique completed-workout days (latest first).
    const dates = await WorkoutLog.findAll({
      attributes: [[sequelize.fn('DATE', sequelize.col('started_at')), 'workout_date']],
      where: { user_id: user.id, completed_at: { [Op.ne]: null } },
      group: [sequelize.fn('DATE', sequelize.col('started_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('started_at')), 'DESC']],
      raw: true
    });

    if (dates.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastWorkoutDate = new Date(dates[0].workout_date);
    lastWorkoutDate.setHours(0, 0, 0, 0);

    // If the last completed workout was more than one day ago, streak resets.
    const diffDays = (today - lastWorkoutDate) / (1000 * 60 * 60 * 24);
    if (diffDays > 1) return 0;

    // Count consecutive days backward from the last workout date.
    let expected = lastWorkoutDate;
    for (const d of dates) {
      const currentDate = new Date(d.workout_date);
      currentDate.setHours(0, 0, 0, 0);
      
      if (currentDate.getTime() === expected.getTime()) {
        streak++;
        expected.setDate(expected.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }
}

module.exports = new AchievementService();
