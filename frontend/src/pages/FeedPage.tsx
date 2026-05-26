import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CommentForm } from '../components/CommentForm';
import { CommentThread } from '../components/CommentThread';
import { PostForm } from '../components/PostForm';
import { useAuth } from '../context/AuthContext';
import { api, getErrorMessage } from '../services/api';
import { CreditConfig, Post, PostWithComments } from '../types';

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function FeedPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [postDetails, setPostDetails] = useState<Record<string, PostWithComments>>({});
  const [activePanel, setActivePanel] = useState<Record<string, 'comment' | 'discuss' | 'credit' | null>>({});
  const [config, setConfig] = useState<CreditConfig | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  async function loadFeed() {
    const [{ data: postData }, { data: configData }] = await Promise.all([
      api.get<Post[]>('/posts'),
      api.get<CreditConfig>('/config/credits'),
    ]);
    setPosts(postData);
    setConfig(configData);
  }

  useEffect(() => {
    loadFeed()
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, []);

  async function createPost(payload: { title: string; body: string; imageUrl: string }) {
    if (!user) {
      navigate('/login');
      return;
    }

    await api.post('/posts', payload);
    await loadFeed();
  }

  async function loadPostDetails(postId: string) {
    const { data } = await api.get<PostWithComments>(`/posts/${postId}`);
    setPostDetails((current) => ({ ...current, [postId]: data }));
    return data;
  }

  async function openPanel(postId: string, panel: 'comment' | 'discuss' | 'credit') {
    setActivePanel((current) => ({
      ...current,
      [postId]: current[postId] === panel ? null : panel,
    }));

    if ((panel === 'comment' || panel === 'discuss') && !postDetails[postId]) {
      await loadPostDetails(postId);
    }
  }

  async function addComment(postId: string, content: string, parentComment?: string) {
    if (!user) {
      setActivePanel((current) => ({ ...current, [postId]: 'comment' }));
      return;
    }

    await api.post(`/posts/${postId}/comments`, { content, parentComment });
    await loadPostDetails(postId);
    await loadFeed();
    await refreshUser();
    setActivePanel((current) => ({ ...current, [postId]: 'discuss' }));
  }

  async function deleteComment(postId: string, commentId: string) {
    await api.delete(`/comments/${commentId}`);
    await loadPostDetails(postId);
    await loadFeed();
    await refreshUser();
  }

  async function deletePost(postId: string) {
    if (!window.confirm('Delete this post from the platform?')) {
      return;
    }

    await api.delete(`/posts/${postId}`);
    await loadFeed();
    await refreshUser();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[230px_1fr_330px]">
      <aside className="hidden space-y-4 lg:block">
        <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/85 shadow-xl shadow-slate-900/5">
          <div className="h-20 bg-gradient-to-br from-teal-500 via-cyan-400 to-pink-400" />
          <div className="px-5 pb-5">
            <div className="-mt-8 grid h-16 w-16 place-items-center rounded-2xl border-4 border-white bg-slate-950 text-xl font-black text-white shadow-lg">
              {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full rounded-2xl object-cover" /> : user ? initials(user.name) : 'A'}
            </div>
            <h2 className="mt-3 font-black">{user ? user.name : 'Guest Reader'}</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">{user ? user.bio || `${user.totalCredits} total credits` : 'Login to join conversations'}</p>
          </div>
        </div>
        <div className="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm">
          <h3 className="text-sm font-black">Explore</h3>
          <div className="mt-3 space-y-2 text-sm">
            <Link to="/" className="block rounded-2xl bg-teal-50 px-3 py-2 font-bold text-teal-800">Home Feed</Link>
            <Link to="/dashboard" className="block rounded-2xl px-3 py-2 font-bold text-slate-700 hover:bg-pink-50 hover:text-pink-800">Dashboard</Link>
          </div>
        </div>
      </aside>
      <section className="space-y-4">
        <div className="overflow-hidden rounded-3xl border border-white/70 bg-slate-950 text-white shadow-2xl shadow-slate-900/15">
          <div className="bg-gradient-to-br from-slate-950 via-teal-950 to-pink-950 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200">Live social forum</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">Newest discussions</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">Share an idea, reply in threads, and earn credit when your post starts a real conversation.</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-full bg-white/15 px-3 py-1.5">{posts.length} posts</span>
              <Link to="/dashboard" className="rounded-full bg-teal-400 px-3 py-1.5 text-slate-950 hover:bg-teal-300">My profile</Link>
              <a href="#feed" className="rounded-full bg-pink-400 px-3 py-1.5 text-slate-950 hover:bg-pink-300">Browse posts</a>
            </div>
          </div>
        </div>
        <PostForm onSubmit={createPost} currentUserName={user?.name} currentUserAvatar={user?.avatarUrl} />
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading posts...</p>
        ) : (
          <div id="feed" className="space-y-3">
            {posts.map((post) => (
              <article key={post._id} className="group overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-sm shadow-slate-900/5 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-2xl hover:shadow-teal-900/10">
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-400 text-sm font-black text-white shadow-lg shadow-teal-600/20">
                      {post.author.avatarUrl ? <img src={post.author.avatarUrl} alt="" className="h-full w-full rounded-2xl object-cover" /> : initials(post.author.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-slate-950">{post.author.name}</span>
                        <span className="text-xs text-slate-400">posted</span>
                        <span className="text-xs text-slate-400">{new Date(post.createdAt).toLocaleString()}</span>
                      </div>
                      <Link to={`/posts/${post._id}`} className="mt-2 block text-2xl font-black tracking-tight text-slate-950 group-hover:text-teal-800">
                        {post.title}
                      </Link>
                      <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-700">{post.body}</p>
                    </div>
                  </div>
                  {post.imageUrl && (
                    <Link to={`/posts/${post._id}`} className="mt-4 block overflow-hidden rounded-3xl border border-slate-100 bg-slate-100">
                      <img src={post.imageUrl} alt={post.title} className="max-h-[520px] w-full object-contain transition duration-300 group-hover:scale-[1.01]" />
                    </Link>
                  )}
                </div>
                <div className="grid grid-cols-3 border-t border-slate-100 bg-slate-50/70 text-sm font-bold text-slate-600">
                  <button type="button" onClick={() => openPanel(post._id, 'comment')} className="px-4 py-3 text-center hover:bg-teal-50 hover:text-teal-800">
                    Comment
                  </button>
                  <button type="button" onClick={() => openPanel(post._id, 'discuss')} className="px-4 py-3 text-center text-pink-700 hover:bg-pink-50">
                    Discuss
                  </button>
                  <button type="button" onClick={() => openPanel(post._id, 'credit')} className="px-4 py-3 text-center text-amber-700 hover:bg-amber-50">
                    Credit
                  </button>
                </div>
                {activePanel[post._id] && (
                  <div className="border-t border-slate-100 bg-white px-5 py-4">
                    {activePanel[post._id] === 'comment' && (
                      user ? (
                        <CommentForm label="Post comment" onSubmit={(content) => addComment(post._id, content)} />
                      ) : (
                        <p className="rounded-2xl bg-teal-50 px-4 py-3 text-sm text-teal-900">
                          <Link to="/login" className="font-black underline">Login</Link> to comment on this post.
                        </p>
                      )
                    )}
                    {activePanel[post._id] === 'discuss' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-black text-slate-950">Discussion</h3>
                          {user && (
                            <button type="button" onClick={() => openPanel(post._id, 'comment')} className="rounded-xl bg-teal-50 px-3 py-2 text-xs font-black text-teal-800 hover:bg-teal-100">
                              Add comment
                            </button>
                          )}
                        </div>
                        {postDetails[post._id] ? (
                          <CommentThread
                            comments={postDetails[post._id].comments}
                            postAuthorId={post.author._id}
                            onReply={(parentId, content) => addComment(post._id, content, parentId)}
                            onDelete={(commentId) => deleteComment(post._id, commentId)}
                          />
                        ) : (
                          <p className="text-sm text-slate-500">Loading comments...</p>
                        )}
                      </div>
                    )}
                    {activePanel[post._id] === 'credit' && (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                        <h3 className="font-black">Credit rules</h3>
                        <p className="mt-1">
                          Direct comments earn {config?.baseCredit ?? 1} credit for {post.author.name}. Each nested reply level adds {config?.incrementValue ?? 2} more.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {user?.id === post.author._id && (
                  <div className="border-t border-slate-100 bg-white px-5 py-3 text-right">
                    <button onClick={() => deletePost(post._id)} className="rounded-xl bg-red-50 px-4 py-2 text-xs font-black text-red-700 hover:bg-red-100">
                      Delete post
                    </button>
                  </div>
                )}
              </article>
            ))}
            {!posts.length && <p className="rounded-2xl border border-dashed border-teal-300 bg-white/70 p-6 text-sm text-slate-500">No posts yet.</p>}
          </div>
        )}
      </section>
      <aside className="space-y-4">
        {config && (
          <div className="rounded-3xl border border-amber-200 bg-amber-50/90 p-5 shadow-sm">
            <h2 className="font-bold text-amber-950">Credit rules</h2>
            <p className="mt-2 text-sm leading-6 text-amber-900">
              Direct comments earn {config.baseCredit}. Each nested level adds {config.incrementValue}.
            </p>
          </div>
        )}
        <div className="rounded-3xl border border-white/80 bg-white/85 p-5 shadow-sm">
          <h2 className="font-black">Trending topics</h2>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-teal-100 px-3 py-1.5 text-teal-800">#introductions</span>
            <span className="rounded-full bg-pink-100 px-3 py-1.5 text-pink-800">#ideas</span>
            <span className="rounded-full bg-amber-100 px-3 py-1.5 text-amber-900">#credits</span>
            <span className="rounded-full bg-cyan-100 px-3 py-1.5 text-cyan-800">#threads</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
