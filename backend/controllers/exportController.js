// Export controller: flatten workout logs and sets into a CSV download.
const { WorkoutLog, SetData, Exercise } = require('../models');
const { Parser } = require('json2csv');

exports.exportCsv = async (req, res) => {
  try {
    // Loads workout logs with nested set and exercise relations for CSV row mapping.
    const logs = await WorkoutLog.findAll({
      where: { user_id: req.user.id },
      include: [{ model: SetData, include: [Exercise] }],
      order: [['started_at', 'DESC']]
    });

    // Flatten nested workout -> set data into one row-based structure for CSV.
    const data = [];
    logs.forEach(log => {
      // Emit one placeholder row when workout has no set records.
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
        // Emit one CSV row per set to keep set-level detail in exported history.
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

    // Declares fixed CSV column order for deterministic export output.
    const fields = [
      'Workout Date', 'Workout Name', 'Duration (s)', 'Total Volume',
      'Exercise Name', 'Set Number', 'Type', 'Weight', 'Reps', 'RPE', 'Is PR'
    ];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);

    // Respond as downloadable CSV file with date-stamped filename.
    res.header('Content-Type', 'text/csv');
    res.attachment(`musclo_export_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
