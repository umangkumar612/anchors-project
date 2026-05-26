import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, getErrorMessage } from '../services/api';
import { Post } from '../types';
import { fileToDataUrl } from '../utils/image';

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function DashboardPage() {
  const { user, refreshUser, updateProfile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    bio: '',
    avatarUrl: '',
    coverUrl: '',
  });

  useEffect(() => {
    async function loadDashboard() {
      await refreshUser();
      const { data } = await api.get<Post[]>('/posts/mine');
      setPosts(data);
    }

    loadDashboard()
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (user && !isEditingProfile) {
      setProfileForm({
        name: user.name,
        email: user.email,
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || '',
        coverUrl: user.coverUrl || '',
      });
    }
  }, [user, isEditingProfile]);

  async function handleAvatarChange(file?: File) {
    if (!isEditingProfile) {
      return;
    }

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Profile picture must be smaller than 2 MB');
      return;
    }

    setError('');
    const avatarUrl = await fileToDataUrl(file);
    setProfileForm((current) => ({ ...current, avatarUrl }));
  }

  async function handleCoverChange(file?: File) {
    if (!isEditingProfile || !file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setError('Cover photo must be smaller than 3 MB');
      return;
    }

    setError('');
    const coverUrl = await fileToDataUrl(file);
    setProfileForm((current) => ({ ...current, coverUrl }));
  }

  async function handleProfileSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      await updateProfile(profileForm);
      setSuccess('Profile updated successfully');
      setIsEditingProfile(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  function cancelProfileEdit() {
    if (user) {
      setProfileForm({
        name: user.name,
        email: user.email,
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || '',
        coverUrl: user.coverUrl || '',
      });
    }

    setError('');
    setSuccess('');
    setIsEditingProfile(false);
  }

  async function deletePost(postId: string) {
    if (!window.confirm('Delete this post from the platform?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await api.delete(`/posts/${postId}`);
      setPosts((current) => current.filter((post) => post._id !== postId));
      await refreshUser();
      setSuccess('Post deleted successfully');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-xl shadow-slate-900/5">
        <div className="relative h-48 overflow-hidden bg-gradient-to-r from-pink-500 via-teal-400 to-cyan-400">
          {profileForm.coverUrl && <img src={profileForm.coverUrl} alt="Cover" className="h-full w-full object-cover" />}
          {isEditingProfile && (
            <label className="absolute right-4 top-4 cursor-pointer rounded-2xl bg-slate-950/85 px-4 py-2 text-xs font-black text-white shadow-lg hover:bg-slate-950">
              Change cover
              <input type="file" accept="image/*" className="hidden" onChange={(event) => handleCoverChange(event.target.files?.[0])} />
            </label>
          )}
        </div>
        <form onSubmit={handleProfileSubmit} className="p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-start">
            <div className="shrink-0">
              <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-3xl border-4 border-white bg-slate-950 text-3xl font-black text-white shadow-xl">
                {profileForm.avatarUrl ? <img src={profileForm.avatarUrl} alt="Profile" className="h-full w-full object-cover" /> : initials(profileForm.name || 'User')}
              </div>
              <label className={`mt-3 block rounded-2xl px-4 py-2 text-center text-xs font-black text-white ${isEditingProfile ? 'cursor-pointer bg-slate-950 hover:bg-slate-800' : 'cursor-not-allowed bg-slate-400'}`}>
                Change photo
                <input disabled={!isEditingProfile} type="file" accept="image/*" className="hidden" onChange={(event) => handleAvatarChange(event.target.files?.[0])} />
              </label>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-700">{isEditingProfile ? 'Editing profile' : 'Profile'}</p>
                  <h1 className="mt-2 text-4xl font-black tracking-tight">Dashboard</h1>
                </div>
                {!isEditingProfile && (
                  <button
                    type="button"
                    onClick={() => {
                      setSuccess('');
                      setError('');
                      setIsEditingProfile(true);
                    }}
                    className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-pink-50 hover:text-pink-700"
                    title="Edit profile"
                    aria-label="Edit profile"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <input disabled={!isEditingProfile} value={profileForm.name} onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))} placeholder="Username" />
                <input disabled={!isEditingProfile} type="email" value={profileForm.email} onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" />
              </div>
              <textarea
                disabled={!isEditingProfile}
                value={profileForm.bio}
                onChange={(event) => setProfileForm((current) => ({ ...current, bio: event.target.value }))}
                placeholder="Write a short bio"
                rows={3}
                maxLength={280}
                className="mt-3"
              />
              {isEditingProfile ? (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <button disabled={isSaving} className="rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-pink-700/20 hover:bg-pink-700 disabled:opacity-60">
                    {isSaving ? 'Saving...' : 'Save changes'}
                  </button>
                  <button type="button" onClick={cancelProfileEdit} className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50">
                    Cancel
                  </button>
                  <span className="text-xs font-bold text-slate-500">{profileForm.bio.length}/280</span>
                </div>
              ) : (
                <p className="mt-3 text-xs font-bold text-slate-500">Use the edit icon to update profile details.</p>
              )}
            </div>
          </div>
        </form>
      </section>
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {success && <p className="rounded-md bg-teal-50 px-3 py-2 text-sm font-bold text-teal-800">{success}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-sm font-bold text-amber-900">Total credits</p>
          <p className="mt-2 text-3xl font-semibold">{user?.totalCredits ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5 shadow-sm">
          <p className="text-sm font-bold text-teal-900">Your posts</p>
          <p className="mt-2 text-3xl font-semibold">{posts.length}</p>
        </div>
      </div>
      <section className="space-y-3">
        <h2 className="font-bold">Posts</h2>
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <article key={post._id} className="rounded-2xl border border-white/80 bg-white/85 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl">
                <Link to={`/posts/${post._id}`} className="font-bold text-slate-950 hover:text-teal-800">
                  {post.title}
                </Link>
                <p className="mt-2 line-clamp-2 text-sm text-slate-700">{post.body}</p>
                {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="mt-3 max-h-96 w-full rounded-2xl bg-slate-100 object-contain" />}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link to={`/posts/${post._id}#comments`} className="rounded-xl bg-teal-50 px-4 py-2 text-xs font-black text-teal-800 hover:bg-teal-100">
                    Open discussion
                  </Link>
                  <button onClick={() => deletePost(post._id)} className="rounded-xl bg-red-50 px-4 py-2 text-xs font-black text-red-700 hover:bg-red-100">
                    Delete post
                  </button>
                </div>
              </article>
            ))}
            {!posts.length && <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">You have not posted yet.</p>}
          </div>
        )}
      </section>
    </div>
  );
}
