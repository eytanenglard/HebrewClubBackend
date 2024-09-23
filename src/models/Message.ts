import mongoose, { Schema, Document } from 'mongoose';
import { Message } from '../types/models';

const MessageSchema: Schema = new Schema({
    _id: { type: Schema.Types.ObjectId, auto: true },
    sender: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    recipient: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    subject: { type: String, required: true },
    content: { type: String, required: true },
    courseId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Course' 
    },
    attachments: [{ type: String }],
    isRead: { 
        type: Boolean, 
        default: false 
    }
}, {
    timestamps: true
});

MessageSchema.index({ sender: 1, recipient: 1 });

export default mongoose.model<Message & Document>('Message', MessageSchema);