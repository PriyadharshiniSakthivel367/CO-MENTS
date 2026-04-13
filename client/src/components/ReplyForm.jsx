import { useState } from 'react';

export default function ReplyForm({ onSubmit, onCancel, disabled }) {
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
      onCancel?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      <textarea
        rows={2}
        className="w-full resize-y rounded-lg border border-thread-border bg-thread-bg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-thread-accent focus:outline-none focus:ring-1 focus:ring-thread-accent"
        placeholder="Write a reply…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled || saving}
        maxLength={5000}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={disabled || saving || !text.trim()}
          className="rounded-full bg-thread-accent px-4 py-1.5 text-xs font-semibold text-white hover:opacity-95 disabled:opacity-40"
        >
          {saving ? 'Posting…' : 'Reply'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-thread-border px-4 py-1.5 text-xs text-thread-muted hover:text-white"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
