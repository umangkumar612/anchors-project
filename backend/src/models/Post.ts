import mongoose, { InferSchemaType, Schema } from 'mongoose';

const postSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    body: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: '' },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

postSchema.index({ createdAt: -1 });

export type PostAttrs = InferSchemaType<typeof postSchema>;
export const Post = mongoose.model<PostAttrs>('Post', postSchema);
