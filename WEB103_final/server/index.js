import dotenv from 'dotenv';
import express from 'express';
import mediaRouter from './routes/media.js';
import libraryEntriesRouter from './routes/libraryEntries.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use((req, _res, next) => {
  // Development-only mock auth: allows setting a user id via header.
  if (process.env.NODE_ENV !== 'production') {
    const userIdHeader = req.header('x-user-id');
    if (userIdHeader) {
      const parsedUserId = Number.parseInt(userIdHeader, 10);
      if (Number.isInteger(parsedUserId) && parsedUserId > 0) {
        req.session = { userId: parsedUserId };
      }
    }
  }
  next();
});

app.use('/api/media', mediaRouter);
app.use('/api/library-entries', libraryEntriesRouter);

app.use((err, req, res, _next) => {
  console.error(err);
  return res.status(500).json({ error: 'Internal server error.' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;
