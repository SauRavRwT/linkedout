import { ArrowIcon } from "../shared/Icons.jsx";
import "./About.css";

export function AboutPage() {
  return (
    <section className="about-page">
      <div className="about-hero">
        <p className="eyebrow">
          <span className="eyebrow-dot" /> A NOTE FROM US
        </p>
        <h1>Some things are easier to say after you’ve left.</h1>
        <p>
          LinkedOut is a place for the truth behind the goodbye: the moments
          that didn’t fit in an exit interview, shared with people who get it.
        </p>
      </div>
      <div className="about-principles">
        <article className="glass-panel about-principle">
          <span>01</span>
          <h2>Use a handle, not your real name.</h2>
          <p>
            Your chosen username appears on stories and replies. Your email is
            used to secure your account and verify it; it is not shown publicly.
          </p>
        </article>
        <article className="glass-panel about-principle">
          <span>02</span>
          <h2>Speak from your own experience.</h2>
          <p>
            Leave out names and identifying details—yours, your coworkers’, and
            your employer’s people. Be honest without putting someone at risk.
          </p>
        </article>
        <article className="glass-panel about-principle">
          <span>03</span>
          <h2>Take care of each other.</h2>
          <p>
            Stories and replies are public. Keep the conversation thoughtful,
            respect different experiences, and share only what you’re
            comfortable making public.
          </p>
        </article>
      </div>
      <a className="text-link about-return" href="#/home">
        Back to the stories <ArrowIcon />
      </a>
    </section>
  );
}
