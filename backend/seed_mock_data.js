const { 
    User, 
    Program, 
    Routine, 
    Exercise, 
    WorkoutLog, 
    SetData, 
    Measurement, 
    ProgressPhoto, 
    ChatSession, 
    ChatMessage 
} = require('./models');
const sequelize = require('./config/database');
const { Op } = require('sequelize');

async function seed() {
    const transaction = await sequelize.transaction();
    try {
        console.log('Seeding mock data for huboony@gmail.com...');

        const user = await User.findOne({ where: { email: 'huboony@gmail.com' } });
        if (!user) throw new Error('User not found');
        const userId = user.id;

        // Cleanup existing data
        await WorkoutLog.destroy({ where: { user_id: userId }, transaction });
        await Measurement.destroy({ where: { user_id: userId }, transaction });
        await ProgressPhoto.destroy({ where: { user_id: userId }, transaction });
        await Program.destroy({ where: { user_id: userId }, transaction });
        await Routine.destroy({ where: { user_id: userId }, transaction });
        await ChatSession.destroy({ where: { user_id: userId }, transaction });

        console.log('Old data cleared.');

        // 1. Create Program
        const program = await Program.create({
            user_id: userId,
            name: 'Muscle Growth Masterclass',
            description: 'A professional 5-day split designed for maximal hypertrophy and strength gains.'
        }, { transaction });

        // 2. Create Routines
        const pull = await Routine.create({
            user_id: userId,
            program_id: program.id,
            name: 'Day 1: Pull (Hypertrophy)',
            day_of_week: '1'
        }, { transaction });

        const push = await Routine.create({
            user_id: userId,
            program_id: program.id,
            name: 'Day 2: Push (Power)',
            day_of_week: '2'
        }, { transaction });

        const legs = await Routine.create({
            user_id: userId,
            program_id: program.id,
            name: 'Day 3: Legs & Core',
            day_of_week: '3'
        }, { transaction });

        const cardio = await Routine.create({
            user_id: userId,
            program_id: program.id,
            name: 'Day 0: Active Recovery',
            day_of_week: '0'
        }, { transaction });

        // 3. Link exercises to routines (mocked by seeding SetData with routine_id and null workout_log_id)
        // This is how the system knows which exercises are in which routine template.
        const pullEx = [7, 6]; // Row, Hammer Curl
        const pushEx = [1, 2, 4, 10]; // Bench, Triceps, Lateral, Shoulder
        const legsEx = [3]; // Leg Extension

        for (const exId of pullEx) {
            await SetData.create({ routine_id: pull.id, exercise_id: exId, set_number: 1, reps: 10, weight_kg: 50 }, { transaction });
            await SetData.create({ routine_id: pull.id, exercise_id: exId, set_number: 2, reps: 10, weight_kg: 50 }, { transaction });
        }
        for (const exId of pushEx) {
            await SetData.create({ routine_id: push.id, exercise_id: exId, set_number: 1, reps: 10, weight_kg: 40 }, { transaction });
        }
        for (const exId of legsEx) {
            await SetData.create({ routine_id: legs.id, exercise_id: exId, set_number: 1, reps: 12, weight_kg: 60 }, { transaction });
        }

        // 4. Generate 6 weeks of history
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 28); // 4 weeks ago

        const dayToRoutine = {
            '1': pull,
            '2': push,
            '3': legs,
            '0': cardio
        };

        let currentVol = 2000;
        let currentWeight = 85.0;

        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            const dow = date.getDay().toString();

            // Only log past and present (up to i=28)
            if (i <= 28) {
                const routine = dayToRoutine[dow];
                if (routine) {
                    const log = await WorkoutLog.create({
                        user_id: userId,
                        routine_id: routine.id,
                        name: routine.name,
                        started_at: `${dateStr}T10:00:00Z`,
                        completed_at: `${dateStr}T11:15:00Z`,
                        duration_seconds: 4500,
                        total_volume: currentVol,
                        notes: 'Great session, felt strong today!'
                    }, { transaction });

                    // Add sets for the log
                    const exercises = dow === '1' ? pullEx : (dow === '2' ? pushEx : (dow === '3' ? legsEx : []));
                    for (const exId of exercises) {
                        await SetData.create({
                            workout_log_id: log.id,
                            exercise_id: exId,
                            set_number: 1,
                            set_type: 'working',
                            weight_kg: currentVol / 40, // Mocked weight
                            reps: 10
                        }, { transaction });
                    }
                    currentVol += 50; // Progressive overload
                }

                // Add measurement every 7 days
                if (i % 7 === 0) {
                    const m = await Measurement.create({
                        user_id: userId,
                        date: dateStr,
                        weight_kg: currentWeight,
                        body_fat_percent: 18 - (i / 10),
                        notes: 'Weekly check-in'
                    }, { transaction });

                    // Add progress photo
                    await ProgressPhoto.create({
                        user_id: userId,
                        date: dateStr,
                        measurement_id: m.id,
                        photo_path: 'https://musclostorage.blob.core.windows.net/uploads/progress_placeholder.jpg',
                        pose: 'front'
                    }, { transaction });

                    currentWeight -= 0.2;
                }
            }
        }

        // 5. Add AI Chat History
        const session = await ChatSession.create({
            user_id: userId,
            title: 'Goal Setting & Nutrition',
            is_active: true
        }, { transaction });

        await ChatMessage.create({ chat_session_id: session.id, role: 'user', content: 'What should my daily protein intake be?' }, { transaction });
        await ChatMessage.create({ chat_session_id: session.id, role: 'assistant', content: 'Based on your activity level and goal of muscle growth, I recommend 1.8g to 2.2g of protein per kg of body weight. For you, that is approximately 150-180g daily.' }, { transaction });

        await transaction.commit();
        console.log('Seeding completed successfully!');
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Seeding failed:', error);
    } finally {
        await sequelize.close();
    }
}

seed();
