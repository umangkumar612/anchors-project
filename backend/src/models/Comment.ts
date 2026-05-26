import mongoose, { InferSchemaType, Schema } from 'mongoose';

const commentSchema = new Schema(
  {
    content: { type: String, required: true, trim: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    parentComment: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
    depth: { type: Number, required: true, min: 1 },
    creditAwarded: { type: Number, required: true, min: 0 },
    isDeleted: { type: Boolean, required: true, default: false },
  },
  { timestamps: true },
);

commentSchema.index({ post: 1, createdAt: 1 });
commentSchema.index({ parentComment: 1 });

export type CommentAttrs = InferSchemaType<typeof commentSchema>;
export const Comment = mongoose.model<CommentAttrs>('Comment', commentSchema);
