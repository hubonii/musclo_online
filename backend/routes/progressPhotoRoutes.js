// Progress photo endpoints: upload, list, delete, and serve files.
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getPhotos, createPhoto, deletePhoto } = require('../controllers/progressPhotoController');
const { protect } = require('../middleware/auth');

const upload = require('../middleware/upload');

// Photo history is private per user.
router.use(protect);

// Photo CRUD.
router.get('/', getPhotos);
// Expects multipart field name `photo` and stores metadata in ProgressPhoto table.
router.post('/', upload.single('photo'), createPhoto);
// Deletes one photo metadata row owned by current user.
router.delete('/:id', deletePhoto);

module.exports = router;
