import { Router } from 'express';
import { getCreditConfigController } from '../controllers/commentController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const configRouter = Router();

configRouter.get('/credits', asyncHandler(getCreditConfigController));
