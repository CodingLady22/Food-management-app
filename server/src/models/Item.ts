import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

export const ITEM_SOURCES = ['manual', 'ai'] as const;
export type ItemSource = (typeof ITEM_SOURCES)[number];

export type IItem = {
  name: string;
  quantity: number;
  unit: string;
  purchaseDate?: Date;
  expiry?: Date;
  source: ItemSource;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export type ItemDocument = HydratedDocument<IItem>;

const itemSchema = new Schema<IItem>(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, trim: true, default: '' },
    purchaseDate: { type: Date },
    expiry: { type: Date },
    source: { type: String, enum: ITEM_SOURCES, default: 'manual' },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true },
);

// Inventory sort + "expiring soon" queries
itemSchema.index({ user: 1, expiry: 1 });

export const Item = model<IItem>('Item', itemSchema);
