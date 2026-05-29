import mongoose, { Document, Schema, Types } from "mongoose";

export interface IBudgetCategory extends Document {
  userId: Types.ObjectId;
  name: string;
  allocated: number;
  color: string;
  icon: string;
}

const BudgetCategorySchema = new Schema<IBudgetCategory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    allocated: { type: Number, required: true, default: 0 },
    color: { type: String, required: true },
    icon: { type: String, required: true },
  },

  { timestamps: false },
);

export default mongoose.model<IBudgetCategory>(
  "BudgetCategory",
  BudgetCategorySchema,
);
