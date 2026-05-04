// Settings controller endpoints for settings read and update operations.
const { UserSetting } = require('../models');

exports.getSettings = async (req, res) => {
  try {
    // `findOrCreate` returns one settings row with defaults when row is missing.
    const [settings] = await UserSetting.findOrCreate({
      where: { user_id: req.user.id },
      defaults: {
        unit_system: 'metric',
        theme: 'system',
        default_rest_timer_seconds: 90
      }
    });

    // Returns one settings object for the authenticated user.
    res.json({ data: settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update endpoint that writes request body fields into settings row.
exports.updateSettings = async (req, res) => {
  try {
    // Ensures a row exists before applying partial updates from request body.
    const [settings] = await UserSetting.findOrCreate({
      where: { user_id: req.user.id }
    });

    // Writes only provided keys (theme, units, timers, etc.) on the user's row.
    await settings.update(req.body);
    res.json({ data: settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
