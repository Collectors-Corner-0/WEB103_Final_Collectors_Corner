import './config/dotenv.js';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from './config/auth.js';
import mediaRouter from './routes/media.js';
import libraryEntriesRouter from './routes/libraryEntries.js';
import usersRouter from './routes/users.js';
import tagsRouter from './routes/tags.js';
import authRouter from './routes/auth.js';

const app = express();

const clientOrigin = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json());

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET must be set');
}

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/api/media', mediaRouter);
app.use('/api/library', libraryEntriesRouter);
app.use('/api/users', usersRouter);
app.use('/api/tags', tagsRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
