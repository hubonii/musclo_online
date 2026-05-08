const { User, WorkoutLog, Achievement, Routine, ProgressPhoto } = require('../models');
const achievementService = require('../services/achievementService');
const azureStorageService = require('../services/azureStorageService');
const mailService = require('../services/mailService');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res) => {
  try {
    // Allow `/me` and explicit `:userId` with one shared lookup path.
    const targetUserId = (req.params.userId === 'me' || !req.params.userId) ? req.user.id : req.params.userId;
    const user = await User.findByPk(targetUserId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Privacy guard: only owners can view their profile data.
    if (req.user.id !== user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Aggregate profile stats from workout history tables.
    const totalWorkouts = await WorkoutLog.count({ where: { user_id: user.id } });
    const totalVolume = await WorkoutLog.sum('total_volume', { where: { user_id: user.id } }) || 0;
    const streak = await achievementService.calculateStreak(user);



    res.json({
      data: {
        id: user.id,
        name: user.name,
        email: req.user.id === user.id ? user.email : null,
        bio: user.bio,
        avatar_url: user.avatar_url,

        stats: {
          total_workouts: totalWorkouts,
          total_volume: totalVolume,
          current_streak: streak
        }
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update specific fields for the authenticated user.
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, bio } = req.body;

    // Validation: if email is being changed, check uniqueness
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'This email is already in use by another account.' });
      }
    }

    const isEmailChanged = email && email !== req.user.email;

    // Only update allowed fields to prevent mass assignment vulnerabilities.
    await req.user.update({
      name: name || req.user.name,
      email: email || req.user.email,
      bio: bio !== undefined ? bio : req.user.bio,
      // Reset verification if email changed
      email_verified_at: isEmailChanged ? null : req.user.email_verified_at,
      verification_code: isEmailChanged ? null : req.user.verification_code
    });

    res.json({
      data: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        bio: req.user.bio,
        avatar_url: req.user.avatar_url,
        email_verified_at: req.user.email_verified_at
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Handle avatar upload specifically.
exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided.' });
    }

    // Upload to Azure using the centralized service
    const avatarUrl = await azureStorageService.uploadToAzure(req.file);

    // If user already had a custom avatar (and it was an Azure link), delete the old one
    if (req.user.avatar_url && req.user.avatar_url.includes('.blob.core.windows.net/')) {
      await azureStorageService.deleteFromAzure(req.user.avatar_url);
    }

    // Persist new URL to user profile
    req.user.avatar_url = avatarUrl;
    await req.user.save();

    res.json({
      data: {
        avatar_url: avatarUrl
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAchievements = async (req, res) => {
  try {
    // Supports `/me` and explicit user id targets with one resolver.
    const targetUserId = (req.params.userId === 'me' || !req.params.userId) ? req.user.id : req.params.userId;
    const user = await User.findByPk(targetUserId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const allAchievements = await Achievement.findAll();
    const unlocked = await user.getAchievements();
    // Build quick lookup map: achievement id -> unlock timestamp.
    const unlockedMap = unlocked.reduce((acc, a) => {
      acc[a.id] = a.UserAchievement.unlocked_at;
      return acc;
    }, {});

    // Merge unlocked state into the full achievement list.
    const result = allAchievements.map(a => ({
      ...a.toJSON(),
      unlocked: !!unlockedMap[a.id],
      unlocked_at: unlockedMap[a.id] || null
    }));

    res.json({ data: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};





// NEW: Request Email Change (sends code to NEW email)
exports.requestEmailChange = async (req, res) => {
  const { newEmail } = req.body;
  if (!newEmail) return res.status(400).json({ message: 'New email is required.' });

  try {
    // Check if email already taken
    const existing = await User.findOne({ where: { email: newEmail } });
    if (existing) return res.status(400).json({ message: 'This email is already in use.' });

    // Generate code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    req.user.pending_email = newEmail;
    req.user.verification_code = code;
    await req.user.save();

    await mailService.sendVerificationCode(newEmail, code);
    res.json({ message: 'Verification code sent to your new email address.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// NEW: Verify Email Change
exports.verifyEmailChange = async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ message: 'Verification code is required.' });

  try {
    if (req.user.verification_code !== code || !req.user.pending_email) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }

    req.user.email = req.user.pending_email;
    req.user.pending_email = null;
    req.user.verification_code = null;
    req.user.email_verified_at = new Date(); // MARK AS VERIFIED
    await req.user.save();

    res.json({ 
        message: 'Email updated and verified successfully.',
        data: { 
            email: req.user.email,
            email_verified_at: req.user.email_verified_at
        } 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// NEW: Delete Account (Full Wipe)
exports.deleteAccount = async (req, res) => {
  const { password } = req.body;
  
  // Google accounts don't have passwords stored here, but they should confirm via other means if needed.
  // For now, let's enforce password check for standard accounts.
  if (!req.user.google_id) {
    if (!password) return res.status(400).json({ message: 'Password is required to delete account.' });
    const isMatch = await bcrypt.compare(password, req.user.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect password.' });
  }

  try {
    // 1. Delete all progress photos from Azure
    const photos = await ProgressPhoto.findAll({ where: { user_id: req.user.id } });
    for (const p of photos) {
      await azureStorageService.deleteFromAzure(p.photo_path);
    }

    // 2. Delete avatar from Azure
    if (req.user.avatar_url && req.user.avatar_url.includes('.blob.core.windows.net/')) {
      await azureStorageService.deleteFromAzure(req.user.avatar_url);
    }

    // 3. Delete user record (Cascade will handle WorkoutLogs, Routines, DB entries)
    await req.user.destroy();

    res.json({ message: 'Account and all associated data deleted permanently.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
