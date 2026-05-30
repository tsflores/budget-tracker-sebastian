import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import UserSettings from "../models/UserSettings";
import Transaction from "../models/Transactions";
import RecurringTransactions from "../models/RecurringTransactions";
import BudgetCategory from "../models/BudgetCategory";
import MonthlySnapshot from "../models/MonthlySnapshot";
import { uid } from "../lib/utils";
import { DEFAULT_CATEGORIES } from "../lib/defaults";


const router = Router();
router.use(authMiddleware);

//Post /api/settings/initialize
router.post(
  "/initialize",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { startingBalance } = req.body;
      if (typeof startingBalance !== "number") {
        res.status(400).json({ message: "startingBalance must be a number" });
        return;
      }

      const settings = await UserSettings.findOneAndUpdate(
        { userId: uid(req) },
        { startingBalance, isInitialized: true },
        { new: true },
      );

      if (!settings) {
        res.status(404).json({ message: "Settings not found" });
        return;
      }

      res.json({
        startingBalance: settings.startingBalance,
        isInitialized: settings.isInitialized,
      });
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  },
);

//PUT /api/settings/balance
router.put("/balance", async (req: Request, res: Response): Promise<void> => {
  try {
    const { startingBalance } = req.body;
    if (typeof startingBalance !== "number") {
      res.status(400).json({ message: "startingBalance must be a number" });
      return;
    }

    const settings = await UserSettings.findOneAndUpdate(
      { userId: uid(req) },
      { startingBalance },
      { new: true },
    );

    if (!settings) {
      res.status(404).json({ message: "Settings not found" });
      return;
    }

    res.json({ startingBalance: settings.startingBalance });
    
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

//DELETE /api/settings/reset
router.delete("/reset", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = uid(req);

    await Promise.all([
      Transaction.deleteMany({ userId }),
      RecurringTransactions.deleteMany({ userId }),
      BudgetCategory.deleteMany({ userId }),
      MonthlySnapshot.deleteMany({ userId }),
    ]);

    await UserSettings.findOneAndUpdate(
      { userId },
      { startingBalance: 0, isInitialized: false },
    );

    await BudgetCategory.insertMany(
      DEFAULT_CATEGORIES.map((cat) => ({ ...cat, userId })),
    );

    res.json({ message: "Reset successful" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/settings/state
router.get('/state', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = uid(req);

    const [settings, transactions, recurringTransactions, budgetCategories] = await Promise.all([
      UserSettings.findOne({ userId }).lean(),
      Transaction.find({ userId }).lean(),
      RecurringTransactions.find({ userId }).lean(),
      BudgetCategory.find({ userId }).lean(),
    ]);

    if (!settings) {
      res.status(404).json({ message: 'Settings not found' });
      return;
    }

    res.json({
      settings: {
        startingBalance: settings.startingBalance,
        isInitialized: settings.isInitialized,
      },
      transactions: transactions.map((t) => ({
        id: t._id.toString(),
        date: t.date,
        description: t.description,
        amount: t.amount,
        category: t.category,
        type: t.type,
        isRecurring: t.isRecurring,
        ...(t.recurringId ? { recurringId: t.recurringId.toString() } : {}),
      })),
      recurringTransactions: recurringTransactions.map((r) => ({
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
      })),
      budgetCategories: budgetCategories.map((c) => ({
        id: c._id.toString(),
        name: c.name,
        allocated: c.allocated,
        color: c.color,
        icon: c.icon,
      })),
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;