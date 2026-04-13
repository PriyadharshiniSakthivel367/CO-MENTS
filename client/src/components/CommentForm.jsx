import { useState } from 'react';

export default function CommentForm({ onSubmit, disabled, placeholder = 'What are your thoughts?' }) {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || disabled) return;
    setSaving(true);
    try {
      await onSubmit(t);
      setText('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-thread-border bg-thread-card p-4">
      <label htmlFor="new-comment" className="sr-only">
        New comment
      </label>
      <textarea
        id="new-comment"
        rows={3}
        className="w-full resize-y rounded-lg border border-thread-border bg-thread-bg px-3 py-2 text-white placeholder:text-gray-500 focus:border-thread-accent focus:outline-none focus:ring-1 focus:ring-thread-accent"
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled || saving}
        maxLength={5000}
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs text-thread-muted">{text.length} / 5000</span>
        <button
          type="submit"
          disabled={disabled || saving || !text.trim()}
          className="rounded-full bg-thread-accent px-5 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? 'Posting…' : 'Comment'}
        </button>
      </div>
    </form>
  );
}
