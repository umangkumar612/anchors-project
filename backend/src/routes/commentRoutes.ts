import { Router } from 'express';
import { deleteComment } from '../controllers/commentController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const commentRouter = Router();

commentRouter.delete('/:id', asyncHandler(requireAuth), asyncHandler(deleteComment));
