import bcrypt from 'bcryptjs';
import { Schema, model, type HydratedDocument, type Model, type Types } from 'mongoose';

const BCRYPT_COST = 12;

export type IUser = {
  userName: string;
  email: string;
  password: string;
  savedRecipes: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
};

export type IUserMethods = {
  comparePassword(candidate: string): Promise<boolean>;
};

export type UserDocument = HydratedDocument<IUser, IUserMethods>;
type UserModel = Model<IUser, Record<string, never>, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    userName: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    // select:false — hash never leaves the DB unless a query asks for '+password'
    password: { type: String, required: true, select: false },
    savedRecipes: [{ type: Schema.Types.ObjectId, ref: 'Recipe' }],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Partial<IUser>): Partial<IUser> => {
        delete ret.password;
        return ret;
      },
    },
  },
);

userSchema.pre('save', async function (): Promise<void> {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, BCRYPT_COST);
});

// Requires the document to have been loaded with .select('+password')
userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IUser, UserModel>('User', userSchema);
