
const { UserSetting } = require('../models');

/**
 * Retrieves the settings for the authenticated user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getSettings = async (req, res) => {
  try {

    const [settings] = await UserSetting.findOrCreate({
      where: { user_id: req.user.id },
      defaults: {
        unit_system: 'metric',
        theme: 'system',
        default_rest_timer_seconds: 90
      }
    });


    res.json({ data: settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Updates the settings for the authenticated user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.updateSettings = async (req, res) => {
  try {

    const [settings] = await UserSetting.findOrCreate({
      where: { user_id: req.user.id }
    });


    await settings.update(req.body);
    res.json({ data: settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
