import { Router, Request, Response } from 'express';
import { Types } from 'mongoose';
import { authMiddleware } from '../middleware/auth';
import { uid } from '../lib/utils';
import BudgetCategory, { IBudgetCategory } from '../models/BudgetCategory';
import Transaction from '../models/Transactions';
import RecurringTransaction from '../models/RecurringTransactions';

const router = Router();
router.use(authMiddleware);

function toDto(c: IBudgetCategory) {
  return {
    id: c._id.toString(),
    name: c.name,
    allocated: c.allocated,
    color: c.color,
    icon: c.icon,
  };
}

// GET /api/budget-categories
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await BudgetCategory.find({ userId: uid(req) }).lean();
    res.json(
      categories.map((c) => ({
        id: c._id.toString(),
        name: c.name,
        allocated: c.allocated,
        color: c.color,
        icon: c.icon,
      }))
    );
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/budget-categories
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, allocated, color, icon } = req.body;

    if (!name || !color || !icon) {
      res.status(400).json({ message: 'name, color, and icon are required' });
      return;
    }

    const category = await BudgetCategory.create({
      userId: uid(req),
      name,
      allocated: allocated ?? 0,
      color,
      icon,
    });

    res.status(201).json(toDto(category));
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/budget-categories/:id
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = uid(req);
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid ID' });
      return;
    }

    const existing = await BudgetCategory.findOne({ _id: id, userId });
    if (!existing) {
      res.status(404).json({ message: 'Budget category not found' });
      return;
    }

    const { name, allocated, color, icon } = req.body;
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (allocated !== undefined) updates.allocated = allocated;
    if (color !== undefined) updates.color = color;
    if (icon !== undefined) updates.icon = icon;

    if (name && name !== existing.name) {
      await Promise.all([
        Transaction.updateMany({ userId, category: existing.name }, { category: name }),
        RecurringTransaction.updateMany({ userId, category: existing.name }, { category: name }),
      ]);
    }

    const updated = await BudgetCategory.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true }
    );

    res.json(toDto(updated!));
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/budget-categories/:id
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = uid(req);
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid ID' });
      return;
    }

    const category = await BudgetCategory.findOneAndDelete({ _id: id, userId });
    if (!category) {
      res.status(404).json({ message: 'Budget category not found' });
      return;
    }

    res.json({ message: 'Budget category deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
