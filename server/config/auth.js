import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import pool from './database.js';

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3001/auth/github/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const githubId = profile.id;
        const existing = await pool.query('SELECT id FROM users WHERE githubid = $1', [githubId]);
        if (existing.rowCount > 0) {
          const updated = await pool.query(
            `UPDATE users
             SET username = $1, avatarurl = $2, accesstoken = $3
             WHERE githubid = $4
             RETURNING id, username, avatarurl, role`,
            [profile.username, profile.photos?.[0]?.value, accessToken, githubId]
          );
          return done(null, updated.rows[0]);
        }

        const created = await pool.query(
          `INSERT INTO users (githubid, username, avatarurl, accesstoken, role)
           VALUES ($1, $2, $3, $4, 'collector')
           RETURNING id, username, avatarurl, role`,
          [githubId, profile.username, profile.photos?.[0]?.value, accessToken]
        );

        // Best-effort: a new account should start with a few tags, but a
        // seeding failure here must never block the login that created it.
        try {
          await pool.query(
            'INSERT INTO tags (user_id, name) VALUES ($1, $2), ($1, $3), ($1, $4)',
            [created.rows[0].id, 'Favorites', 'In Progress', 'Completed']
          );
        } catch (tagError) {
          console.error('Failed to seed starter tags for new user', created.rows[0].id, tagError);
        }

        return done(null, created.rows[0]);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT id, username, avatarurl, role FROM users WHERE id = $1', [id]);
    done(null, result.rows[0] || null);
  } catch (error) {
    done(error);
  }
});

export default passport;
