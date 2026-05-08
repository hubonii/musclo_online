/**
 * Routes for uploading and managing progress photos.
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getPhotos, createPhoto, deletePhoto } = require('../controllers/progressPhotoController');
const { protect } = require('../middleware/auth');

const upload = require('../middleware/upload');


router.use(protect);


router.get('/', getPhotos);

router.post('/', upload.single('photo'), createPhoto);

router.delete('/:id', deletePhoto);

module.exports = router;
