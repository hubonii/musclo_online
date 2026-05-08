/**
 * Passport configuration for Google OAuth strategy.
 */
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');
const bcrypt = require('bcryptjs');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "https://musclo-nodejs-production.up.railway.app/api/auth/google/callback",
    proxy: true 
  },
  async (accessToken, refreshToken, profile, done) => {
    const { id, displayName, emails, photos } = profile;
    const email = emails[0].value;

    try {

      let user = await User.findOne({ where: { google_id: id } });

      if (user) {
        return done(null, user);
      }


      user = await User.findOne({ where: { email } });
      if (user) {
        console.log(`[AUTH] Linking Google ID to existing account: ${email}`);
        user.google_id = id;
        if (!user.email_verified_at) user.email_verified_at = new Date();
        if (photos && photos[0] && !user.avatar_url) user.avatar_url = photos[0].value;
        await user.save();
        return done(null, user);
      }

      // Generate unique username from email prefix
      let username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
      let baseUsername = username;
      let isUnique = false;
      let counter = 0;

      while (!isUnique && counter < 10) {
        const checkUsername = counter === 0 ? baseUsername : `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`;
        const existing = await User.findOne({ where: { username: checkUsername } });
        if (!existing) {
          username = checkUsername;
          isUnique = true;
        }
        counter++;
      }

      const hashedPassword = await bcrypt.hash(Math.random().toString(36).slice(-10), 10);
      user = await User.create({
        name: displayName,
        email: email,
        username: username,
        password: hashedPassword,
        google_id: id,
        email_verified_at: new Date(),
        avatar_url: photos && photos[0] ? photos[0].value : null
      });

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
