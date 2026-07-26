import { Router } from 'express';
import passport from '../config/auth.js';

const router = Router();

router.get('/github', passport.authenticate('github'));

router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/auth/login/failed' }),
  (req, res) => {
    res.redirect('http://localhost:5173/');
  }
);

router.get('/login/success', (req, res) => {
  if (req.user) {
    return res.json({ user: req.user });
  }
  return res.status(401).json({ error: 'Not authenticated.' });
});

router.get('/login/failed', (req, res) => {
  res.status(401).json({ error: 'GitHub login failed.' });
});

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed.' });
    }
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ success: true });
    });
  });
});

export default router;
