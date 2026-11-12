import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

export const RECIPE_SOURCES = ['user', 'fridge-chef'] as const;
export type RecipeSource = (typeof RECIPE_SOURCES)[number];

export type IRecipe = {
  title: string;
  image?: string;
  cloudinaryId?: string;
  prep?: string;
  cook?: string;
  total?: string;
  serving?: string;
  ingredients: string[];
  instructions: string[];
  note?: string;
  hashtags: string[];
  source: RecipeSource;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export type RecipeDocument = HydratedDocument<IRecipe>;

const recipeSchema = new Schema<IRecipe>(
  {
    title: { type: String, required: true, trim: true },
    image: { type: String },
    cloudinaryId: { type: String },
    prep: { type: String, trim: true },
    cook: { type: String, trim: true },
    total: { type: String, trim: true },
    serving: { type: String, trim: true },
    ingredients: { type: [String], default: [] },
    instructions: { type: [String], default: [] },
    note: { type: String, trim: true },
    hashtags: { type: [String], default: [] },
    source: { type: String, enum: RECIPE_SOURCES, default: 'user' },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true },
);

export const Recipe = model<IRecipe>('Recipe', recipeSchema);
