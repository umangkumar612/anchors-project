import { Router } from 'express';
import { login, me, signup, updateMe } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authRouter = Router();

authRouter.post('/signup', asyncHandler(signup));
authRouter.post('/login', asyncHandler(login));
authRouter.get('/me', asyncHandler(requireAuth), asyncHandler(me));
authRouter.put('/me', asyncHandler(requireAuth), asyncHandler(updateMe));
