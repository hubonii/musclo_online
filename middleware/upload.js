// Centralized multer configuration for image uploads.
const multer = require('multer');

// Store files in memory to facilitate direct upload to Azure.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    // 5MB limit as requested by the user.
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    // Validate file extension against common image formats including HEIC.
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|heic|heif)$/i)) {
      return cb(new Error('Only image files (jpg, png, webp, heic) are allowed!'), false);
    }
    cb(null, true);
  }
});

module.exports = upload;
