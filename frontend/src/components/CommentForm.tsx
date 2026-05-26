import { FormEvent, useState } from 'react';
import { getErrorMessage } from '../services/api';

type Props = {
  label?: string;
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
};

export function CommentForm({ label = 'Comment', onSubmit, onCancel }: Props) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onSubmit(content);
      setContent('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={3} placeholder={label} />
      <div className="flex gap-2">
        <button disabled={isSubmitting} className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-bold text-white shadow-sm hover:bg-teal-700 disabled:opacity-60">
          {isSubmitting ? 'Saving...' : label}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
