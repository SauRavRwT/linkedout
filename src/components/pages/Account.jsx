import { ArrowIcon } from "../shared/Icons.jsx";
import "./Account.css";

export function AccountPage({
  mode,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  username,
  onUsernameChange,
  configured,
  connectionError,
  loading,
  error,
  onSubmit,
}) {
  const isSignup = mode === "signup";

  return (
    <section className="account-page">
      <div className="glass-panel account-card">
        <div className="panel-icon" aria-hidden="true">
          {isSignup ? "✳" : "↗"}
        </div>
        <p className="panel-kicker">
          {isSignup ? "A PRIVATE PLACE TO START" : "WELCOME BACK"}
        </p>
        <h1>
          {isSignup ? "Make room for your story." : "Good to have you back."}
        </h1>
        <p className="panel-description">
          {isSignup
            ? "Your email is only for account access and verification. Stories are shared under your unique handle."
            : "Sign in to pick up where you left off. Your email is never shown with your stories."}
        </p>
        {!configured && (
          <p className="account-error" role="status">
            Account access is unavailable until Firebase is configured.
          </p>
        )}
        {connectionError && (
          <p className="account-error" role="alert">
            {connectionError}
          </p>
        )}
        <form className="form-stack account-form" onSubmit={onSubmit}>
          {isSignup && (
            <>
              <label htmlFor="account-username">Unique username</label>
              <div className="input-wrap handle-input account-handle-input">
                <span aria-hidden="true">@</span>
                <input
                  id="account-username"
                  name="username"
                  autoComplete="username"
                  maxLength={20}
                  minLength={3}
                  pattern="[A-Za-z0-9_]{3,20}"
                  placeholder="quietly_done"
                  value={username}
                  onChange={(event) => onUsernameChange(event.target.value)}
                  required
                />
              </div>
              <p className="field-hint">
                3–20 letters, numbers, or underscores. We’ll check availability
                after you verify your email.
              </p>
            </>
          )}
          <label htmlFor="account-email">Email address</label>
          <input
            className="text-input"
            id="account-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            required
          />
          <label htmlFor="account-password">Password</label>
          <input
            className="text-input"
            id="account-password"
            name="password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            minLength={6}
            placeholder={isSignup ? "At least 6 characters" : "Your password"}
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            required
          />
          {error && (
            <p className="account-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="primary-button"
            type="submit"
            disabled={
              !configured || loading || !email.trim() || password.length < 6
            }
          >
            {loading
              ? isSignup
                ? "Creating your account…"
                : "Signing you in…"
              : isSignup
                ? "Create account"
                : "Sign in"}
            {!loading && <ArrowIcon />}
          </button>
        </form>
        <p className="account-switch">
          {isSignup ? "Already have an account?" : "New to LinkedOut?"}{" "}
          <a href={isSignup ? "#/signin" : "#/signup"}>
            {isSignup ? "Sign in" : "Create an account"}
          </a>
        </p>
      </div>
      <div className="account-aside">
        <span className="eyebrow">
          <span className="eyebrow-dot" /> HONEST STORIES, PRIVATE BY DEFAULT
        </span>
        <h2>A handle is what the room sees. Your identity stays yours.</h2>
        <p>
          We verify email addresses to protect accounts. Your profile and
          stories use your chosen username, never your email.
        </p>
        <a className="text-link" href="#/about">
          Read our promise <ArrowIcon />
        </a>
      </div>
    </section>
  );
}
