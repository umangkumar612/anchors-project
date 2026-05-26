import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Post } from '../models/Post.js';
import { Comment } from '../models/Comment.js';
import { User } from '../models/User.js';
import { buildCommentTree, FlatComment } from '../utils/comments.js';

export async function createPost(req: Request, res: Response) {
  const { title, body, imageUrl } = req.body as { title?: string; body?: string; imageUrl?: string };

  if (!title || !body) {
    return res.status(400).json({ message: 'Title and body are required' });
  }

  const post = await Post.create({
    title,
    body,
    imageUrl: imageUrl || '',
    author: req.user!._id,
  });

  const populated = await post.populate('author', 'name email totalCredits bio avatarUrl');
  res.status(201).json(populated);
}

export async function getPosts(_req: Request, res: Response) {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate('author', 'name email totalCredits bio avatarUrl')
    .lean();

  res.json(posts);
}

export async function getPost(req: Request, res: Response) {
  const postId = String(req.params.id);

  if (!Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: 'Invalid post id' });
  }

  const post = await Post.findById(postId).populate('author', 'name email totalCredits bio avatarUrl').lean();
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  const comments = await Comment.find({ post: post._id })
    .sort({ createdAt: 1 })
    .populate('author', 'name email avatarUrl')
    .lean<FlatComment[]>();

  res.json({
    ...post,
    comments: buildCommentTree(comments),
  });
}

export async function getMyPosts(req: Request, res: Response) {
  const posts = await Post.find({ author: req.user!._id })
    .sort({ createdAt: -1 })
    .populate('author', 'name email totalCredits bio avatarUrl')
    .lean();

  res.json(posts);
}

export async function deletePost(req: Request, res: Response) {
  const postId = String(req.params.id);

  if (!Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: 'Invalid post id' });
  }

  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  if (post.author.toString() !== req.user!.id) {
    return res.status(403).json({ message: 'You can only delete your own posts' });
  }

  const comments = await Comment.find({ post: post._id, isDeleted: false }).select('creditAwarded');
  const creditsToRemove = comments.reduce((total, comment) => total + comment.creditAwarded, 0);

  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();

  if (creditsToRemove > 0) {
    const user = await User.findById(post.author);
    if (user) {
      user.totalCredits = Math.max(0, user.totalCredits - creditsToRemove);
      await user.save();
    }
  }

  res.json({ message: 'Post deleted' });
}
