// Progress photo endpoints: upload, list, delete, and serve files.
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getPhotos, createPhoto, deletePhoto, showFile } = require('../controllers/progressPhotoController');
const { protect } = require('../middleware/auth');

// Store uploads on disk and prefix filenames with a timestamp to reduce collisions.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/progress_photos/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Photo history is private per user.
router.use(protect);

// Photo CRUD + direct file view.
router.get('/', getPhotos);
// Expects multipart field name `photo` and stores metadata in ProgressPhoto table.
router.post('/', upload.single('photo'), createPhoto);
// Deletes one photo metadata row owned by current user.
router.delete('/:id', deletePhoto);
// Streams the stored file for photo id `:id` when ownership check passes.
router.get('/:id/file', showFile);

module.exports = router;


