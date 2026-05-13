const { 
    User, Program, Routine, Exercise, RoutineExercise,
    WorkoutLog, SetData, Measurement, ProgressPhoto 
} = require('./models');
const { Op } = require('sequelize');
const sequelize = require('./config/database');
require('dotenv').config();

async function seed() {
    try {
        console.log('--- STARTING HIGH-FIDELITY SEEDING: 6 WEEKS PAST + 2 WEEKS FUTURE ---');

        const user = await User.findOne({ where: { email: 'huboony@gmail.com' } });
        if (!user) throw new Error('User not found');
        const userId = user.id;

        console.log('Clearing old data...');
        await sequelize.query(`DELETE FROM progress_photos WHERE user_id = ${userId}`);
        await sequelize.query(`DELETE FROM measurements WHERE user_id = ${userId}`);
        await sequelize.query(`DELETE FROM set_data WHERE workout_log_id IN (SELECT id FROM workout_logs WHERE user_id = ${userId})`);
        await WorkoutLog.destroy({ where: { user_id: userId }, force: true });
        await sequelize.query(`DELETE FROM routine_exercise WHERE routine_id IN (SELECT id FROM routines WHERE user_id = ${userId})`);
        await Routine.destroy({ where: { user_id: userId }, force: true });
        await Program.destroy({ where: { user_id: userId }, force: true });

        const baseUrl = 'https://muscloasset2.blob.core.windows.net/progressphotos';
        const sasToken = process.env.AZURE_STORAGE_SAS_URL ? process.env.AZURE_STORAGE_SAS_URL.split('?')[1] : '';
        const realBlobs = [
            '1778661995847-FB_IMG_1693317954251.jpg', 'Aesthetic Wallpaper for iPhone and android.jpg',
            'Asparagus Cartoon Character in Casual Street Style.jpg', 'BTS (방탄소년단) \'Dynamite\' Official MV.jpg',
            'New Wallpaper.jpg', 'The Green Explorer.jpg', 'Wallpaper papel de parede 4k 8k.jpg',
            'download (10).jpg', 'download (4).jpg', 'download (6).jpg', 'download (7).jpg',
            'download (8).jpg', 'download.jpg', 'illustration character.jpg', 'Duck Rich.jpg',
            'download (1).jpg', 'download (11).jpg', 'download (12).jpg', 'download (2).jpg',
            'download (3).jpg', 'download (5).jpg', 'download (9).jpg', 'Копилка дизайна 💌.jpg'
        ];
        const getUrl = (name) => `${baseUrl}/${encodeURIComponent(name)}${sasToken ? '?' + sasToken : ''}`;

        const allEx = await Exercise.findAll();
        const findE = (n) => allEx.find(e => e.name.toLowerCase().includes(n.toLowerCase())) || allEx[0];

        const bp = findE('bench press');
        const sp = findE('shoulder press') || findE('overhead');
        const tr = findE('tricep');
        const lat = findE('lateral raise');
        const dead = findE('deadlift') || findE('row');
        const lpd = findE('lat pulldown');
        const row = findE('seated row') || findE('row');
        const face = findE('face pull');
        const curl = findE('bicep curl');
        const sq = findE('squat');
        const lpr = findE('leg press');
        const lcur = findE('leg curl');
        const calf = findE('calf raise');

        const prog = await Program.create({ user_id: userId, name: 'Proper PPL Evolution', description: 'Comprehensive 6-day split with scientific volume distribution.' });

        const pull = await Routine.create({ user_id: userId, program_id: prog.id, name: 'Proper Pull', day_of_week: '1' });
        const push = await Routine.create({ user_id: userId, program_id: prog.id, name: 'Proper Push', day_of_week: '2' });
        const legs = await Routine.create({ user_id: userId, program_id: prog.id, name: 'Proper Legs', day_of_week: '3' });
        const swim = await Routine.create({ user_id: userId, program_id: prog.id, name: 'Active Recovery (Swimming)', day_of_week: '7' });

        const addBulk = async (rId, exs) => {
            for (let i = 0; i < exs.length; i++) {
                await RoutineExercise.create({ routine_id: rId, exercise_id: exs[i].id, sort_order: i, target_sets: 3, target_reps: 10 });
            }
        };

        await addBulk(pull.id, [dead, lpd, row, face, curl]);
        await addBulk(push.id, [bp, sp, lat, tr]);
        await addBulk(legs.id, [sq, lpr, lcur, calf]);

        const cycle = ['pull', 'push', 'legs', 'rest', 'pull', 'push', 'cardio'];
        
        // Total duration: 56 days (42 past + 14 future)
        const totalDays = 56;
        const start = new Date();
        start.setDate(start.getDate() - 42); 

        let bIdx = 0;
        console.log(`Generating ${totalDays} days of data with full measurements (integers)...`);

        for (let d = 0; d < totalDays; d++) {
            const cur = new Date(start.getTime() + (d * 86400000));
            const ds = cur.toISOString().split('T')[0];
            const type = cycle[d % 7];

            if (d % 7 === 0) {
                const week = d / 7;
                const m = await Measurement.create({ 
                    user_id: userId, 
                    date: ds, 
                    weight_kg: Math.round(90 - (week * 0.75)), 
                    height_cm: 164,
                    chest_cm: Math.round(110 - (week * 0.4)),
                    waist_cm: Math.round(105 - (week * 0.9)),
                    shoulders_cm: Math.round(120 + (week * 0.3)),
                    left_arm_cm: Math.round(38 + (week * 0.2)),
                    right_arm_cm: Math.round(38 + (week * 0.2)),
                    left_leg_cm: Math.round(62 - (week * 0.1)),
                    right_leg_cm: Math.round(62 - (week * 0.1)),
                    calves_cm: 40,
                    neck_cm: 42,
                    body_fat_percent: Math.round(28 - (week * 0.6))
                });
                for (const p of ['front', 'side', 'back']) {
                    await ProgressPhoto.create({ user_id: userId, measurement_id: m.id, pose: p, photo_path: getUrl(realBlobs[bIdx % realBlobs.length]), taken_at: ds });
                    bIdx++;
                }
            }

            if (type === 'rest') continue;
            const r = type === 'pull' ? pull : type === 'push' ? push : type === 'legs' ? legs : swim;
            
            // Generate workout logs for ALL days (past and future)
            const workout = await WorkoutLog.create({
                user_id: userId, routine_id: r.id, name: r.name,
                started_at: `${ds}T18:00:00Z`, 
                completed_at: `${ds}T19:45:00Z`, 
                duration_seconds: 6300,
                total_volume: type === 'cardio' ? 0 : 6000 + (d*350)
            });

            if (type !== 'cardio') {
                const res = await RoutineExercise.findAll({ where: { routine_id: r.id } });
                for (const re of res) {
                    let base = 20; 
                    if (re.exercise_id === bp.id) base = 50;
                    if (re.exercise_id === sq.id) base = 70;
                    if (re.exercise_id === dead.id) base = 80;
                    if (re.exercise_id === sp.id) base = 35;
                    if (re.exercise_id === lpr.id) base = 120;
                    
                    const weight = Math.round(base + (Math.floor(d/7) * 2.5));
                    for (let s = 1; s <= 3; s++) {
                        await SetData.create({ workout_log_id: workout.id, exercise_id: re.exercise_id, set_number: s, reps: 10, weight_kg: weight });
                    }
                }
            }
        }
        console.log('--- COMPREHENSIVE SEEDING SUCCESSFUL (PAST + FUTURE) ---');
    } catch (err) { console.error(err); } finally { await sequelize.close(); }
}
seed();
