import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

type JwtPayload = {
  id: string;
};

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    const user = await User.findById(decoded.id).select('name email');

    if (!user) {
      return res.status(401).json({ message: 'Invalid authentication token' });
    }

    req.user = {
      id: user._id.toString(),
      _id: new Types.ObjectId(user._id),
      name: user.name,
      email: user.email,
    };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid authentication token' });
  }
}
