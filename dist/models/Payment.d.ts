import mongoose from 'mongoose';
import { Payment } from '../types/models';
declare const _default: mongoose.Model<Payment & mongoose.Document<unknown, any, any>, {}, {}, {}, mongoose.Document<unknown, {}, Payment & mongoose.Document<unknown, any, any>> & Payment & mongoose.Document<unknown, any, any> & Required<{
    _id: mongoose.Types.ObjectId;
}>, any>;
export default _default;
