import mongoose, { Schema, Document } from 'mongoose';
import { Payment } from '../types/models.js';

const PaymentSchema: Schema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'], 
    default: 'pending' 
  },
  paymentMethod: { type: String, required: true },
  transactionId: { type: String, required: true }
}, {
  timestamps: true
});

export default mongoose.model<Payment & Document>('Payment', PaymentSchema);