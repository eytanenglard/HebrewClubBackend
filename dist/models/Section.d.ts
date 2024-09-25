import mongoose, { Schema } from 'mongoose';
import { Section } from '../types/models';
declare const SectionSchema: Schema;
declare const SectionModel: mongoose.Model<Section & mongoose.Document<unknown, any, any>, {}, {}, {}, mongoose.Document<unknown, {}, Section & mongoose.Document<unknown, any, any>> & Section & mongoose.Document<unknown, any, any> & Required<{
    _id: mongoose.Types.ObjectId;
}>, any>;
export default SectionModel;
export { SectionSchema };
