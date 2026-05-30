import { Router, Request, Response } from 'express';
import { Types } from 'mongoose';
import { authMiddleware } from '../middleware/auth';
import { uid, getNextDueDate } from '../lib/utils';
import RecurringTransaction, { IRecurringTransaction } from '../models/RecurringTransactions';
import Transaction from '../models/Transactions';
import UserSettings from '../models/UserSettings';

const router = Router();
router.use(authMiddleware);

const VALID_FREQUENCIES = ['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'];


function toDto(r: IRecurringTransaction) {
  return {
    id: r._id.toString(),
    description: r.description,
    amount: r.amount,
    category: r.category,
    type: r.type,
    frequency: r.frequency,
    startDate: r.startDate,
    ...(r.endDate ? { endDate: r.endDate } : {}),
    nextDueDate: r.nextDueDate,
    isActive: r.isActive,
    ...(r.lastGenerated ? { lastGenerated: r.lastGenerated } : {}),
  };
}

// POST /api/recurring
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { description, amount, category, type, frequency, startDate, endDate } = req.body;

    if (!description || typeof amount !== 'number' || !category || !type || !frequency || !startDate) {
      res.status(400).json({ message: 'description, amount, category, type, frequency, and startDate are required' });
      return;
    }
    if (!['income', 'expense'].includes(type)) {
      res.status(400).json({ message: 'type must be "income" or "expense"' });
      return;
    }
    if (!VALID_FREQUENCIES.includes(frequency)) {
      res.status(400).json({ message: `frequency must be one of: ${VALID_FREQUENCIES.join(', ')}` });
      return;
    }

    const recurring = await RecurringTransaction.create({
      userId: uid(req),
      description,
      amount,
      category,
      type,
      frequency,
      startDate,
      ...(endDate ? { endDate } : {}),
      nextDueDate: getNextDueDate(startDate, frequency),
      isActive: true,
    });

    res.status(201).json(toDto(recurring));
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/recurring/:id
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = uid(req);
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid ID' });
      return;
    }

    const allowed = ['description', 'amount', 'category', 'type', 'frequency', 'startDate', 'endDate', 'nextDueDate', 'isActive'];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const recurring = await RecurringTransaction.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true }
    );

    if (!recurring) {
      res.status(404).json({ message: 'Recurring transaction not found' });
      return;
    }

    res.json(toDto(recurring));
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/recurring/:id
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = uid(req);
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid ID' });
      return;
    }

    const recurring = await RecurringTransaction.findOneAndDelete({ _id: id, userId });
    if (!recurring) {
      res.status(404).json({ message: 'Recurring transaction not found' });
      return;
    }

    res.json({ message: 'Recurring transaction deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/recurring/:id/toggle
router.patch('/:id/toggle', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = uid(req);
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid ID' });
      return;
    }

    const recurring = await RecurringTransaction.findOne({ _id: id, userId });
    if (!recurring) {
      res.status(404).json({ message: 'Recurring transaction not found' });
      return;
    }

    recurring.isActive = !recurring.isActive;
    await recurring.save();

    res.json(toDto(recurring));
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/recurring/:id/generate
router.post('/:id/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = uid(req);
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid ID' });
      return;
    }

    const recurring = await RecurringTransaction.findOne({ _id: id, userId });
    if (!recurring) {
      res.status(404).json({ message: 'Recurring transaction not found' });
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    const transaction = await Transaction.create({
      userId,
      date: today,
      description: recurring.description,
      amount: recurring.amount,
      category: recurring.category,
      type: recurring.type,
      isRecurring: true,
      recurringId: recurring._id,
    });

    recurring.lastGenerated = today;
    recurring.nextDueDate = getNextDueDate(recurring.nextDueDate, recurring.frequency);
    await recurring.save();

    const delta = recurring.type === 'income' ? recurring.amount : -recurring.amount;
    await UserSettings.findOneAndUpdate({ userId }, { $inc: { startingBalance: delta } });

    res.status(201).json({
      transaction: {
        id: transaction._id.toString(),
        date: transaction.date,
        description: transaction.description,
        amount: transaction.amount,
        category: transaction.category,
        type: transaction.type,
        isRecurring: transaction.isRecurring,
        recurringId: transaction.recurringId!.toString(),
      },
      recurring: toDto(recurring),
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
