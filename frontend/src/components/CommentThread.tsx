import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Comment } from '../types';
import { CommentForm } from './CommentForm';

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

type Props = {
  comments: Comment[];
  postAuthorId: string;
  onReply: (parentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
};

type CommentItemProps = Omit<Props, 'comments'> & {
  comment: Comment;
};

export function CommentThread({ comments, postAuthorId, onReply, onDelete }: Props) {
  if (!comments.length) {
    return <p className="text-sm text-slate-500">No comments yet.</p>;
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <CommentItem key={comment._id} comment={comment} postAuthorId={postAuthorId} onReply={onReply} onDelete={onDelete} />
      ))}
    </div>
  );
}

function CommentItem({ comment, postAuthorId, onReply, onDelete }: CommentItemProps) {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const canDelete = user && !comment.isDeleted && (user.id === comment.author._id || user.id === postAuthorId);
  const indent = Math.min(comment.depth - 1, 8) * 18;

  async function handleReply(content: string) {
    await onReply(comment._id, content);
    setIsReplying(false);
  }

  return (
    <div style={{ marginLeft: indent }} className="rounded-3xl border border-white/80 bg-white/90 p-4 shadow-sm shadow-slate-900/5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-400 text-xs font-black text-white">
            {comment.isDeleted ? '-' : comment.author.avatarUrl ? <img src={comment.author.avatarUrl} alt="" className="h-full w-full rounded-2xl object-cover" /> : initials(comment.author.name)}
          </div>
          <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-bold text-teal-800">{comment.isDeleted ? '[deleted]' : comment.author.name}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5">depth {comment.depth}</span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 font-bold text-amber-900">credit {comment.creditAwarded}</span>
            <span>{new Date(comment.createdAt).toLocaleString()}</span>
          </div>
          <p className={`mt-2 text-sm ${comment.isDeleted ? 'italic text-slate-500' : 'text-slate-800'}`}>
            {comment.isDeleted ? '[deleted]' : comment.content}
          </p>
          </div>
        </div>
        {comment.replies.length > 0 && (
          <button onClick={() => setCollapsed((value) => !value)} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-teal-50 hover:text-teal-800">
            {collapsed ? 'Expand' : 'Collapse'}
          </button>
        )}
      </div>
      <div className="mt-3 flex gap-3 text-xs">
        {user && !comment.isDeleted && (
          <button onClick={() => setIsReplying((value) => !value)} className="font-bold text-teal-700 hover:text-teal-900">
            Reply
          </button>
        )}
        {canDelete && (
          <button onClick={() => onDelete(comment._id)} className="font-bold text-red-700 hover:text-red-900">
            Delete
          </button>
        )}
      </div>
      {isReplying && (
        <div className="mt-3">
          <CommentForm label="Reply" onSubmit={handleReply} onCancel={() => setIsReplying(false)} />
        </div>
      )}
      {!collapsed && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem key={reply._id} comment={reply} postAuthorId={postAuthorId} onReply={onReply} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
