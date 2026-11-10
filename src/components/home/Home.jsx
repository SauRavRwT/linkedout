import { motion } from "motion/react";
import { ArrowIcon } from "../shared/Icons.jsx";
import { firebaseConfigured } from "../../lib/firebase-config.js";
import "./Home.css";

export function Home({
  authLoading,
  authUser,
  username,
  company,
  setCompany,
  outcome,
  setOutcome,
  message,
  setMessage,
  storyCharactersRemaining,
  postLoading,
  handlePostSubmit,
}) {
  return (
    <section className="hero-section">
      <div className="hero-copy">
        <div className="eyebrow">
          <span className="eyebrow-dot" /> THE EXIT INTERVIEW, AFTER THE EXIT
        </div>
        <h1>
          The truth doesn’t fit in an <span>exit interview.</span>
        </h1>
        <p className="hero-description">
          The unfiltered stories behind the jobs we left — and the ones that let
          us go. Share with a unique handle; your email stays private.
        </p>
        <a className="text-link" href="#stories">
          Read the stories <ArrowIcon />
        </a>
        <div className="hero-proof">
          <div className="avatar-stack" aria-hidden="true">
            <span>✳</span>
            <span>↗</span>
            <span>◒</span>
            <span>+</span>
          </div>
          <span>A little less alone, one story at a time.</span>
        </div>
      </div>

      <motion.div
        className="glass-panel join-panel"
        id="join"
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {!firebaseConfigured ? (
          <div className="setup-state">
            <div className="panel-icon setup-icon" aria-hidden="true">
              ✦
            </div>
            <p className="panel-kicker">ONE LAST THING</p>
            <h2>Connect the story room.</h2>
            <p className="panel-description">
              Add your Firebase web app settings to <code>.env</code> to enable
              verified accounts and the live story feed.
            </p>
            <span className="setup-tag">Firebase setup required</span>
          </div>
        ) : !username ? (
          <div className="setup-state home-account-state">
            <div className="panel-icon setup-icon" aria-hidden="true">
              {authUser ? "✳" : "↗"}
            </div>
            <p className="panel-kicker">
              {authUser
                ? authUser.emailVerified
                  ? "ONE LAST STEP"
                  : "CHECK YOUR INBOX"
                : "YOUR STORY, YOUR HANDLE"}
            </p>
            <h2>
              {authLoading
                ? "Opening the story room."
                : authUser
                  ? authUser.emailVerified
                    ? "Choose your unique handle."
                    : "Verify your email to continue."
                  : "A space for what really happened."}
            </h2>
            <p className="panel-description">
              {authUser
                ? authUser.emailVerified
                  ? "Your username is what others see. Pick one to start sharing."
                  : `We sent a verification link to ${authUser.email}. Your email stays private.`
                : "Read the stories, or make a private account to share yours. Your email is never shown publicly."}
            </p>
            {!authLoading && (
              <div className="home-account-actions">
                {!authUser ? (
                  <>
                    <a className="primary-button" href="#/signup">
                      Create an account <ArrowIcon />
                    </a>
                    <a className="secondary-button" href="#/signin">
                      I already have an account
                    </a>
                  </>
                ) : authUser.emailVerified ? (
                  <a className="primary-button" href="#/profile">
                    Finish your profile <ArrowIcon />
                  </a>
                ) : (
                  <a className="primary-button" href="#/verify">
                    Continue verification <ArrowIcon />
                  </a>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="panel-heading">
              <div className="panel-icon" aria-hidden="true">
                ↗
              </div>
              <span className="step-count">02 / 02</span>
            </div>
            <p className="panel-kicker">LET IT OUT</p>
            <h2>Your side of the story.</h2>
            <p className="panel-description">
              Keep it honest. Keep it anonymous. Leave out names and details
              that could identify a person. There’s no one-story limit; the form
              clears after each post so you can share another.
            </p>
            <form className="form-stack post-form" onSubmit={handlePostSubmit}>
              <label htmlFor="company">
                Company{" "}
                <span className="label-optional">— as you remember it</span>
              </label>
              <input
                className="text-input"
                id="company"
                name="company"
                autoComplete="organization"
                maxLength={80}
                placeholder="Where did it happen?"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                required
              />
              <fieldset className="outcome-fieldset">
                <legend>How did it end?</legend>
                <div className="outcome-options">
                  <label
                    className={`outcome-option ${outcome === "quit" ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="outcome"
                      value="quit"
                      checked={outcome === "quit"}
                      onChange={() => setOutcome("quit")}
                    />
                    <span className="radio-dot" /> I quit
                  </label>
                  <label
                    className={`outcome-option ${outcome === "fired" ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="outcome"
                      value="fired"
                      checked={outcome === "fired"}
                      onChange={() => setOutcome("fired")}
                    />
                    <span className="radio-dot" /> I was let go
                  </label>
                </div>
              </fieldset>
              <label htmlFor="story">What really happened?</label>
              <textarea
                id="story"
                name="story"
                autoComplete="off"
                maxLength={2000}
                minLength={20}
                placeholder="The moment you knew. The thing nobody asked about. What you wish you could have said…"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                required
              />
              <div className="textarea-meta">
                <span aria-live="polite">
                  {storyCharactersRemaining > 0
                    ? `${storyCharactersRemaining} more ${storyCharactersRemaining === 1 ? "character" : "characters"} needed to share`
                    : "Ready to share"}
                </span>
                <span>{message.trim().length} / 2,000</span>
              </div>
              <button
                className="primary-button"
                type="submit"
                disabled={
                  postLoading || !company.trim() || message.trim().length < 20
                }
              >
                {postLoading ? "Sharing your story…" : "Share anonymously"}
                {!postLoading && <ArrowIcon />}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </section>
  );
}
