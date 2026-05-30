import { Request } from 'express';
import { Types } from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import { RecurringFrequency } from '../models/RecurringTransactions';

export function uid(req: Request): Types.ObjectId {
  return new Types.ObjectId((req as AuthRequest).userId);
}

export function getNextDueDate(currentDate: string, frequency: RecurringFrequency): string {
  const date = new Date(currentDate);
  switch (frequency) {
    case 'weekly':    date.setDate(date.getDate() + 7);         break;
    case 'biweekly':  date.setDate(date.getDate() + 14);        break;
    case 'monthly':   date.setMonth(date.getMonth() + 1);       break;
    case 'quarterly': date.setMonth(date.getMonth() + 3);       break;
    case 'yearly':    date.setFullYear(date.getFullYear() + 1); break;
  }
  return date.toISOString().split('T')[0];
}
