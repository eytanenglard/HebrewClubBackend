import mongoose, { Schema, Document } from 'mongoose';
import { Lead } from '../types/models.js';

const LeadSchema: Schema = new Schema({
    _id: { type: Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    courseInterest: [{ type: Schema.Types.ObjectId, ref: 'Course' }], // Changed to an array of ObjectIds
    status: { 
        type: String, 
        enum: ['new', 'contacted', 'qualified', 'lost'],
        default: 'new'
    },
    notes: { type: String },
    paymentOption: { type: String, enum: ['full', 'installments'] }, // Added this field
    promoCode: { type: String } // Added this field
}, {
    timestamps: true
});

LeadSchema.index({ email: 1, phone: 1 });

export default mongoose.model<Lead & Document>('Lead', LeadSchema);