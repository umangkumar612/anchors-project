import { Types } from 'mongoose';

export type FlatComment = {
  _id: Types.ObjectId;
  content: string;
  author: unknown;
  post: Types.ObjectId;
  parentComment: Types.ObjectId | null;
  depth: number;
  creditAwarded: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ThreadedComment = FlatComment & {
  replies: ThreadedComment[];
};

export function buildCommentTree(comments: FlatComment[]) {
  const map = new Map<string, ThreadedComment>();
  const roots: ThreadedComment[] = [];

  for (const comment of comments) {
    map.set(comment._id.toString(), { ...comment, replies: [] });
  }

  for (const comment of map.values()) {
    const parentId = comment.parentComment?.toString();
    if (parentId && map.has(parentId)) {
      map.get(parentId)!.replies.push(comment);
    } else {
      roots.push(comment);
    }
  }

  return roots;
}
