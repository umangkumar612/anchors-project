import mongoose, { InferSchemaType, Schema } from 'mongoose';

const creditConfigSchema = new Schema(
  {
    baseCredit: { type: Number, required: true, min: 0, default: 1 },
    incrementValue: { type: Number, required: true, min: 0, default: 2 },
  },
  { timestamps: true },
);

export type CreditConfigAttrs = InferSchemaType<typeof creditConfigSchema>;
export const CreditConfig = mongoose.model<CreditConfigAttrs>('CreditConfig', creditConfigSchema);
