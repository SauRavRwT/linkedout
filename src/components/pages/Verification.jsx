import { ArrowIcon } from "../shared/Icons.jsx";
import "./Account.css";

export function VerificationPage({
  authUser,
  authStatus,
  authError,
  firebaseError,
  accountLoading,
  handleVerificationCheck,
  handleResendVerification,
}) {
  return (
    <section className="account-page single-account-page">
      <div className="glass-panel account-card">
        <div className="panel-icon" aria-hidden="true">
          ✉
        </div>
        <p className="panel-kicker">ONE QUICK CHECK</p>
        <h1>Verify your email.</h1>
        <p className="panel-description">
          {authUser
            ? `Open the link we sent to ${authUser.email}. Your email stays private and won’t appear with your stories.`
            : "Sign in with the email you registered to continue verifying your account."}
        </p>
        {authStatus && (
          <p className="account-status" role="status">
            {authStatus}
          </p>
        )}
        {authError && (
          <p className="account-error" role="alert">
            {authError}
          </p>
        )}
        {firebaseError && (
          <p className="account-error" role="alert">
            {firebaseError}
          </p>
        )}
        {authUser ? (
          <div className="form-stack">
            <button
              className="primary-button"
              type="button"
              onClick={handleVerificationCheck}
              disabled={accountLoading}
              style={{ marginBottom: "0.5rem" }}
            >
              {accountLoading
                ? "Checking verification…"
                : "I’ve verified my email"}
              {!accountLoading && <ArrowIcon />}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={handleResendVerification}
              disabled={accountLoading}
            >
              Resend verification email
            </button>
          </div>
        ) : (
          <a className="primary-button" href="#/signin">
            Go to sign in <ArrowIcon />
          </a>
        )}
      </div>
    </section>
  );
}
