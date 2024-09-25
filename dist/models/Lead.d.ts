import mongoose from 'mongoose';
import { Lead } from '../types/models';
declare const _default: mongoose.Model<Lead & mongoose.Document<unknown, any, any>, {}, {}, {}, mongoose.Document<unknown, {}, Lead & mongoose.Document<unknown, any, any>> & Lead & mongoose.Document<unknown, any, any> & Required<{
    _id: mongoose.Types.ObjectId;
}>, any>;
export default _default;
