import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUserSettings extends Document {
    userId: Types.ObjectId;
    startingBalance: number;
    isInitialized: boolean;
}

const userSettingsSchema = new Schema<IUserSettings>(
    {
        userId: {type: Schema.Types.ObjectId, ref:'User', required: true, unique: true},
        startingBalance: { type: Number, required: true, default: 0},
        isInitialized: { type: Boolean, required: true, default: false},
    },
    { timestamps: false }
);

export default mongoose.model<IUserSettings>('UserSettings', userSettingsSchema);