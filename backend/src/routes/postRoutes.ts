import { Router } from 'express';
import { createComment } from '../controllers/commentController.js';
import { createPost, deletePost, getMyPosts, getPost, getPosts } from '../controllers/postController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const postRouter = Router();

postRouter.get('/', asyncHandler(getPosts));
postRouter.get('/mine', asyncHandler(requireAuth), asyncHandler(getMyPosts));
postRouter.post('/', asyncHandler(requireAuth), asyncHandler(createPost));
postRouter.get('/:id', asyncHandler(getPost));
postRouter.delete('/:id', asyncHandler(requireAuth), asyncHandler(deletePost));
postRouter.post('/:postId/comments', asyncHandler(requireAuth), asyncHandler(createComment));
