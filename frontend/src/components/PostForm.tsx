import { FormEvent, useState } from 'react';
import { getErrorMessage } from '../services/api';
import { fileToDataUrl } from '../utils/image';

type Props = {
  onSubmit: (payload: { title: string; body: string; imageUrl: string }) => Promise<void>;
  currentUserName?: string;
  currentUserAvatar?: string;
};

export function PostForm({ onSubmit, currentUserName, currentUserAvatar }: Props) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onSubmit({ title, body, imageUrl });
      setTitle('');
      setBody('');
      setImageUrl('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleImageChange(file?: File) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be smaller than 2 MB');
      return;
    }

    setError('');
    setImageUrl(await fileToDataUrl(file));
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-xl shadow-slate-900/5 backdrop-blur">
      <div className="flex gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-white">
          {currentUserAvatar ? (
            <img src={currentUserAvatar} alt="" className="h-full w-full rounded-2xl object-cover" />
          ) : (
            currentUserName ? currentUserName.charAt(0).toUpperCase() : 'G'
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <h2 className="text-base font-black text-slate-950">Start a conversation</h2>
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" maxLength={160} />
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="What do you want to discuss?"
        rows={4}
      />
          {imageUrl && (
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
              <img src={imageUrl} alt="Post preview" className="max-h-96 w-full object-contain" />
              <button type="button" onClick={() => setImageUrl('')} className="w-full px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50">
                Remove image
              </button>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <div className="flex gap-2 text-xs font-bold text-slate-500">
              <label className="cursor-pointer rounded-full bg-pink-50 px-3 py-1.5 text-pink-800 hover:bg-pink-100">
                Add photo
                <input type="file" accept="image/*" className="hidden" onChange={(event) => handleImageChange(event.target.files?.[0])} />
              </label>
            </div>
            <button disabled={isSubmitting} className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-teal-700/20 hover:bg-teal-700 disabled:opacity-60">
              {isSubmitting ? 'Posting...' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
