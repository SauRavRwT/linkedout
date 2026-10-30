import { useEffect, useMemo, useState } from 'react'
import { firebaseConfigured } from './lib/firebase-config.js'
import './App.css'

const filters = [
  { value: 'all', label: 'All stories' },
  { value: 'quit', label: 'I quit' },
  { value: 'fired', label: 'I was let go' },
]

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none">
        <path d="M7 16h16M17 9l7 7-7 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 6.5h22v19H5z" stroke="currentColor" strokeWidth="1.5" opacity=".38" />
      </svg>
    </span>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4.2 10h11.6m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ThemeIcon({ theme }) {
  return theme === 'dark' ? (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="3.3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 2.5v1.7m0 11.6v1.7M17.5 10h-1.7M4.2 10H2.5m12.8-5.3-1.2 1.2M5.9 14.1l-1.2 1.2m10.6 0-1.2-1.2M5.9 5.9 4.7 4.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M16.4 12.2A6.7 6.7 0 0 1 7.8 3.6a6.8 6.8 0 1 0 8.6 8.6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="m13.8 3 .4 1.2 1.2.4-1.2.4-.4 1.2-.4-1.2-1.2-.4 1.2-.4.4-1.2Z" fill="currentColor" />
    </svg>
  )
}

function formatDate(timestamp) {
  if (!timestamp?.toDate) return 'Just now'
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(timestamp.toDate())
}

