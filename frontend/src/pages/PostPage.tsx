import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CommentForm } from '../components/CommentForm';
import { CommentThread } from '../components/CommentThread';
import { useAuth } from '../context/AuthContext';
import { api, getErrorMessage } from '../services/api';
import { PostWithComments } from '../types';

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function PostPage() {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostWithComments | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  async function loadPost() {
    const { data } = await api.get<PostWithComments>(`/posts/${id}`);
    setPost(data);
  }

  useEffect(() => {
    loadPost()
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    if (!post || !window.location.hash) {
      return;
    }

    const target = document.querySelector(window.location.hash);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [post]);

  async function addComment(content: string, parentComment?: string) {
    if (!user) {
      navigate('/login');
      return;
    }

    await api.post(`/posts/${id}/comments`, { content, parentComment });
    await loadPost();
    await refreshUser();
  }

  async function deleteComment(commentId: string) {
    await api.delete(`/comments/${commentId}`);
    await loadPost();
    await refreshUser();
  }

  async function deletePost() {
    if (!post || !window.confirm('Delete this post from the platform?')) {
      return;
    }

    await api.delete(`/posts/${post._id}`);
    await refreshUser();
    navigate('/dashboard');
  }

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading post...</p>;
  }

  if (error || !post) {
    return <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error || 'Post not found'}</p>;
  }

  return (
    <div className="space-y-6">
      <Link to="/" className="inline-flex rounded-lg bg-white/70 px-3 py-2 text-sm font-bold text-slate-700 shadow-sm hover:text-teal-800">
        Back to feed
      </Link>
      <article className="overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-xl shadow-slate-900/5">
        <div className="h-24 bg-gradient-to-r from-teal-500 via-cyan-400 to-pink-400" />
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="-mt-12 grid h-20 w-20 shrink-0 place-items-center rounded-3xl border-4 border-white bg-slate-950 text-xl font-black text-white shadow-xl">
              {post.author.avatarUrl ? <img src={post.author.avatarUrl} alt="" className="h-full w-full object-cover" /> : initials(post.author.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-black text-slate-950">{post.author.name}</span>
                <span>{new Date(post.createdAt).toLocaleString()}</span>
                {typeof post.author.totalCredits === 'number' && <span className="rounded-full bg-amber-100 px-2.5 py-1 font-bold text-amber-900">{post.author.totalCredits} credits</span>}
              </div>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">{post.title}</h1>
            </div>
          </div>
          <p className="mt-5 whitespace-pre-wrap leading-7 text-slate-800">{post.body}</p>
          {post.imageUrl && (
            <div className="mt-5 overflow-hidden rounded-3xl border border-slate-100 bg-slate-100">
              <img src={post.imageUrl} alt={post.title} className="max-h-[720px] w-full object-contain" />
            </div>
          )}
          {user?.id === post.author._id && (
            <button onClick={deletePost} className="mt-5 rounded-xl bg-red-50 px-4 py-2 text-xs font-black text-red-700 hover:bg-red-100">
              Delete post
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 border-t border-slate-100 bg-slate-50/70 text-sm font-bold text-slate-600">
          <a href="#comment-composer" className="px-4 py-3 text-center text-teal-800 hover:bg-teal-50">Reply</a>
          <a href="#comments" className="px-4 py-3 text-center text-pink-700 hover:bg-pink-50">Discuss</a>
          <a href="#credit-info" className="px-4 py-3 text-center text-amber-700 hover:bg-amber-50">Credit</a>
        </div>
      </article>
      <section id="credit-info" className="rounded-2xl border border-amber-200 bg-amber-50/90 p-5 shadow-sm scroll-mt-24">
        <h2 className="font-bold text-amber-950">Credit info</h2>
        <p className="mt-2 text-sm leading-6 text-amber-900">
          Comments on this post add credits to {post.author.name}. Nested replies earn more because deeper conversations have higher credit value.
        </p>
      </section>
      <section id="comment-composer" className="rounded-2xl border border-white/80 bg-white/85 p-5 shadow-sm scroll-mt-24">
        <h2 className="font-bold">Add a comment</h2>
        <div className="mt-3">
          {user ? (
            <CommentForm onSubmit={(content) => addComment(content)} />
          ) : (
            <p className="text-sm text-slate-600">
              <Link to="/login" className="font-medium text-slate-950">
                Login
              </Link>{' '}
              to comment.
            </p>
          )}
        </div>
      </section>
      <section id="comments" className="space-y-3 scroll-mt-24">
        <h2 className="font-bold">Comments</h2>
        <CommentThread
          comments={post.comments}
          postAuthorId={post.author._id}
          onReply={(parentId, content) => addComment(content, parentId)}
          onDelete={deleteComment}
        />
      </section>
    </div>
  );
}
