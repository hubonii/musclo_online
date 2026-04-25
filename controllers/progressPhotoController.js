// Progress photo controller: list/upload/delete photos using Azure Blob Storage.
const { ProgressPhoto } = require('../models');
const path = require('path');
const fs = require('fs');
const { ContainerClient } = require('@azure/storage-blob');

const AZURE_SAS_URL = process.env.AZURE_STORAGE_SAS_URL || '';

// Initialize ContainerClient if SAS URL is provided
const containerClient = AZURE_SAS_URL 
  ? new ContainerClient(AZURE_SAS_URL)
  : null;

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
    if (!containerClient) {
      return res.status(500).json({ message: 'Azure Storage SAS URL not configured' });
    }
    
    // Create a unique blob name
    const blobName = `${Date.now()}-${req.file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload buffer to Azure Blob Storage
    await blockBlobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype }
    });

    const photoUrl = blockBlobClient.url;

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

    if (containerClient && photo.photo_path.includes('.blob.core.windows.net/')) {
      // Extract blob name from URL
      // URL format: https://<account>.blob.core.windows.net/progressphotos/<blobName>
      const urlParts = photo.photo_path.split('/');
      const blobName = urlParts[urlParts.length - 1];
      
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.deleteIfExists();
    } else if (fs.existsSync(photo.photo_path)) {
      // Fallback for any old local files not yet migrated
      fs.unlinkSync(photo.photo_path);
    }

    await photo.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
