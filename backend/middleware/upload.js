
/**
 * Middleware for handling file uploads using multer.
 */
const multer = require('multer');


const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {

    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {

    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|heic|heif)$/i)) {
      return cb(new Error('Only image files (jpg, png, webp, heic) are allowed!'), false);
    }
    cb(null, true);
  }
});

/**
 * Multer middleware for handling image uploads.
 * Configured for memory storage with a 5MB limit and format validation.
 */
module.exports = upload;
