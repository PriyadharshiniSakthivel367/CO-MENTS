import { useEffect, useRef } from 'react';
import CommentItem from './CommentItem';

export default function CommentList({
  comments,
  hasMore,
  loadingMore,
  onLoadMore,
  infiniteScroll,
}) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!infiniteScroll || !hasMore) return undefined;
    const el = sentinelRef.current;
    if (!el) return undefined;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { rootMargin: '120px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [infiniteScroll, hasMore, onLoadMore]);

  if (!comments.length) {
    return (
      <p className="rounded-xl border border-dashed border-thread-border py-12 text-center text-thread-muted">
        No comments yet. Be the first to start the thread.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <ul className="space-y-4">
        {comments.map((c) => (
          <CommentItem key={c._id} comment={c} depth={0} />
        ))}
      </ul>

      {hasMore && (
        <div className="flex flex-col items-center gap-3 pt-6" ref={sentinelRef}>
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="rounded-full border border-thread-border bg-thread-card px-6 py-2 text-sm font-medium text-white hover:border-thread-muted disabled:opacity-50"
          >
            {loadingMore ? 'Loading…' : 'Load more comments'}
          </button>
          {infiniteScroll && (
            <span className="text-xs text-thread-muted">Or scroll to load automatically</span>
          )}
        </div>
      )}
    </div>
  );
}
