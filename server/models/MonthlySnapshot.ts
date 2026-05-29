import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICategoryBreakdown {
    category: string;
    allocated: number;
    spent: number;
    color: string;
    icon: string;
}

export interface IMonthlySnapshot extends Document {
    userId: Types.ObjectId;
    key: string;
    month: number;
    year: number;
    income: number;
    expenses: number;
    balance: number;
    savingsRate: number;
    categoryBreakdowns: ICategoryBreakdown[];
    transactionCount: number;
    createdAt: Date;
}

const CategoryBreakdownSchema = new Schema<ICategoryBreakdown>(
    {
        category: { type: String, required: true},
        allocated: { type: Number, required: true},
        spent: { type: Number, required: true },
        color: { type: String, required: true},
        icon: {type: String, required: true},
    },
    { _id: false }
);

const MonthlySnapshotSchema = new Schema<IMonthlySnapshot>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        key: { type: String, required: true },
        month: { type: Number, required: true },
        year: {type: Number, required: true },
        income: { type: Number, required: true },
        expenses: { type: Number, required: true },
        balance: { type: Number, required: true },
        savingsRate: { type: Number, required: true },
        categoryBreakdowns: { type: [CategoryBreakdownSchema], default: []},
        transactionCount: {type: Number, required: true},
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

MonthlySnapshotSchema.index({ userId: 1, key: 1}, { unique: true });

export default mongoose.model<IMonthlySnapshot>('MonthlySnapshot', MonthlySnapshotSchema);