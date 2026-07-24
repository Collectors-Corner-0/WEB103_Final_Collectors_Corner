import './config/dotenv.js';
import express from 'express';
import cors from 'cors';
import mediaRouter from './routes/media.js';
import libraryEntriesRouter from './routes/libraryEntries.js';
import usersRouter from './routes/users.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/media', mediaRouter);
app.use('/api/library', libraryEntriesRouter);
app.use('/api/users', usersRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
