// Central place where Sequelize models are linked together.
const User = require('./User');
const Program = require('./Program');
const Routine = require('./Routine');
const Exercise = require('./Exercise');
const RoutineExercise = require('./RoutineExercise');
const WorkoutLog = require('./WorkoutLog');
const SetData = require('./SetData');
const Measurement = require('./Measurement');
const ProgressPhoto = require('./ProgressPhoto');
const Achievement = require('./Achievement');
const UserAchievement = require('./UserAchievement');
const UserSetting = require('./UserSetting');
const ChatSession = require('./ChatSession');
const ChatMessage = require('./ChatMessage');

// User-owned resources.
User.hasMany(Program, { foreignKey: 'user_id' });
Program.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Routine, { foreignKey: 'user_id' });
Routine.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(WorkoutLog, { foreignKey: 'user_id' });
WorkoutLog.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Exercise, { foreignKey: 'user_id', as: 'customExercises' });
Exercise.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Measurement, { foreignKey: 'user_id' });
Measurement.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(ProgressPhoto, { foreignKey: 'user_id' });
ProgressPhoto.belongsTo(User, { foreignKey: 'user_id' });

User.hasOne(UserSetting, { foreignKey: 'user_id', as: 'settings' });
UserSetting.belongsTo(User, { foreignKey: 'user_id' });

User.belongsToMany(Achievement, { through: UserAchievement, foreignKey: 'user_id' });
Achievement.belongsToMany(User, { through: UserAchievement, foreignKey: 'achievement_id' });

// Favorites is a many-to-many relation stored in `exercise_favorites` join table.
User.belongsToMany(Exercise, { through: 'exercise_favorites', as: 'favoriteExercises', foreignKey: 'user_id' });
Exercise.belongsToMany(User, { through: 'exercise_favorites', as: 'favoritedBy', foreignKey: 'exercise_id' });

User.hasMany(ChatSession, { foreignKey: 'user_id' });
ChatSession.belongsTo(User, { foreignKey: 'user_id' });

// Program and routine structure.
// One program contains multiple routines.
Program.hasMany(Routine, { foreignKey: 'program_id' });
Routine.belongsTo(Program, { foreignKey: 'program_id' });

// Many-to-many relation through `RoutineExercise` with routine-specific targets.
Routine.belongsToMany(Exercise, { through: RoutineExercise, foreignKey: 'routine_id' });
Exercise.belongsToMany(Routine, { through: RoutineExercise, foreignKey: 'exercise_id' });

// Logged set data can be tied to a routine template and a workout session.
Routine.hasMany(SetData, { foreignKey: 'routine_id' });
SetData.belongsTo(Routine, { foreignKey: 'routine_id' });

Routine.hasMany(WorkoutLog, { foreignKey: 'routine_id' });
WorkoutLog.belongsTo(Routine, { foreignKey: 'routine_id' });

Exercise.hasMany(SetData, { foreignKey: 'exercise_id' });
SetData.belongsTo(Exercise, { foreignKey: 'exercise_id' });

// One workout log contains many performed sets.
WorkoutLog.hasMany(SetData, { foreignKey: 'workout_log_id' });
SetData.belongsTo(WorkoutLog, { foreignKey: 'workout_log_id' });

// AI coach chat history.
ChatSession.hasMany(ChatMessage, { foreignKey: 'chat_session_id' });
ChatMessage.belongsTo(ChatSession, { foreignKey: 'chat_session_id' });

module.exports = {
  User,
  Program,
  Routine,
  Exercise,
  RoutineExercise,
  WorkoutLog,
  SetData,
  Measurement,
  ProgressPhoto,
  Achievement,
  UserAchievement,
  UserSetting,
  ChatSession,
  ChatMessage,
};
