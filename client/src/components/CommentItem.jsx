import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useComments } from '../context/CommentContext';
import ReplyForm from './ReplyForm';
import UserAvatar from './UserAvatar';

function timeAgo(iso) {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return '';
  }
}

export default function CommentItem({ comment, depth = 0 }) {
  const { user, isAuthenticated } = useAuth();
  const { replyTo, updateComment, deleteComment, likeComment, dislikeComment } = useComments();
  const [replyOpen, setReplyOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [busy, setBusy] = useState(false);

  const isOwner = user && String(user.id) === String(comment.user?._id);
  const maxDepth = 8;
  const indent = Math.min(depth, maxDepth);

  const onSaveEdit = async (e) => {
    e.preventDefault();
    const t = editText.trim();
    if (!t) return;
    setBusy(true);
    try {
      await updateComment(comment._id, t);
      setEditing(false);
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    if (!window.confirm('Delete this comment and all its replies?')) return;
    setBusy(true);
    try {
      await deleteComment(comment._id);
    } finally {
      setBusy(false);
    }
  };

  const vote = async (fn) => {
    if (!isAuthenticated) return;
    setBusy(true);
    try {
      await fn(comment._id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <li
      className={`relative ${indent > 0 ? 'mt-3 border-l-2 border-thread-border pl-4' : ''}`}
      style={{ marginLeft: indent ? Math.min(indent * 12, 72) : 0 }}
    >
      <article className="rounded-lg border border-thread-border/80 bg-thread-card/50 p-3 sm:p-4">
        <div className="flex gap-3">
          <UserAvatar username={comment.user?.username} size={36} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-semibold text-white">{comment.user?.username || 'User'}</span>
              <span className="text-xs text-thread-muted" title={new Date(comment.createdAt).toLocaleString()}>
                {timeAgo(comment.createdAt)}
                {comment.updatedAt !== comment.createdAt && ' · edited'}
              </span>
            </div>

            {editing ? (
              <form onSubmit={onSaveEdit} className="mt-2 space-y-2">
                <textarea
                  className="w-full rounded-lg border border-thread-border bg-thread-bg px-3 py-2 text-sm text-white"
                  rows={3}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  disabled={busy}
                  maxLength={5000}
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={busy || !editText.trim()}
                    className="rounded-full bg-thread-accent px-3 py-1 text-xs font-semibold text-white"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setEditText(comment.text);
                    }}
                    className="rounded-full border border-thread-border px-3 py-1 text-xs text-thread-muted"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-200">{comment.text}</p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-full border border-thread-border bg-thread-bg/80 px-1">
                <button
                  type="button"
                  disabled={!isAuthenticated || busy}
                  onClick={() => vote(likeComment)}
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    comment.userLiked
                      ? 'text-thread-up'
                      : 'text-thread-muted hover:text-thread-up'
                  }`}
                  title={isAuthenticated ? 'Like' : 'Log in to vote'}
                >
                  ▲ {comment.likesCount ?? 0}
                </button>
                <span className="text-thread-border">|</span>
                <button
                  type="button"
                  disabled={!isAuthenticated || busy}
                  onClick={() => vote(dislikeComment)}
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    comment.userDisliked
                      ? 'text-thread-down'
                      : 'text-thread-muted hover:text-thread-down'
                  }`}
                  title={isAuthenticated ? 'Dislike' : 'Log in to vote'}
                >
                  ▼ {comment.dislikesCount ?? 0}
                </button>
              </div>

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => setReplyOpen((v) => !v)}
                  className="text-xs font-medium text-thread-muted hover:text-white"
                >
                  {replyOpen ? 'Close' : 'Reply'}
                </button>
              )}

              {isOwner && !editing && (
                <>
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="text-xs font-medium text-thread-muted hover:text-white"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={onDelete}
                    disabled={busy}
                    className="text-xs font-medium text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>

            {replyOpen && isAuthenticated && (
              <ReplyForm
                disabled={busy}
                onCancel={() => setReplyOpen(false)}
                onSubmit={async (text) => {
                  await replyTo(comment._id, text);
                }}
              />
            )}
          </div>
        </div>
      </article>

      {comment.replies?.length > 0 && (
        <ul className="mt-1 space-y-0">
          {comment.replies.map((r) => (
            <CommentItem key={r._id} comment={r} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}
