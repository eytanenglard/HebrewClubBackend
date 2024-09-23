import mongoose, { Schema, Document } from 'mongoose';

export interface IBookmark extends Document {
  time: number;
  label: string;
  lesson: mongoose.Types.ObjectId;
}

const BookmarkSchema: Schema = new Schema({
  time: { type: Number, required: true },
  label: { type: String, required: true },
  lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true }
});

export default mongoose.model<IBookmark>('Bookmark', BookmarkSchema);