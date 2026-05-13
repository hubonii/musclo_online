const { 
    User, Program, Routine, Exercise, RoutineExercise,
    WorkoutLog, SetData, Measurement, ProgressPhoto 
} = require('./models');
const { Op } = require('sequelize');
const sequelize = require('./config/database');
require('dotenv').config();

async function seed() {
    try {
        console.log('--- STARTING HIGH-FIDELITY PPL SEEDING WITH REAL ASSETS ---');

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

        // New Base URL provided by user
        const baseUrl = 'https://muscloasset2.blob.core.windows.net/progressphotos';
        const sasToken = process.env.AZURE_STORAGE_SAS_URL ? process.env.AZURE_STORAGE_SAS_URL.split('?')[1] : '';

        // Exact filenames provided by user
        const realBlobs = [
            '1778661995847-FB_IMG_1693317954251.jpg',
            'Aesthetic Wallpaper for iPhone and android.jpg',
            'Asparagus Cartoon Character in Casual Street Style.jpg',
            'BTS (방탄소년단) \'Dynamite\' Official MV.jpg',
            'New Wallpaper.jpg',
            'The Green Explorer.jpg',
            'Wallpaper papel de parede 4k 8k.jpg',
            'download (10).jpg',
            'download (4).jpg',
            'download (6).jpg',
            'download (7).jpg',
            'download (8).jpg',
            'download.jpg',
            'illustration character.jpg',
            'Duck Rich.jpg',
            'download (1).jpg',
            'download (11).jpg',
            'download (12).jpg',
            'download (2).jpg',
            'download (3).jpg',
            'download (5).jpg',
            'download (9).jpg',
            'Копилка дизайна 💌.jpg'
        ];

        const getUrl = (name) => `${baseUrl}/${encodeURIComponent(name)}${sasToken ? '?' + sasToken : ''}`;

        const allEx = await Exercise.findAll();
        const findE = (n) => allEx.find(e => e.name.toLowerCase().includes(n.toLowerCase())) || allEx[0];

        const bp = findE('bench press');
        const sp = findE('shoulder press');
        const tr = findE('tricep');
        const lp = findE('lat pulldown');
        const row = findE('row');
        const curl = findE('bicep');
        const sq = findE('squat');
        const lpr = findE('leg press');

        console.log('Building Elite 6-Day Program...');
        const prog = await Program.create({ user_id: userId, name: 'Evolution: PPL + Swimming', description: 'Optimal 6-day split with swimming recovery.' });

        const pull = await Routine.create({ user_id: userId, program_id: prog.id, name: 'Pull Protocol', day_of_week: '1' });
        const push = await Routine.create({ user_id: userId, program_id: prog.id, name: 'Push Protocol', day_of_week: '2' });
        const legs = await Routine.create({ user_id: userId, program_id: prog.id, name: 'Leg Protocol', day_of_week: '3' });
        const swim = await Routine.create({ user_id: userId, program_id: prog.id, name: 'Swimming Recovery', day_of_week: '7' });

        await RoutineExercise.bulkCreate([
            { routine_id: pull.id, exercise_id: lp.id, sort_order: 0, target_sets: 3, target_reps: 10 },
            { routine_id: pull.id, exercise_id: row.id, sort_order: 1, target_sets: 3, target_reps: 10 },
            { routine_id: push.id, exercise_id: bp.id, sort_order: 0, target_sets: 3, target_reps: 10 },
            { routine_id: push.id, exercise_id: sp.id, sort_order: 1, target_sets: 3, target_reps: 10 },
            { routine_id: legs.id, exercise_id: sq.id, sort_order: 0, target_sets: 3, target_reps: 8 },
            { routine_id: legs.id, exercise_id: lpr.id, sort_order: 1, target_sets: 3, target_reps: 12 }
        ]);

        const cycle = ['pull', 'push', 'legs', 'rest', 'pull', 'push', 'cardio'];
        const start = new Date();
        start.setDate(start.getDate() - 42); 

        let blobIdx = 0;
        console.log('Seeding 6 weeks of realistic history...');

        for (let d = 0; d < 42; d++) {
            const cur = new Date(start.getTime() + (d * 86400000));
            const ds = cur.toISOString().split('T')[0];
            const type = cycle[d % 7];

            // Weekly measurement with unique photos
            if (d % 7 === 0) {
                const m = await Measurement.create({ 
                    user_id: userId, 
                    date: ds, 
                    weight_kg: 90 - (d/7)*0.5, 
                    height_cm: 164 
                });
                await ProgressPhoto.create({ 
                    user_id: userId, 
                    measurement_id: m.id, 
                    pose: 'front', 
                    photo_path: getUrl(realBlobs[blobIdx % realBlobs.length]), 
                    taken_at: `${ds}T09:00:00Z` 
                });
                blobIdx++;
            }

            if (type === 'rest') continue;
            const r = type === 'pull' ? pull : type === 'push' ? push : type === 'legs' ? legs : swim;
            
            const w = await WorkoutLog.create({
                user_id: userId, routine_id: r.id, name: r.name,
                started_at: `${ds}T18:00:00Z`, completed_at: `${ds}T19:30:00Z`, duration_seconds: 5400,
                total_volume: type === 'cardio' ? 0 : 5000 + (d*200)
            });

            if (type !== 'cardio') {
                const res = await RoutineExercise.findAll({ where: { routine_id: r.id } });
                for (const re of res) {
                    let base = 40;
                    if (type === 'push') base = re.sort_order === 0 ? 50 : 35;
                    if (type === 'pull') base = re.sort_order === 0 ? 45 : 40;
                    if (type === 'legs') base = re.sort_order === 0 ? 70 : 110;
                    
                    const weight = base + (Math.floor(d/7) * 2.5);
                    for (let s = 1; s <= 3; s++) {
                        await SetData.create({ workout_log_id: w.id, exercise_id: re.exercise_id, set_number: s, reps: 10, weight_kg: weight });
                    }
                }
            }
        }
        console.log('--- HIGH-FIDELITY SEEDING COMPLETE ---');
    } catch (err) { console.error(err); } finally { await sequelize.close(); }
}
seed();
