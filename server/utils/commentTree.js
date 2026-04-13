/**
 * Load all comments in subtrees of the given root IDs (breadth-first batches).
 */
export async function fetchSubtreeComments(Comment, rootIds) {
  if (!rootIds.length) return [];

  const roots = await Comment.find({ _id: { $in: rootIds } })
    .populate('user', 'username email')
    .populate('parentComment', '_id')
    .lean();

  const flat = [...roots];
  let parents = rootIds.map((id) => id.toString());

  while (parents.length > 0) {
    const children = await Comment.find({
      parentComment: { $in: parents },
    })
      .populate('user', 'username email')
      .lean();

    if (!children.length) break;
    flat.push(...children);
    parents = children.map((c) => c._id.toString());
  }

  return flat;
}

/**
 * Attach nested `replies` to each node; return top-level nodes in `rootOrder`.
 */
export function nestComments(flatDocs, rootOrderIds) {
  const byId = new Map();
  for (const doc of flatDocs) {
    byId.set(doc._id.toString(), { ...doc, replies: [] });
  }

  const roots = [];
  const rootSet = new Set(rootOrderIds.map((id) => id.toString()));

  for (const doc of flatDocs) {
    const id = doc._id.toString();
    const node = byId.get(id);
    const parentId = doc.parentComment?._id
      ? doc.parentComment._id.toString()
      : doc.parentComment
        ? doc.parentComment.toString()
        : null;

    if (!parentId) {
      if (rootSet.has(id)) roots.push(node);
      continue;
    }
    const parent = byId.get(parentId);
    if (parent) parent.replies.push(node);
  }

  const orderMap = new Map(rootOrderIds.map((rid, i) => [rid.toString(), i]));
  roots.sort((a, b) => orderMap.get(a._id.toString()) - orderMap.get(b._id.toString()));

  /** sort replies by createdAt ascending for thread readability */
  function sortReplies(node) {
    node.replies.sort(
      (x, y) => new Date(x.createdAt) - new Date(y.createdAt)
    );
    node.replies.forEach(sortReplies);
  }
  roots.forEach(sortReplies);

  return roots;
}
