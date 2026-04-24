// Progress photo controller: list/upload/delete photos and stream file content.
const { ProgressPhoto } = require('../models');
const path = require('path');
const fs = require('fs');

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
        photo_url: `/api/progress-photos/${p.id}/file`
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

// Save uploaded photo metadata for the authenticated user.
exports.createPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Photo is required' });
    }

    // Persist one photo metadata row linked to uploaded file path.
    const photo = await ProgressPhoto.create({
      user_id: req.user.id,
      photo_path: req.file.path,
      pose: req.body.pose || 'other',
      measurement_id: req.body.measurement_id,
      taken_at: req.body.taken_at || new Date(),
      notes: req.body.notes
    });

    res.status(201).json({
      data: {
        ...photo.toJSON(),
        photo_url: `/api/progress-photos/${photo.id}/file`
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete one user-owned photo and remove its physical file when possible.
exports.deletePhoto = async (req, res) => {
  try {
    const photo = await ProgressPhoto.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!photo) return res.status(404).json({ message: 'Photo not found' });

    // Remove physical file first when it exists on disk.
    if (fs.existsSync(photo.photo_path)) {
      fs.unlinkSync(photo.photo_path);
    }

    await photo.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.showFile = async (req, res) => {
  try {
    const photo = await ProgressPhoto.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!photo) return res.status(404).json({ message: 'Photo not found' });

    // Resolve absolute file path from stored path or known upload/storage directories.
    const rootDir = process.cwd();
    let fullPath = path.isAbsolute(photo.photo_path) ? photo.photo_path : path.join(rootDir, photo.photo_path);
    
    // Resolves file path using known upload and storage directory patterns.
    if (!fs.existsSync(fullPath)) {
      const altPaths = [
        path.join(rootDir, 'uploads', photo.photo_path),
        path.join(rootDir, 'uploads', 'progress_photos', path.basename(photo.photo_path)),
        path.join(rootDir, 'public', 'storage', photo.photo_path),
        path.join(rootDir, 'public', 'storage', 'progress_photos', path.basename(photo.photo_path))
      ];
      
      for (const alt of altPaths) {
        if (fs.existsSync(alt)) {
          fullPath = alt;
          break;
        }
      }
    }

    // If no candidate path exists, return a clear 404 message.
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: 'Physical file not found' });
    }

    res.sendFile(fullPath);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
