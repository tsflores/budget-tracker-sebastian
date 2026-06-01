import { Router, Request, Response } from 'express';
import { Types } from 'mongoose';
import { authMiddleware } from '../middleware/auth';
import Transaction from '../models/Transactions';
import UserSettings from '../models/UserSettings';
import { uid } from '../lib/utils';

const router = Router();
router.use(authMiddleware);

// POST /api/transactions
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, description, amount, category, type, isRecurring, recurringId } = req.body;

    if (!date || !description || typeof amount !== 'number' || !category || !type) {
      res.status(400).json({ message: 'date, description, amount, category, and type are required' });
      return;
    }

    if (!['income', 'expense'].includes(type)) {
      res.status(400).json({ message: 'type must be "income" or "expense"' });
      return;
    }

    const userId = uid(req);

    const transaction = await Transaction.create({
      userId,
      date,
      description,
      amount,
      category,
      type,
      isRecurring: isRecurring ?? false,
      ...(recurringId ? { recurringId: new Types.ObjectId(recurringId) } : {}),
    });

    const delta = type === 'income' ? amount : -amount;
    await UserSettings.findOneAndUpdate({ userId }, { $inc: { startingBalance: delta } });

    res.status(201).json({
      id: transaction._id.toString(),
      date: transaction.date,
      description: transaction.description,
      amount: transaction.amount,
      category: transaction.category,
      type: transaction.type,
      isRecurring: transaction.isRecurring,
      ...(transaction.recurringId ? { recurringId: transaction.recurringId.toString() } : {}),
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = uid(req);
    const id = String(req.params.id);

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid transaction ID' });
      return;
    }

    const transaction = await Transaction.findOne({ _id: id, userId });
    if (!transaction) {
      res.status(404).json({ message: 'Transaction not found' });
      return;
    }

    await transaction.deleteOne();

    const delta = transaction.type === 'income' ? -transaction.amount : transaction.amount;
    await UserSettings.findOneAndUpdate({ userId }, { $inc: { startingBalance: delta } });

    res.json({ message: 'Transaction deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
