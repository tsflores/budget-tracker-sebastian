import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import UserSettings from '../models/UserSettings';
import BudgetCategory from '../models/BudgetCategory';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { DEFAULT_CATEGORIES } from '../lib/defaults';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      res.status(409).json({ message: 'Email already in use' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, passwordHash });

    await UserSettings.create({ userId: user._id, startingBalance: 0, isInitialized: false });
    await BudgetCategory.insertMany(
      DEFAULT_CATEGORIES.map((cat) => ({ ...cat, userId: user._id }))
    );

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user: { id: user._id.toString(), email: user.email } });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user._id.toString(), email: user.email } });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById((req as AuthRequest).userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({ id: user._id.toString(), email: user.email });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
