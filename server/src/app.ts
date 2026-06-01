import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import settingsRoutes from './routes/settings';
import transactionRoutes from './routes/transactions';
import recurringRoutes from './routes/recurring';
import budgetCategoryRoutes from './routes/budgetCategories';
import historyRoutes from './routes/history';

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/budget-categories', budgetCategoryRoutes);
app.use('/api/history', historyRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

export default app;
