import mongoose, { Document, Schema, Types } from 'mongoose';

export type TransactionType = 'income' | 'expense';

export interface ITransaction extends Document {
    userId: Types.ObjectId;
    date: string;
    description: string;
    amount: number;
    category: string;
    type: TransactionType;
    isRecurring: boolean;
    recurringId?: Types.ObjectId;
}

const TransactionSchema = new Schema<ITransaction>(
    {
        userId: {type: Schema.Types.ObjectId, ref: 'User', required: true, index: true},
        date: { type: String, required: true},
        description: {type: String, required: true},
        amount: { type: Number, required: true},
        category: { type: String, required: true},
        type: { type: String, enum: ['income', 'expense'], required: true},
        isRecurring: { type: Boolean, default: false},
        recurringId: { type: Schema.Types.ObjectId, ref: 'RecurringTransaction'},
    },
    { timestamps: false}
);

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);