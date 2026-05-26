import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        _id: Types.ObjectId;
        name: string;
        email: string;
      };
    }
  }
}

export {};
