import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Comment } from '../models/Comment.js';
import { CreditConfig } from '../models/CreditConfig.js';
import { Post } from '../models/Post.js';
import { User } from '../models/User.js';

async function getCreditConfig() {
  let config = await CreditConfig.findOne().sort({ createdAt: -1 });
  if (!config) {
    config = await CreditConfig.create({ baseCredit: 1, incrementValue: 2 });
  }

  return config;
}

export async function createComment(req: Request, res: Response) {
  const { content, parentComment } = req.body as { content?: string; parentComment?: string | null };
  const postId = String(req.params.postId);

  if (!content) {
    return res.status(400).json({ message: 'Content is required' });
  }

  if (!Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: 'Invalid post id' });
  }

  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  let depth = 1;
  let parentId: Types.ObjectId | null = null;

  if (parentComment) {
    if (!Types.ObjectId.isValid(parentComment)) {
      return res.status(400).json({ message: 'Invalid parent comment id' });
    }

    const parent = await Comment.findOne({ _id: parentComment, post: post._id });
    if (!parent) {
      return res.status(404).json({ message: 'Parent comment not found' });
    }

    parentId = parent._id;
    depth = parent.depth + 1;
  }

  const config = await getCreditConfig();
  const creditAwarded = config.baseCredit + (depth - 1) * config.incrementValue;

  const comment = await Comment.create({
    content,
    author: req.user!._id,
    post: post._id,
    parentComment: parentId,
    depth,
    creditAwarded,
  });

  await User.findByIdAndUpdate(post.author, { $inc: { totalCredits: creditAwarded } });

  const populated = await comment.populate('author', 'name email avatarUrl');
  res.status(201).json(populated);
}

export async function deleteComment(req: Request, res: Response) {
  const commentId = String(req.params.id);

  if (!Types.ObjectId.isValid(commentId)) {
    return res.status(400).json({ message: 'Invalid comment id' });
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return res.status(404).json({ message: 'Comment not found' });
  }

  const post = await Post.findById(comment.post);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  const requesterId = req.user!._id.toString();
  const isCommentAuthor = comment.author.toString() === requesterId;
  const isPostAuthor = post.author.toString() === requesterId;

  if (!isCommentAuthor && !isPostAuthor) {
    return res.status(403).json({ message: 'You can only delete your comments or comments on your posts' });
  }

  if (comment.isDeleted) {
    return res.json({ message: 'Comment already deleted', comment });
  }

  comment.isDeleted = true;
  comment.content = '[deleted]';
  await comment.save();
  await User.findByIdAndUpdate(post.author, { $inc: { totalCredits: -comment.creditAwarded } });

  res.json({ message: 'Comment deleted', comment });
}

export async function getCreditConfigController(_req: Request, res: Response) {
  const config = await getCreditConfig();
  res.json(config);
}
