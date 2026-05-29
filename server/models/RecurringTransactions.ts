import mongoose, { Document, Schema, Types } from "mongoose";
import { TransactionType } from "./Transactions";

export type RecurringFrequency =
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly"
  | "yearly";

export interface IRecurringTransaction extends Document {
  userId: Types.ObjectId;
  description: string;
  amount: number;
  category: string;
  type: TransactionType;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
  nextDueDate: string;
  isActive: boolean;
  lastGenerated?: string;
}

const RecurringTransactionSchema = new Schema<IRecurringTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    frequency: {
      type: String,
      enum: ["weekly", "biweekly", "monthly", "quarterly", "yearly"],
      required: true,
    },
    startDate: { type: String, required: true },
    endDate: { type: String },
    nextDueDate: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    lastGenerated: { type: String },
  },
  { timestamps: false },
);

export default mongoose.model<IRecurringTransaction>(
  "RecurringTransaction",
  RecurringTransactionSchema,
);
