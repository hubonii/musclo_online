/**
 * Routes for user profile, account management, and achievements.
 */
const express = require('express');
const router = express.Router();
const { 
    getProfile, updateProfile, updateAvatar, 
    getAchievements,
    requestEmailChange, verifyEmailChange, deleteAccount 
} = require('../controllers/profileController');
const { protect, verified } = require('../middleware/auth');




router.get('/me', getProfile);
router.put('/', updateProfile);
router.delete('/delete', deleteAccount);


router.post('/request-email-change', requestEmailChange);
router.post('/verify-email-change', verifyEmailChange);

const upload = require('../middleware/upload');
router.post('/avatar', upload.single('avatar'), updateAvatar);



router.get('/:userId', verified, getProfile);


router.get('/:userId/achievements', verified, getAchievements);


module.exports = router;


