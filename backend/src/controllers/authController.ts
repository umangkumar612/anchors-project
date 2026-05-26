import { Request, Response } from 'express';
import { User, UserDocument } from '../models/User.js';
import { signToken } from '../utils/jwt.js';

function userResponse(user: {
  _id: unknown;
  name: string;
  email: string;
  totalCredits: number;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
}) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    totalCredits: user.totalCredits,
    bio: user.bio || '',
    avatarUrl: user.avatarUrl || '',
    coverUrl: user.coverUrl || '',
  };
}

function authResponse(user: {
  _id: unknown;
  name: string;
  email: string;
  totalCredits: number;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
}) {
  return {
    token: signToken(String(user._id)),
    user: userResponse(user),
  };
}

export async function signup(req: Request, res: Response) {
  const { name, email, password } = req.body as { name?: string; email?: string; password?: string };

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'Email is already registered' });
  }

  const user = await User.create({ name, email, password });
  res.status(201).json(authResponse(user));
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = (await User.findOne({ email }).select('+password totalCredits name email bio avatarUrl coverUrl')) as UserDocument | null;
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json(authResponse(user));
}

export async function me(req: Request, res: Response) {
  const user = await User.findById(req.user!.id).select('name email totalCredits bio avatarUrl coverUrl');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(userResponse(user));
}

export async function updateMe(req: Request, res: Response) {
  const { name, email, bio, avatarUrl, coverUrl } = req.body as {
    name?: string;
    email?: string;
    bio?: string;
    avatarUrl?: string;
    coverUrl?: string;
  };

  const user = await User.findById(req.user!.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const nextName = name?.trim();
  const nextEmail = email?.trim().toLowerCase();

  if (!nextName || !nextEmail) {
    return res.status(400).json({ message: 'Name and email are required' });
  }

  const existing = await User.findOne({ email: nextEmail, _id: { $ne: user._id } });
  if (existing) {
    return res.status(409).json({ message: 'Email is already registered' });
  }

  user.name = nextName;
  user.email = nextEmail;
  user.bio = bio?.trim().slice(0, 280) || '';
  user.avatarUrl = avatarUrl || '';
  user.coverUrl = coverUrl || '';

  await user.save();
  res.json(userResponse(user));
}
