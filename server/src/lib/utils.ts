import { Request } from 'express';
import { Types } from 'mongoose';
import { AuthRequest } from '../middleware/auth';

export function uid(req: Request): Types.ObjectId {
  return new Types.ObjectId((req as AuthRequest).userId);
}
