import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import mediaRouter from './routes/media.js';
import libraryEntriesRouter from './routes/libraryEntries.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  })
);

app.use('/api/media', mediaRouter);
app.use('/api/library-entries', libraryEntriesRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;
