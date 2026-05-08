
const { WorkoutLog, SetData, Exercise } = require('../models');
const { Parser } = require('json2csv');

/**
 * Exports user workout history as a CSV file.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.exportCsv = async (req, res) => {
  try {

    const logs = await WorkoutLog.findAll({
      where: { user_id: req.user.id },
      include: [{ model: SetData, include: [Exercise] }],
      order: [['started_at', 'DESC']]
    });


    const data = [];
    logs.forEach(log => {

      if (log.SetData.length === 0) {
        data.push({
          'Workout Date': log.started_at.toISOString().split('T')[0],
          'Workout Name': log.name,
          'Duration (s)': log.duration_seconds,
          'Total Volume': log.total_volume,
          'Exercise Name': 'N/A',
          'Set Number': 'N/A',
          'Type': 'N/A',
          'Weight': 'N/A',
          'Reps': 'N/A',
          'RPE': 'N/A',
          'Is PR': 'N/A'
        });
      } else {

        log.SetData.forEach(set => {
          data.push({
            'Workout Date': log.started_at.toISOString().split('T')[0],
            'Workout Name': log.name,
            'Duration (s)': log.duration_seconds,
            'Total Volume': log.total_volume,
            'Exercise Name': set.Exercise ? set.Exercise.name : 'Unknown',
            'Set Number': set.set_number,
            'Type': set.set_type,
            'Weight': set.weight_kg,
            'Reps': set.reps,
            'RPE': set.rpe,
            'Is PR': set.is_pr ? 'Yes' : 'No'
          });
        });
      }
    });


    const fields = [
      'Workout Date', 'Workout Name', 'Duration (s)', 'Total Volume',
      'Exercise Name', 'Set Number', 'Type', 'Weight', 'Reps', 'RPE', 'Is PR'
    ];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);


    res.header('Content-Type', 'text/csv');
    res.attachment(`musclo_export_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
