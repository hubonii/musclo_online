// Progress photo controller: list/upload/delete photos using Azure Blob Storage.
const { ProgressPhoto } = require('../models');
const azureStorageService = require('../services/azureStorageService');

exports.getPhotos = async (req, res) => {
  try {
    // Pagination query order: `taken_at DESC`, then `created_at DESC`.
    const limit = parseInt(req.query.per_page || 20);
    const page = parseInt(req.query.page || 1);
    const offset = (page - 1) * limit;

    // Query paginated user photos and total row count in one DB call.
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

// Save uploaded photo to Azure Blob Storage and metadata to DB
exports.createPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Photo is required' });
    }
    
    // Upload buffer to Azure Blob Storage using shared service
    const photoUrl = await azureStorageService.uploadToAzure(req.file);

    // Persist one photo metadata row linked to uploaded file path.
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

// Delete one user-owned photo from DB and Azure
exports.deletePhoto = async (req, res) => {
  try {
    const photo = await ProgressPhoto.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!photo) return res.status(404).json({ message: 'Photo not found' });

    // Use centralized service to delete from Azure
    await azureStorageService.deleteFromAzure(photo.photo_path);

    await photo.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
