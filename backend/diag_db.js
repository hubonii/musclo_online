const { User, WorkoutLog, Measurement, ProgressPhoto, ChatMessage, Exercise, SetData } = require('./models');
const sequelize = require('./config/database');

async function checkData() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        const user = await User.findOne({ where: { id: 4 } });
        if (!user) {
            console.log('User 4 not found');
            return;
        }
        console.log('User ID:', user.id, 'Email:', user.email);

        const log = await WorkoutLog.findOne({ 
            where: { user_id: user.id }, 
            include: [{ model: SetData }] 
        });
        if (log) {
            console.log('Log Name:', log.name);
            console.log('Log Volume:', log.total_volume, 'Type:', typeof log.total_volume);
            console.log('Sets Count:', log.SetData.length);
            if (log.SetData.length > 0) {
                console.log('First Set Weight:', log.SetData[0].weight_kg, 'Type:', typeof log.SetData[0].weight_kg);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkData();
