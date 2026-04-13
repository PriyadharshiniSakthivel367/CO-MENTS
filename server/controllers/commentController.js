import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import Comment from '../models/Comment.js';
import { fetchSubtreeComments, nestComments } from '../utils/commentTree.js';

function serializeComment(doc, currentUserId) {
  const uid = currentUserId?.toString();
  const likes = doc.likes || [];
  const dislikes = doc.dislikes || [];
  const userLiked = uid ? likes.some((id) => id.toString() === uid) : false;
  const userDisliked = uid ? dislikes.some((id) => id.toString() === uid) : false;
  const u = doc.user;
  return {
    _id: doc._id,
    text: doc.text,
    user: u
      ? { _id: u._id, username: u.username, email: u.email }
      : doc.user,
    parentComment: doc.parentComment?._id ?? doc.parentComment ?? null,
    likesCount: likes.length,
    dislikesCount: dislikes.length,
    userLiked,
    userDisliked,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    replies: (doc.replies || []).map((r) => serializeComment(r, currentUserId)),
  };
}

async function collectDescendantIds(commentId) {
  const all = new Set([commentId.toString()]);
  let frontier = [commentId];
  while (frontier.length) {
    const children = await Comment.find({ parentComment: { $in: frontier } })
      .select('_id')
      .lean();
    if (!children.length) break;
    frontier = [];
    for (const c of children) {
      const s = c._id.toString();
      if (!all.has(s)) {
        all.add(s);
        frontier.push(c._id);
      }
    }
  }
  return [...all];
}

export async function getComments(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filterRoot = { parentComment: null };
    const totalRoots = await Comment.countDocuments(filterRoot);

    const rootsPage = await Comment.find(filterRoot)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('_id')
      .lean();

    const rootIds = rootsPage.map((r) => r._id);
    const flat = await fetchSubtreeComments(Comment, rootIds);
    const nested = nestComments(flat, rootIds);
    const currentUserId = req.userId || null;
    const tree = nested.map((n) => serializeComment(n, currentUserId));

    res.json({
      data: tree,
      pagination: {
        page,
        limit,
        totalRoots,
        totalPages: Math.ceil(totalRoots / limit) || 1,
        hasMore: skip + rootIds.length < totalRoots,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

/** Optional JWT: attach req.userId if Bearer present, without failing */
export function attachUserOptional(req, _res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const token = header.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id;
    } catch {
      req.userId = undefined;
    }
  }
  next();
}

export async function createComment(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { text } = req.body;
    const comment = await Comment.create({
      text,
      user: req.userId,
      parentComment: null,
    });
    const populated = await Comment.findById(comment._id).populate('user', 'username email').lean();
    req.io?.emit('comment:created', { rootId: populated._id.toString() });
    res.status(201).json(serializeComment({ ...populated, replies: [] }, req.userId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function replyToComment(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid comment id' });
    }
    const parent = await Comment.findById(id);
    if (!parent) {
      return res.status(404).json({ message: 'Parent comment not found' });
    }
    let cursor = parent;
    while (cursor.parentComment) {
      const next = await Comment.findById(cursor.parentComment).select('parentComment');
      if (!next) break;
      cursor = next;
    }
    const rootId = cursor._id;

    const { text } = req.body;
    const comment = await Comment.create({
      text,
      user: req.userId,
      parentComment: parent._id,
    });
    const populated = await Comment.findById(comment._id).populate('user', 'username email').lean();
    req.io?.emit('comment:reply', {
      rootId: rootId.toString(),
      parentId: parent._id.toString(),
    });
    res.status(201).json(serializeComment({ ...populated, replies: [] }, req.userId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function updateComment(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid comment id' });
    }
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    if (comment.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    comment.text = req.body.text;
    await comment.save();
    const populated = await Comment.findById(comment._id).populate('user', 'username email').lean();
    req.io?.emit('comment:updated', { commentId: id });
    res.json(serializeComment({ ...populated, replies: [] }, req.userId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function deleteComment(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid comment id' });
    }
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    if (comment.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    const allIds = await collectDescendantIds(comment._id);
    await Comment.deleteMany({ _id: { $in: allIds } });
    req.io?.emit('comment:deleted', { commentId: id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function getRootIdForComment(commentId) {
  let current = await Comment.findById(commentId).select('parentComment');
  if (!current) return null;
  while (current.parentComment) {
    const next = await Comment.findById(current.parentComment).select('parentComment');
    if (!next) break;
    current = next;
  }
  return current._id;
}

export async function likeComment(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid comment id' });
    }
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    const uid = req.userId.toString();
    const liked = comment.likes.some((x) => x.toString() === uid);
    if (liked) {
      comment.likes = comment.likes.filter((x) => x.toString() !== uid);
    } else {
      comment.likes.push(req.userId);
      comment.dislikes = comment.dislikes.filter((x) => x.toString() !== uid);
    }
    await comment.save();
    const rootId = await getRootIdForComment(id);
    req.io?.emit('comment:react', { rootId: rootId?.toString(), commentId: id });
    const populated = await Comment.findById(comment._id).populate('user', 'username email').lean();
    res.json(serializeComment({ ...populated, replies: [] }, req.userId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function dislikeComment(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid comment id' });
    }
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    const uid = req.userId.toString();
    const disliked = comment.dislikes.some((x) => x.toString() === uid);
    if (disliked) {
      comment.dislikes = comment.dislikes.filter((x) => x.toString() !== uid);
    } else {
      comment.dislikes.push(req.userId);
      comment.likes = comment.likes.filter((x) => x.toString() !== uid);
    }
    await comment.save();
    const rootId = await getRootIdForComment(id);
    req.io?.emit('comment:react', { rootId: rootId?.toString(), commentId: id });
    const populated = await Comment.findById(comment._id).populate('user', 'username email').lean();
    res.json(serializeComment({ ...populated, replies: [] }, req.userId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}
