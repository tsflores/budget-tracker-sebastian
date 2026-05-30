import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { uid } from '../lib/utils';
import MonthlySnapshot, { IMonthlySnapshot } from '../models/MonthlySnapshot';

const router = Router();
router.use(authMiddleware);

function toDto(s: IMonthlySnapshot) {
  return {
    key: s.key,
    month: s.month,
    year: s.year,
    income: s.income,
    expenses: s.expenses,
    balance: s.balance,
    savingsRate: s.savingsRate,
    categoryBreakdowns: s.categoryBreakdowns,
    transactionCount: s.transactionCount,
    createdAt: s.createdAt,
  };
}

// GET /api/history/snapshots
router.get('/snapshots', async (req: Request, res: Response): Promise<void> => {
  try {
    const snapshots = await MonthlySnapshot.find({ userId: uid(req) })
      .sort({ year: -1, month: -1 })
      .lean();

    res.json(snapshots.map((s) => ({ ...toDto(s as unknown as IMonthlySnapshot) })));
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/history/snapshots
router.post('/snapshots', async (req: Request, res:Response): Promise<void> => {
  try {
    const userId = uid(req);
    const {
      key, month, year, income, expenses, balance,
      savingsRate, categoryBreakdowns, transactionCount,
    } = req.body;

    if (
      !key ||
      typeof month !== 'number' ||
      typeof year !== 'number' ||
      typeof income !== 'number' ||
      typeof expenses !== 'number' ||
      typeof balance !== 'number' ||
      typeof savingsRate !== 'number' ||
      !Array.isArray(categoryBreakdowns) ||
      typeof transactionCount !== 'number'
    ) {
      res.status(400).json({ message: 'All snapshot fields are required' });
      return;
    }

    const snapshot = await MonthlySnapshot.findOneAndUpdate(
      { userId, key },
      { $set: { month, year, income, expenses, balance, savingsRate, categoryBreakdowns, transactionCount } },
      { upsert: true, new: true }
    );

    res.status(201).json(toDto(snapshot!));
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
