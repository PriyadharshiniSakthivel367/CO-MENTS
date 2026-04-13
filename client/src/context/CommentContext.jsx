import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { io } from 'socket.io-client';
import { commentsApi } from '../services/api';
import { useAuth } from './AuthContext';

const CommentContext = createContext(null);

const PAGE_SIZE = 10;

async function fetchPagesMerged(pages) {
  const acc = [];
  let pagination = null;
  for (let p = 1; p <= pages; p++) {
    const { data } = await commentsApi.list({ page: p, limit: PAGE_SIZE });
    acc.push(...data.data);
    pagination = data.pagination;
  }
  return { list: acc, pagination };
}

export function CommentProvider({ children }) {
  const { ready: authReady } = useAuth();
  const [comments, setComments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const loadedPagesRef = useRef(1);
  const socketRef = useRef(null);

  const applyList = useCallback((list, pag) => {
    setComments(list);
    setPagination(pag);
  }, []);

  const reloadLoaded = useCallback(async () => {
    const pages = loadedPagesRef.current || 1;
    const { list, pagination: pag } = await fetchPagesMerged(pages);
    applyList(list, pag);
  }, [applyList]);

  const initialLoad = useCallback(async () => {
    setLoading(true);
    setError(null);
    loadedPagesRef.current = 1;
    try {
      const { data } = await commentsApi.list({ page: 1, limit: PAGE_SIZE });
      applyList(data.data, data.pagination);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [applyList]);

  useEffect(() => {
    if (!authReady) return;
    initialLoad();
  }, [authReady, initialLoad]);

  useEffect(() => {
    const origin = import.meta.env.VITE_API_URL || undefined;
    const socket = io(origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;
    socket.emit('join:comments');
    const onUpdate = () => {
      reloadLoaded().catch(() => {});
    };
    socket.on('comment:created', onUpdate);
    socket.on('comment:reply', onUpdate);
    socket.on('comment:updated', onUpdate);
    socket.on('comment:deleted', onUpdate);
    socket.on('comment:react', onUpdate);
    return () => {
      socket.disconnect();
    };
  }, [reloadLoaded]);

  const loadMore = useCallback(async () => {
    if (!pagination?.hasMore || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const nextPage = (pagination?.page || 1) + 1;
      const { data } = await commentsApi.list({ page: nextPage, limit: PAGE_SIZE });
      loadedPagesRef.current = nextPage;
      setComments((prev) => [...prev, ...data.data]);
      setPagination(data.pagination);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load more');
    } finally {
      setLoadingMore(false);
    }
  }, [pagination, loadingMore]);

  const createComment = useCallback(
    async (text) => {
      await commentsApi.create(text);
      await reloadLoaded();
    },
    [reloadLoaded]
  );

  const replyTo = useCallback(
    async (parentId, text) => {
      await commentsApi.reply(parentId, text);
      await reloadLoaded();
    },
    [reloadLoaded]
  );

  const updateComment = useCallback(
    async (id, text) => {
      await commentsApi.update(id, text);
      await reloadLoaded();
    },
    [reloadLoaded]
  );

  const deleteComment = useCallback(
    async (id) => {
      await commentsApi.remove(id);
      await reloadLoaded();
    },
    [reloadLoaded]
  );

  const likeComment = useCallback(
    async (id) => {
      await commentsApi.like(id);
      await reloadLoaded();
    },
    [reloadLoaded]
  );

  const dislikeComment = useCallback(
    async (id) => {
      await commentsApi.dislike(id);
      await reloadLoaded();
    },
    [reloadLoaded]
  );

  const value = useMemo(
    () => ({
      comments,
      pagination,
      loading,
      loadingMore,
      error,
      pageSize: PAGE_SIZE,
      loadMore,
      reload: reloadLoaded,
      createComment,
      replyTo,
      updateComment,
      deleteComment,
      likeComment,
      dislikeComment,
    }),
    [
      comments,
      pagination,
      loading,
      loadingMore,
      error,
      loadMore,
      reloadLoaded,
      createComment,
      replyTo,
      updateComment,
      deleteComment,
      likeComment,
      dislikeComment,
    ]
  );

  return <CommentContext.Provider value={value}>{children}</CommentContext.Provider>;
}

export function useComments() {
  const ctx = useContext(CommentContext);
  if (!ctx) throw new Error('useComments must be used within CommentProvider');
  return ctx;
}
