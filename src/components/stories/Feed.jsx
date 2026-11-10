import { useMemo } from "react";
import { StoryCard } from "./Card.jsx";
import { ArrowIcon } from "../shared/Icons.jsx";
import "./Feed.css";

const filters = [
  { value: "all", label: "All stories" },
  { value: "quit", label: "I quit" },
  { value: "fired", label: "I was let go" },
];

export function Feed({
  posts,
  filter,
  setFilter,
  postsLoading,
  firebaseError,
  firebaseConfigured,
  username,
  firebaseApi,
}) {
  const filteredPosts = useMemo(
    () =>
      filter === "all"
        ? posts
        : posts.filter((post) => post.outcome === filter),
    [filter, posts],
  );
  return (
    <section className="stories-section" id="stories">
      <div className="section-heading">
        <div>
          <p className="eyebrow section-eyebrow">
            <span className="eyebrow-dot" /> OUT OF OFFICE, INTO THE OPEN
          </p>
          <h2>It wasn’t just you.</h2>
          <p className="section-subtitle">
            A little clarity from people who’ve been there.
          </p>
        </div>
        <div className="story-count">
          <span className="count-spark">✳</span>
          {posts.length} {posts.length === 1 ? "story" : "stories"} shared
        </div>
      </div>

      <div className="feed-layout">
        <div className="feed-column">
          <div className="feed-toolbar">
            <div
              className="filter-tabs"
              role="group"
              aria-label="Filter stories"
            >
              {filters.map((item) => (
                <button
                  className={
                    filter === item.value ? "filter-tab active" : "filter-tab"
                  }
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  aria-pressed={filter === item.value}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <span className="feed-sort">
              LATEST FIRST <span aria-hidden="true">↘</span>
            </span>
          </div>

          {postsLoading ? (
            <div className="feed-state">
              <span className="loader" /> Gathering the stories…
            </div>
          ) : filteredPosts.length ? (
            <div className="story-list">
              {filteredPosts.map((post) => (
                <StoryCard
                  key={post.id}
                  post={post}
                  username={username}
                  firebaseApi={firebaseApi}
                />
              ))}
            </div>
          ) : (
            <div className="empty-feed glass-panel">
              <span className="empty-icon" aria-hidden="true">
                ↗
              </span>
              <h3>
                {firebaseError
                  ? "Story feed unavailable."
                  : filter === "all"
                    ? "The first story is yours."
                    : "No stories in this corner yet."}
              </h3>
              <p>
                {!firebaseConfigured
                  ? "Connect a Firebase project to open the story feed. No placeholder stories here — only the real thing."
                  : firebaseError
                    ? "The story feed is temporarily unavailable. Check your Firebase configuration and connection, then try again."
                    : "This space is new. When someone is ready to share, their words will find a home here."}
              </p>
              {username && (
                <a className="text-link" href="#/signup">
                  Tell your story <ArrowIcon />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
