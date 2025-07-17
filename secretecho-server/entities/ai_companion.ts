import mongoose, { Schema, Document } from 'mongoose';
import { ChatMessage } from '../models/ai_companion';


export interface IAICompanion extends Document {
    userId: mongoose.Types.ObjectId;
    companionCode: string;
    chat: ChatMessage[];
}

const AICompanionSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    companionCode: { type: String, required: true, index: true },
    chat: [
        {
            content: { type: String, required: true },
            sender: { type: String, enum: ['user', 'companion'], required: true },
            timestamp: { type: Date, default: Date.now },
        },
    ],
});

AICompanionSchema.index({ userId: 1, companionCode: 1 }, { unique: true });

export const AICompanionModel = mongoose.model<IAICompanion>('AICompanion', AICompanionSchema);