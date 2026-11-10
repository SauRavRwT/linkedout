import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { formatDate, buildReplyTree } from "../shared/helpers.js";
import "./Card.css";

export function ReplyComposer({
  postId,
  parentId,
  parentUsername,
  username,
  firebaseApi,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [error, setError] = useState("");
  const inputId = `reply-${postId}-${parentId || "story"}`;

  async function handleReplySubmit(event) {
    event.preventDefault();
    if (!username || !firebaseApi || !message.trim()) return;

    setReplyLoading(true);
    setError("");
    try {
      await firebaseApi.createReply({
        postId,
        parentId,
        username,
        message,
      });
      setMessage("");
      setIsOpen(false);
    } catch (replyError) {
      setError(
        `Your reply could not be sent: ${firebaseApi.getFirestoreErrorMessage(replyError)}`,
      );
    } finally {
      setReplyLoading(false);
    }
  }

  if (!username) {
    return (
      <a className="reply-action" href="#/signup">
        Sign up to reply
      </a>
    );
  }

  return (
    <div className="reply-composer">
      <button
        className="reply-action"
        type="button"
        onClick={() => {
          setIsOpen((open) => !open);
          setError("");
        }}
        aria-expanded={isOpen}
      >
        {isOpen ? "Close reply" : parentId ? "Reply" : "Reply to story"}
      </button>
      {isOpen && (
        <form
          className="reply-form"
          onSubmit={handleReplySubmit}
          aria-label={
            parentId ? `Reply to @${parentUsername}` : "Reply to this story"
          }
        >
          <label htmlFor={inputId}>Your reply to @{parentUsername}</label>
          <textarea
            id={inputId}
            name="reply"
            maxLength={2000}
            rows={3}
            placeholder="Keep the conversation going…"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={replyLoading}
            required
          />
          <div className="reply-form-footer">
            <span>{message.length} / 2,000</span>
            <div>
              <button
                type="button"
                className="reply-cancel"
                onClick={() => setIsOpen(false)}
                disabled={replyLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="reply-submit"
                disabled={replyLoading || !message.trim()}
              >
                {replyLoading ? "Sending…" : "Send reply"}
              </button>
            </div>
          </div>
          {error && (
            <p className="reply-error" role="alert">
              {error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}

export function ReplyThread({ replies, postId, username, firebaseApi }) {
  return (
    <ol className="reply-thread" aria-label="Replies">
      {replies.map((reply) => (
        <li className="reply-item" key={reply.id}>
          <div className="reply-meta">
            <span className="author-name">@{reply.username}</span>
            <span className="story-date">{formatDate(reply.createdAt)}</span>
          </div>
          <p className="reply-message">{reply.message}</p>
          <ReplyComposer
            postId={postId}
            parentId={reply.id}
            parentUsername={reply.username}
            username={username}
            firebaseApi={firebaseApi}
          />
          {reply.children.length > 0 && (
            <ReplyThread
              replies={reply.children}
              postId={postId}
              username={username}
              firebaseApi={firebaseApi}
            />
          )}
        </li>
      ))}
    </ol>
  );
}

export function StoryCard({ post, username, firebaseApi }) {
  const [replies, setReplies] = useState([]);
  const [repliesLoading, setRepliesLoading] = useState(true);
  const [replyError, setReplyError] = useState("");

  useEffect(() => {
    let active = true;

    const unsubscribe = firebaseApi.subscribeToReplies(
      post.id,
      (items) => {
        if (!active) return;
        setReplies(items);
        setRepliesLoading(false);
      },
      (error) => {
        if (!active) return;
        setReplyError(
          `Replies could not be loaded: ${firebaseApi.getFirestoreErrorMessage(error)}`,
        );
        setRepliesLoading(false);
      },
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [firebaseApi, post.id]);

  const replyTree = useMemo(() => buildReplyTree(replies), [replies]);

  return (
    <motion.article
      className="story-card glass-panel"
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="story-card-top">
        <div className="story-author">
          <span
            className={`author-avatar avatar-${post.outcome}`}
            aria-hidden="true"
          >
            {post.outcome === "quit" ? "↗" : "✳"}
          </span>
          <div>
            <span className="author-name">@{post.username}</span>
            <span className="story-date">{formatDate(post.createdAt)}</span>
          </div>
        </div>
        <span className={`outcome-badge badge-${post.outcome}`}>
          {post.outcome === "quit" ? "I quit" : "I was let go"}
        </span>
      </div>
      <p className="story-company">{post.company}</p>
      <p className="story-message">{post.message}</p>
      <div className="story-card-bottom">
        <span>SHARED ANONYMOUSLY</span>
        <span className="reply-count">
          {replies.length} {replies.length === 1 ? "reply" : "replies"}
        </span>
        <span className="story-spark" aria-hidden="true">
          ✳
        </span>
      </div>
      <div className="story-conversation">
        <ReplyComposer
          postId={post.id}
          parentId={null}
          parentUsername={post.username}
          username={username}
          firebaseApi={firebaseApi}
        />
        {repliesLoading && (
          <p className="reply-status" role="status">
            Loading replies…
          </p>
        )}
        {replyError && (
          <p className="reply-error" role="alert">
            {replyError}
          </p>
        )}
        {!repliesLoading && !replyError && replyTree.length === 0 && (
          <p className="reply-empty">Start a conversation.</p>
        )}
        {replyTree.length > 0 && (
          <ReplyThread
            replies={replyTree}
            postId={post.id}
            username={username}
            firebaseApi={firebaseApi}
          />
        )}
      </div>
    </motion.article>
  );
}
