
const { Measurement } = require('../models');

/**
 * Transforms a measurement model instance into the API response shape.
 * @param {Object} m - The measurement model instance.
 * @returns {Object|null} Transformed measurement data.
 */
function transformMeasurement(m) {
  if (!m) return null;
  const json = m.toJSON ? m.toJSON() : m;
  
  return {
    id: json.id,
    date: json.date,
    weight_kg: json.weight_kg,
    body_fat_percent: json.body_fat_percent,
    fat_percentage: json.body_fat_percent,
    height_cm: json.height_cm,
    chest_cm: json.chest_cm,
    waist_cm: json.waist_cm,
    left_arm_cm: json.left_arm_cm,
    right_arm_cm: json.right_arm_cm,
    left_leg_cm: json.left_leg_cm,
    right_leg_cm: json.right_leg_cm,
    calves_cm: json.calves_cm,
    shoulders_cm: json.shoulders_cm,
    neck_cm: json.neck_cm,
    notes: json.notes,
    created_at: json.created_at,
    updated_at: json.updated_at
  };
}

/**
 * Retrieves a paginated list of measurements for the authenticated user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getMeasurements = async (req, res) => {
  try {

    const limit = parseInt(req.query.per_page || 20);
    const page = parseInt(req.query.page || 1);
    const offset = (page - 1) * limit;


    const { count, rows: measurements } = await Measurement.findAndCountAll({
      where: { user_id: req.user.id },
      order: [['date', 'DESC']],
      limit,
      offset
    });

    res.json({
      data: measurements.map(m => transformMeasurement(m)),
      meta: {
        current_page: page,
        per_page: limit,
        total: count,
        last_page: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Creates a new measurement entry.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.createMeasurement = async (req, res) => {
  try {

    const measurement = await Measurement.create({
      ...req.body,
      user_id: req.user.id
    });
    res.status(201).json({ data: transformMeasurement(measurement) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Updates an existing measurement entry.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.updateMeasurement = async (req, res) => {
  try {

    const measurement = await Measurement.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!measurement) return res.status(404).json({ message: 'Measurement not found' });

    await measurement.update(req.body);
    res.json({ data: transformMeasurement(measurement) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Deletes a measurement entry.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.deleteMeasurement = async (req, res) => {
  try {

    const measurement = await Measurement.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!measurement) return res.status(404).json({ message: 'Measurement not found' });

    await measurement.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