function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem('linkedout-theme')
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [authUser, setAuthUser] = useState(null)
  const [firebaseApi, setFirebaseApi] = useState(null)
  const [authLoading, setAuthLoading] = useState(firebaseConfigured)
  const [username, setUsername] = useState('')
  const [usernameInput, setUsernameInput] = useState('')
  const [usernameLoading, setUsernameLoading] = useState(false)
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')
  const [outcome, setOutcome] = useState('quit')
  const [postLoading, setPostLoading] = useState(false)
  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(firebaseConfigured)
  const [filter, setFilter] = useState('all')
  const [notice, setNotice] = useState(null)
  const [firebaseError, setFirebaseError] = useState('')
  const [authAttempt, setAuthAttempt] = useState(0)

  useEffect(() => {
    if (!firebaseConfigured) return undefined
    let active = true
    let unsubscribe = () => {}

    import('./lib/firebase.js')
      .then((api) => {
        if (!active) return
        setFirebaseApi(api)
        unsubscribe = api.subscribeToAnonymousUser(
          async (user) => {
            if (!active) return
            setAuthUser(user)
            setFirebaseError('')
            try {
              const profile = await api.getUserProfile(user.uid)
              if (active && profile) {
                setUsername(profile.username)
                setUsernameInput(profile.username)
              }
            } catch (error) {
              if (active) {
                setNotice({ type: 'error', text: `Could not load your profile: ${api.getFirestoreErrorMessage(error)}` })
              }
            } finally {
              if (active) setAuthLoading(false)
            }
          },
          (error) => {
            if (active) {
              const message = api.getAuthErrorMessage(error)
              setFirebaseError(message)
              setNotice({ type: 'error', text: `Could not start an anonymous session: ${message}` })
              setAuthLoading(false)
              setPostsLoading(false)
            }
          },
        )
      })
      .catch((error) => {
        if (active) {
          setFirebaseError(error.message)
          setNotice({ type: 'error', text: `Could not load Firebase: ${error.message}` })
          setAuthLoading(false)
          setPostsLoading(false)
        }
      })

    return () => {
      active = false
      unsubscribe()
    }
  }, [authAttempt])

  useEffect(() => {
    if (!firebaseApi) return undefined

    const unsubscribe = firebaseApi.subscribeToPosts(
      (items) => {
        setPosts(items)
        setFirebaseError('')
        setPostsLoading(false)
      },
      (error) => {
        const message = firebaseApi.getFirestoreErrorMessage(error)
        setFirebaseError(message)
        setNotice({ type: 'error', text: `Could not load stories: ${message}` })
        setPostsLoading(false)
      },
    )
    return unsubscribe
  }, [firebaseApi])

  const filteredPosts = useMemo(
    () => (filter === 'all' ? posts : posts.filter((post) => post.outcome === filter)),
    [filter, posts],
  )
  const storyCharactersRemaining = Math.max(0, 20 - message.trim().length)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('linkedout-theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme((currentTheme) => currentTheme === 'light' ? 'dark' : 'light')
  }

  async function handleUsernameSubmit(event) {
    event.preventDefault()
    if (!authUser || !firebaseApi) return
    setUsernameLoading(true)
    setNotice(null)
    try {
      const claimed = await firebaseApi.claimUsername(authUser.uid, usernameInput)
      setUsername(claimed)
      setUsernameInput(claimed)
      setNotice({ type: 'success', text: `You're in as @${claimed}. Your real identity stays out of it.` })
    } catch (error) {
      setNotice({ type: 'error', text: firebaseApi.getFirestoreErrorMessage(error) })
    } finally {
      setUsernameLoading(false)
    }
  }

  function retryAnonymousSession() {
    setNotice(null)
    setFirebaseError('')
    setAuthLoading(true)
    setPostsLoading(true)
    setAuthAttempt((attempt) => attempt + 1)
  }

  async function handlePostSubmit(event) {
    event.preventDefault()
    if (!authUser || !username || !firebaseApi) return
    setPostLoading(true)
    setNotice(null)
    try {
      await firebaseApi.createPost({
        username,
        company,
        message,
        outcome,
      })
      setCompany('')
      setMessage('')
      setNotice({ type: 'success', text: 'Your story is out there. The form is ready whenever you want to share another.' })
    } catch (error) {
      setNotice({ type: 'error', text: `Your story could not be published: ${firebaseApi.getFirestoreErrorMessage(error)}` })
    } finally {
      setPostLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="LinkedOut home">
          <BrandMark />
          <span>linked<span className="brand-light">out</span></span>
        </a>
        <nav className="top-nav" aria-label="Main navigation">
          <a href="#stories">The stories</a>
          <a href="#about">Our promise</a>
        </nav>
        <div className="topbar-end">
          {username ? (
            <span className="handle-pill"><span className="online-dot" /> @{username}</span>
          ) : (
            <a className="nav-cta" href="#join">Join anonymously <ArrowIcon /></a>
          )}
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            aria-pressed={theme === 'dark'}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            <ThemeIcon theme={theme} />
          </button>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> THE EXIT INTERVIEW, AFTER THE EXIT</div>
            <h1>The truth doesn’t fit in an <span>exit interview.</span></h1>
            <p className="hero-description">
              The unfiltered stories behind the jobs we left — and the ones that let us go.
              No names. No career-polished answers. Just the truth.
            </p>
            <a className="text-link" href="#stories">Read the stories <ArrowIcon /></a>
            <div className="hero-proof">
              <div className="avatar-stack" aria-hidden="true">
                <span>✳</span><span>↗</span><span>◒</span><span>+</span>
              </div>
              <span>A little less alone, one story at a time.</span>
            </div>
          </div>

          <div className="glass-panel join-panel" id="join">
            {!firebaseConfigured ? (
              <div className="setup-state">
                <div className="panel-icon setup-icon" aria-hidden="true">✦</div>
                <p className="panel-kicker">ONE LAST THING</p>
                <h2>Connect the story room.</h2>
                <p className="panel-description">
                  Add your Firebase web app settings to <code>.env</code> to enable anonymous accounts and the live story feed.
                </p>
                <span className="setup-tag">Firebase setup required</span>
              </div>
            ) : !username ? (
              <>
                <div className="panel-heading">
                  <div className="panel-icon" aria-hidden="true">✳</div>
                  <span className="step-count">01 / 02</span>
                </div>
                <p className="panel-kicker">YOUR NAME, NOT YOUR NAME</p>
                <h2>Come as you are.<br />Leave your name at the door.</h2>
                <p className="panel-description">Pick a one-of-a-kind handle. No email, password, or LinkedIn profile required.</p>
                <form className="form-stack" onSubmit={handleUsernameSubmit}>
                  <label htmlFor="username">Your anonymous handle</label>
                  <div className="input-wrap handle-input">
                    <span aria-hidden="true">@</span>
                    <input
                      id="username"
                      name="username"
                      autoComplete="off"
                      maxLength={20}
                      minLength={3}
                      pattern="[A-Za-z0-9_]{3,20}"
                      placeholder="quietly_done"
                      value={usernameInput}
                      onChange={(event) => setUsernameInput(event.target.value)}
                      required
                      disabled={authLoading || !authUser}
                    />
                  </div>
                  <p className="field-hint">3–20 characters · letters, numbers, and underscores</p>
                  <button
                    className="primary-button"
                    type={authUser ? 'submit' : 'button'}
                    onClick={!authUser && !authLoading ? retryAnonymousSession : undefined}
                    disabled={authLoading || (authUser && (usernameLoading || !usernameInput.trim()))}
                  >
                    {authLoading ? 'Starting a private session…' : !authUser ? 'Retry private session' : usernameLoading ? 'Checking availability…' : 'Find my people'}
                    {!authLoading && authUser && !usernameLoading && <ArrowIcon />}
                  </button>
                </form>
                <p className="privacy-note"><span>◇</span> Your handle is the only thing that identifies you here.</p>
              </>
            ) : (
              <>
                <div className="panel-heading">
                  <div className="panel-icon" aria-hidden="true">↗</div>
                  <span className="step-count">02 / 02</span>
                </div>
                <p className="panel-kicker">LET IT OUT</p>
                <h2>Your side of the story.</h2>
                <p className="panel-description">Keep it honest. Keep it anonymous. Leave out names and details that could identify a person. There’s no one-story limit; the form clears after each post so you can share another.</p>
                <form className="form-stack post-form" onSubmit={handlePostSubmit}>
                  <label htmlFor="company">Company <span className="label-optional">— as you remember it</span></label>
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
                      <label className={`outcome-option ${outcome === 'quit' ? 'selected' : ''}`}>
                        <input type="radio" name="outcome" value="quit" checked={outcome === 'quit'} onChange={() => setOutcome('quit')} />
                        <span className="radio-dot" /> I quit
                      </label>
                      <label className={`outcome-option ${outcome === 'fired' ? 'selected' : ''}`}>
                        <input type="radio" name="outcome" value="fired" checked={outcome === 'fired'} onChange={() => setOutcome('fired')} />
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
                        ? `${storyCharactersRemaining} more ${storyCharactersRemaining === 1 ? 'character' : 'characters'} needed to share`
                        : 'Ready to share'}
                    </span>
                    <span>{message.trim().length} / 2,000</span>
                  </div>
                  <button className="primary-button" type="submit" disabled={postLoading || !company.trim() || message.trim().length < 20}>
                    {postLoading ? 'Sharing your story…' : 'Share anonymously'}
                    {!postLoading && <ArrowIcon />}
                  </button>
                </form>
              </>
            )}
          </div>
        </section>

        {notice && (
          <div className={`notice notice-${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>
            <span>{notice.type === 'error' ? '!' : '✓'}</span>
            <p>{notice.text}</p>
            <button type="button" aria-label="Dismiss message" onClick={() => setNotice(null)}>×</button>
          </div>
        )}

        <section className="stories-section" id="stories">
          <div className="section-heading">
            <div>
              <p className="eyebrow section-eyebrow"><span className="eyebrow-dot" /> OUT OF OFFICE, INTO THE OPEN</p>
              <h2>It wasn’t just you.</h2>
              <p className="section-subtitle">A little clarity from people who’ve been there.</p>
            </div>
            <div className="story-count"><span className="count-spark">✳</span>{posts.length} {posts.length === 1 ? 'story' : 'stories'} shared</div>
          </div>

          <div className="feed-layout">
            <div className="feed-column">
              <div className="feed-toolbar">
                <div className="filter-tabs" role="group" aria-label="Filter stories">
                  {filters.map((item) => (
                    <button
                      className={filter === item.value ? 'filter-tab active' : 'filter-tab'}
                      key={item.value}
                      type="button"
                      onClick={() => setFilter(item.value)}
                      aria-pressed={filter === item.value}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <span className="feed-sort">LATEST FIRST <span aria-hidden="true">↘</span></span>
              </div>

              {postsLoading ? (
                <div className="feed-state"><span className="loader" /> Gathering the stories…</div>
              ) : filteredPosts.length ? (
                <div className="story-list">
                  {filteredPosts.map((post) => (
                    <article className="story-card glass-panel" key={post.id}>
                      <div className="story-card-top">
                        <div className="story-author">
                          <span className={`author-avatar avatar-${post.outcome}`} aria-hidden="true">{post.outcome === 'quit' ? '↗' : '✳'}</span>
                          <div><span className="author-name">@{post.username}</span><span className="story-date">{formatDate(post.createdAt)}</span></div>
                        </div>
                        <span className={`outcome-badge badge-${post.outcome}`}>{post.outcome === 'quit' ? 'I quit' : 'I was let go'}</span>
                      </div>
                      <p className="story-company">{post.company}</p>
                      <p className="story-message">{post.message}</p>
                      <div className="story-card-bottom"><span>SHARED ANONYMOUSLY</span><span className="story-spark" aria-hidden="true">✳</span></div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-feed glass-panel">
                  <span className="empty-icon" aria-hidden="true">↗</span>
                  <h3>{firebaseError ? 'Story feed unavailable.' : filter === 'all' ? 'The first story is yours.' : 'No stories in this corner yet.'}</h3>
                  <p>{!firebaseConfigured ? 'Connect a Firebase project to open the story feed. No placeholder stories here — only the real thing.' : firebaseError ? 'The story feed is temporarily unavailable. Check your Firebase configuration and connection, then try again.' : 'This space is new. When someone is ready to share, their words will find a home here.'}</p>
                  {username && <a className="text-link" href="#join">Tell your story <ArrowIcon /></a>}
                </div>
              )}
            </div>

            <aside className="about-card glass-panel" id="about">
              <div className="about-decoration" aria-hidden="true">✳</div>
              <p className="panel-kicker">A NOTE FROM US</p>
              <h3>Some things are easier to say after you’ve left.</h3>
              <p>This is a place for the truth behind the goodbye. Your handle is made up; your story is yours.</p>
              <div className="about-divider" />
              <ul>
                <li><span>01</span>No real names or identifying details.</li>
                <li><span>02</span>Speak from your own experience.</li>
                <li><span>03</span>Take care of each other in here.</li>
              </ul>
              <a href="#join" className="about-link">Make space for your story <ArrowIcon /></a>
            </aside>
          </div>
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#" aria-label="LinkedOut home"><BrandMark /><span>linked<span className="brand-light">out</span></span></a>
        <span>For the stories that don’t make it onto your résumé.</span>
        <span className="footer-note">ANONYMOUS BY DESIGN <span aria-hidden="true">✳</span></span>
      </footer>
    </div>
  )
}

export default App
