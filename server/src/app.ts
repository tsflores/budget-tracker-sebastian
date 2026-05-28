import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());

// Routes will be mounted here in later steps
// app.use('/api/auth', authRoutes);
// app.use('/api/settings', settingsRoutes);
// etc.

app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

export default app;
