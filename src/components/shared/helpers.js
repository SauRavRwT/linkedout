export function formatDate(timestamp) {
  if (!timestamp?.toDate) return "Just now";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(timestamp.toDate());
}

export function buildReplyTree(replies) {
  const repliesById = new Map(
    replies.map((reply) => [reply.id, { ...reply, children: [] }]),
  );
  const roots = [];

  for (const reply of repliesById.values()) {
    const parent = repliesById.get(reply.parentId);
    if (parent) {
      parent.children.push(reply);
    } else {
      roots.push(reply);
    }
  }

  return roots;
}
