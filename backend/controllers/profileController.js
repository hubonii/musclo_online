/**
 * Controller for managing user profile, achievements, and account actions.
 */
const { User, WorkoutLog, Achievement, Routine, ProgressPhoto, Exercise } = require('../models');
const achievementService = require('../services/achievementService');
const azureStorageService = require('../services/azureStorageService');
const mailService = require('../services/mailService');
const bcrypt = require('bcryptjs');

/**
 * Retrieves the profile information for a user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getProfile = async (req, res) => {
  try {
    const targetUserId = (req.params.userId === 'me' || !req.params.userId) ? req.user.id : req.params.userId;
    const user = await User.findByPk(targetUserId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.is_public && req.user.id !== user.id) {
      return res.status(403).json({ message: 'This profile is private.' });
    }

    const totalWorkouts = await WorkoutLog.count({ where: { user_id: user.id } });
    const totalVolume = await WorkoutLog.sum('total_volume', { where: { user_id: user.id } }) || 0;
    const streak = await achievementService.calculateStreak(user);
    const level = calculateLevel(totalVolume);

    res.json({
      data: {
        id: user.id,
        name: user.name,
        email: req.user.id === user.id ? user.email : null,
        bio: user.bio,
        avatar_url: user.avatar_url,
        is_public: user.is_public,
        level,
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

/**
 * Updates the profile for the authenticated user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, bio, is_public } = req.body;

    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'This email is already in use by another account.' });
      }
    }

    const isEmailChanged = email && email !== req.user.email;

    await req.user.update({
      name: name || req.user.name,
      email: email || req.user.email,
      bio: bio !== undefined ? bio : req.user.bio,
      is_public: is_public !== undefined ? is_public : req.user.is_public,
      email_verified_at: isEmailChanged ? null : req.user.email_verified_at,
      verification_code: isEmailChanged ? null : req.user.verification_code
    });

    res.json({
      data: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        bio: req.user.bio,
        is_public: req.user.is_public,
        avatar_url: req.user.avatar_url,
        email_verified_at: req.user.email_verified_at
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Updates the avatar image for the authenticated user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided.' });
    }

    const avatarUrl = await azureStorageService.uploadToAzure(req.file);

    if (req.user.avatar_url && req.user.avatar_url.includes('.blob.core.windows.net/')) {
      await azureStorageService.deleteFromAzure(req.user.avatar_url);
    }

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

/**
 * Retrieves the achievement list and unlock status for a user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getAchievements = async (req, res) => {
  try {
    const targetUserId = (req.params.userId === 'me' || !req.params.userId) ? req.user.id : req.params.userId;
    const user = await User.findByPk(targetUserId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const allAchievements = await Achievement.findAll();
    const unlocked = await user.getAchievements();

    const unlockedMap = unlocked.reduce((acc, a) => {
      acc[a.id] = a.UserAchievement.unlocked_at;
      return acc;
    }, {});

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

/**
 * Retrieves the routines created by a specific user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getUserRoutines = async (req, res) => {
  try {
    const userId = (req.params.userId === 'me' || !req.params.userId) ? req.user.id : req.params.userId;
    const isOwner = req.user.id.toString() === userId.toString();
    
    const where = { user_id: userId };
    if (!isOwner) {
      where.is_public = true;
    }

    const routines = await Routine.findAll({
      where,
      include: [{
        model: Exercise,
        as: 'Exercises',
        attributes: ['id', 'name', 'muscle_group']
      }]
    });

    const transformed = routines.map(r => {
      const json = r.toJSON ? r.toJSON() : r;
      return {
        id: json.id,
        name: json.name,
        notes: json.notes,
        is_public: !!json.is_public,
        exercises_count: json.Exercises?.length || 0,
        exercises: (json.Exercises || []).map(ex => ({
          id: ex.id,
          name: ex.name,
          muscle_group: ex.muscle_group,
          pivot: ex.RoutineExercise || {}
        })),
        created_at: json.created_at,
        updated_at: json.updated_at
      };
    });

    res.json({ data: transformed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Convert lifetime volume into a tiered level + progress percentage.
 * @param {number} totalVolume - Total volume lifted in kg.
 * @returns {Object} Level details (number, title, progress).
 */
function calculateLevel(totalVolume) {
  const tiers = [
    { max: 10000, title: 'Beginner', range: [1, 5] },
    { max: 50000, title: 'Intermediate', range: [6, 10] },
    { max: 150000, title: 'Advanced', range: [11, 15] },
    { max: 500000, title: 'Elite', range: [16, 20] },
    { max: Infinity, title: 'Legend', range: [21, 25] },
  ];

  let prevMax = 0;
  for (const tier of tiers) {
    if (totalVolume < tier.max) {
      const progress = (totalVolume - prevMax) / (tier.max - prevMax);
      const levelRange = tier.range[1] - tier.range[0];
      const level = tier.range[0] + Math.floor(progress * levelRange);

      return {
        number: Math.min(level, tier.range[1]),
        title: tier.title,
        progress: Math.round(progress * 100 * 10) / 10
      };
    }
    prevMax = tier.max;
  }

  return { number: 25, title: 'Legend', progress: 100 };
}

/**
 * Initiates an email change by sending a verification code to the new address.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.requestEmailChange = async (req, res) => {
  const { newEmail } = req.body;
  if (!newEmail) return res.status(400).json({ message: 'New email is required.' });

  try {
    const existing = await User.findOne({ where: { email: newEmail } });
    if (existing) return res.status(400).json({ message: 'This email is already in use.' });

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

/**
 * Verifies the email change using the provided code.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
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
    req.user.email_verified_at = new Date();
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

/**
 * Deletes the authenticated user's account and all associated data.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.deleteAccount = async (req, res) => {
  const { password } = req.body;
  
  if (!req.user.google_id) {
    if (!password) return res.status(400).json({ message: 'Password is required to delete account.' });
    const isMatch = await bcrypt.compare(password, req.user.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect password.' });
  }

  try {
    const photos = await ProgressPhoto.findAll({ where: { user_id: req.user.id } });
    for (const p of photos) {
      await azureStorageService.deleteFromAzure(p.photo_path);
    }

    if (req.user.avatar_url && req.user.avatar_url.includes('.blob.core.windows.net/')) {
      await azureStorageService.deleteFromAzure(req.user.avatar_url);
    }

    await req.user.destroy();
    res.json({ message: 'Account and all associated data deleted permanently.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
