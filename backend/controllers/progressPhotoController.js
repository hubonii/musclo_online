
/**
 * Controller for managing user progress photos and visual tracking history.
 */
const { ProgressPhoto } = require('../models');
const azureStorageService = require('../services/azureStorageService');

/**
 * Retrieves a paginated list of progress photos for the authenticated user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getPhotos = async (req, res) => {
  try {

    const limit = parseInt(req.query.per_page || 20);
    const page = parseInt(req.query.page || 1);
    const offset = (page - 1) * limit;


    const { count, rows: photos } = await ProgressPhoto.findAndCountAll({
      where: { user_id: req.user.id },
      order: [['taken_at', 'DESC'], ['created_at', 'DESC']],
      limit,
      offset
    });

    res.json({
      data: photos.map(p => ({
        ...p.toJSON(),
        photo_url: p.photo_path
      })),
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
 * Uploads a new progress photo to storage and records metadata in the database.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.createPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Photo is required' });
    }
    

    const photoUrl = await azureStorageService.uploadToAzure(req.file);


    const photo = await ProgressPhoto.create({
      user_id: req.user.id,
      photo_path: photoUrl,
      pose: req.body.pose || 'other',
      measurement_id: req.body.measurement_id,
      taken_at: req.body.taken_at || new Date(),
      notes: req.body.notes
    });

    res.status(201).json({
      data: {
        ...photo.toJSON(),
        photo_url: photoUrl
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Deletes a progress photo from both the database and cloud storage.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.deletePhoto = async (req, res) => {
  try {
    const photo = await ProgressPhoto.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!photo) return res.status(404).json({ message: 'Photo not found' });


    await azureStorageService.deleteFromAzure(photo.photo_path);

    await photo.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
