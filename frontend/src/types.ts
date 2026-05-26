export type User = {
  id: string;
  _id?: string;
  name: string;
  email: string;
  totalCredits: number;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
};

export type Author = {
  _id: string;
  name: string;
  email: string;
  totalCredits?: number;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
};

export type Post = {
  _id: string;
  title: string;
  body: string;
  imageUrl?: string;
  author: Author;
  createdAt: string;
  updatedAt: string;
};

export type Comment = {
  _id: string;
  content: string;
  author: Author;
  post: string;
  parentComment: string | null;
  depth: number;
  creditAwarded: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  replies: Comment[];
};

export type PostWithComments = Post & {
  comments: Comment[];
};

export type CreditConfig = {
  _id: string;
  baseCredit: number;
  incrementValue: number;
};
