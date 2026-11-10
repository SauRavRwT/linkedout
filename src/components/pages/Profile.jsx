import { ArrowIcon } from "../shared/Icons.jsx";
import "./Account.css";

export function ProfilePage({
  firebaseError,
  authUser,
  usernameInput,
  setUsernameInput,
  authError,
  usernameLoading,
  handleUsernameSubmit,
}) {
  return (
    <section className="account-page single-account-page">
      <div className="glass-panel account-card">
        <div className="panel-icon" aria-hidden="true">
          @
        </div>
        <p className="panel-kicker">MAKE IT YOURS</p>
        <h1>Choose your unique handle.</h1>
        <p className="panel-description">
          This is the name people will see beside your stories. Your email stays
          private.
        </p>
        {firebaseError && (
          <p className="account-error" role="alert">
            {firebaseError}
          </p>
        )}
        <form
          className="form-stack account-form"
          onSubmit={handleUsernameSubmit}
        >
          <label htmlFor="profile-username">Username</label>
          <div className="input-wrap handle-input account-handle-input">
            <span aria-hidden="true">@</span>
            <input
              id="profile-username"
              name="username"
              autoComplete="username"
              maxLength={20}
              minLength={3}
              pattern="[A-Za-z0-9_]{3,20}"
              placeholder="quietly_done"
              value={usernameInput}
              onChange={(event) => setUsernameInput(event.target.value)}
              required
              disabled={!authUser?.emailVerified || usernameLoading}
            />
          </div>
          <p className="field-hint">
            3–20 letters, numbers, or underscores. Usernames are unique and
            can’t be changed.
          </p>
          {authError && (
            <p className="account-error" role="alert">
              {authError}
            </p>
          )}
          {!authUser?.emailVerified ? (
            <a className="primary-button" href="#/verify">
              Verify your email first <ArrowIcon />
            </a>
          ) : (
            <button
              className="primary-button"
              type="submit"
              disabled={usernameLoading || !usernameInput.trim()}
            >
              {usernameLoading ? "Checking availability…" : "Continue"}
              {!usernameLoading && <ArrowIcon />}
            </button>
          )}
        </form>
      </div>
    </section>
  );
}
