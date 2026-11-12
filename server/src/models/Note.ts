import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

export type INote = {
  title: string;
  body: string;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export type NoteDocument = HydratedDocument<INote>;

const noteSchema = new Schema<INote>(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true },
);

export const Note = model<INote>('Note', noteSchema);
