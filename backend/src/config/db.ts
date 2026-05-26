import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDb() {
  console.log("Mongo URI:", env.mongodbUri);

  await mongoose.connect(env.mongodbUri);

  console.log('MongoDB connected');
}