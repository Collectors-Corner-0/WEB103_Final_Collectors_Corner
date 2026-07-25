export default function requireAuth(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'You must be logged in to do that.' });
  }
  return next();
}
