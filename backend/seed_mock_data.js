const { 
    User, Program, Routine, Exercise, RoutineExercise,
    WorkoutLog, SetData, Measurement, ProgressPhoto 
} = require('./models');
const { Op } = require('sequelize');
const sequelize = require('./config/database');
require('dotenv').config();

async function seed() {
    try {
        console.log('--- STARTING FINAL RECOVERY SEEDING ---');

        const user = await User.findOne({ where: { email: 'huboony@gmail.com' } });
        if (!user) throw new Error('User not found');
        const userId = user.id;

        console.log('Cleaning up user history...');
        await ProgressPhoto.destroy({ where: { user_id: userId } });
        await Measurement.destroy({ where: { user_id: userId } });
        
        const userWorkouts = await WorkoutLog.findAll({ where: { user_id: userId } });
        const workoutIds = userWorkouts.map(w => w.id);
        if (workoutIds.length > 0) {
            await SetData.destroy({ where: { workout_log_id: { [Op.in]: workoutIds } } });
        }
        await WorkoutLog.destroy({ where: { user_id: userId } });
        
        const userRoutines = await Routine.findAll({ where: { user_id: userId } });
        const routineIds = userRoutines.map(r => r.id);
        if (routineIds.length > 0) {
            await RoutineExercise.destroy({ where: { routine_id: { [Op.in]: routineIds } } });
        }
        await Routine.destroy({ where: { user_id: userId } });
        await Program.destroy({ where: { user_id: userId } });

        const sasUrl = process.env.AZURE_STORAGE_SAS_URL;
        const [baseUrl, sasToken] = sasUrl.split('?');
        const workingBlobs = ['Aesthetic Wallpaper for iPhone and android.jpg', 'Duck Rich.jpg', 'New Wallpaper.jpg', 'The Green Explorer.jpg', 'download (1).jpg'];
        const getUrlForBlob = (name) => `${baseUrl}/${encodeURIComponent(name)}?${sasToken}`;

        const exercises = await Exercise.findAll({ limit: 5 });
        const chestEx = exercises[0];

        console.log('Rebuilding Mock Database...');
        const program = await Program.create({ user_id: userId, name: 'Evolution Phase 1', description: 'Elite Mock Data' });
        const push = await Routine.create({ user_id: userId, program_id: program.id, name: 'Push Protocol', day_of_week: '2' });
        
        await RoutineExercise.create({ routine_id: push.id, exercise_id: chestEx.id, order: 1, target_sets: 4, target_reps: '12' });

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 14);

        for (let i = 0; i <= 14; i += 7) {
            const dateStr = new Date(startDate.getTime() + (i * 86400000)).toISOString().split('T')[0];
            const m = await Measurement.create({ user_id: userId, date: dateStr, weight_kg: 85 - (i/7) });
            
            await ProgressPhoto.create({
                user_id: userId,
                measurement_id: m.id,
                pose: 'front',
                photo_path: getUrlForBlob(workingBlobs[i % workingBlobs.length]),
                taken_at: `${dateStr}T10:00:00Z`
            });

            const workout = await WorkoutLog.create({
                user_id: userId,
                routine_id: push.id,
                name: 'Push Protocol Session',
                started_at: `${dateStr}T10:00:00Z`,
                completed_at: `${dateStr}T11:00:00Z`,
                total_volume: 3000 + (i * 200)
            });

            await SetData.create({
                workout_log_id: workout.id,
                exercise_id: chestEx.id,
                set_number: 1,
                reps: 12,
                weight_kg: 70 + (i/7),
                set_type: 'working'
            });
        }

        console.log('--- ALL SYSTEMS GREEN ---');

    } catch (err) {
        console.error('FINAL SEED FAILED:', err);
    } finally {
        await sequelize.close();
    }
}

seed();
