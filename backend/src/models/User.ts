import mongoose, { HydratedDocument, InferSchemaType, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    bio: { type: String, default: '', trim: true, maxlength: 280 },
    avatarUrl: { type: String, default: '' },
    coverUrl: { type: String, default: '' },
    totalCredits: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true },
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export type UserAttrs = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<UserAttrs> & {
  comparePassword(candidate: string): Promise<boolean>;
};

export const User = mongoose.model<UserAttrs>('User', userSchema);
