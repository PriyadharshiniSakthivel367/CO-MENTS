import { Link } from 'react-router-dom';
import CommentForm from '../components/CommentForm';
import CommentList from '../components/CommentList';
import { useAuth } from '../context/AuthContext';
import { useComments } from '../context/CommentContext';

export default function CommentSection() {
  const { isAuthenticated } = useAuth();
  const {
    comments,
    pagination,
    loading,
    loadingMore,
    error,
    loadMore,
    createComment,
  } = useComments();

  const hasMore = Boolean(pagination?.hasMore);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Discussion</h1>
        <p className="mt-2 text-thread-muted">
          Nested threads, votes, and replies—similar to classic forum comments.
        </p>
      </div>

      {isAuthenticated ? (
        <div className="mb-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-thread-muted">
            New comment
          </h2>
          <CommentForm onSubmit={createComment} />
        </div>
      ) : (
        <p className="mb-10 rounded-lg border border-thread-border bg-thread-card px-4 py-3 text-sm text-thread-muted">
          <Link to="/login" className="font-medium text-thread-up hover:underline">
            Log in
          </Link>{' '}
          or{' '}
          <Link to="/register" className="font-medium text-thread-up hover:underline">
            sign up
          </Link>{' '}
          to post and vote.
        </p>
      )}

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-center text-thread-muted">Loading comments…</p>
      ) : (
        <CommentList
          comments={comments}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
          infiniteScroll
        />
      )}
    </div>
  );
}
