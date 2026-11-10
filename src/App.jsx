import { useEffect, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { AccountPage } from "./components/pages/Account.jsx";
import { AboutPage } from "./components/pages/About.jsx";
import { firebaseConfigured } from "./lib/firebase-config.js";
import { Header } from "./components/layout/Header.jsx";
import { Footer } from "./components/layout/Footer.jsx";
import { Home } from "./components/home/Home.jsx";
import { Feed } from "./components/stories/Feed.jsx";
import { VerificationPage } from "./components/pages/Verification.jsx";
import { ProfilePage } from "./components/pages/Profile.jsx";
import "./App.css";

function getCurrentRoute() {
  const route = window.location.hash.replace(/^#\/?/, "").split("?")[0];
  return ["about", "signin", "signup", "verify", "profile"].includes(route)
    ? route
    : "home";
}

function pendingUsernameKey(uid) {
  return `linkedout-pending-username-${uid}`;
}

function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem("linkedout-theme");
    if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });
  const [authUser, setAuthUser] = useState(null);
  const [firebaseApi, setFirebaseApi] = useState(null);
  const [authLoading, setAuthLoading] = useState(firebaseConfigured);
  const [accountLoading, setAccountLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authStatus, setAuthStatus] = useState("");
  const [route, setRoute] = useState(getCurrentRoute);
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [outcome, setOutcome] = useState("quit");
  const [postLoading, setPostLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(firebaseConfigured);
  const [filter, setFilter] = useState("all");
  const [notice, setNotice] = useState(null);
  const [firebaseError, setFirebaseError] = useState("");

  useEffect(() => {
    function updateRoute() {
      setRoute(getCurrentRoute());
    }
    window.addEventListener("hashchange", updateRoute);
    return () => window.removeEventListener("hashchange", updateRoute);
  }, []);

  useEffect(() => {
    if (!firebaseConfigured) return undefined;
    let active = true;
    let unsubscribe = () => {};

    import("./lib/firebase.js")
      .then((api) => {
        if (!active) return;
        setFirebaseApi(api);
        unsubscribe = api.subscribeToUser(
          (user) => {
            if (!active) return;
            setAuthUser(user);
            if (!user?.emailVerified) setUsername("");
            if (user && ["signin", "signup"].includes(getCurrentRoute())) {
              setRoute(user.emailVerified ? "home" : "verify");
            }
            setFirebaseError("");
            setAuthLoading(false);
          },
          (error) => {
            if (active) {
              const message = api.getAuthErrorMessage(error);
              setFirebaseError(message);
              setNotice({
                type: "error",
                text: `Could not connect to your account: ${message}`,
              });
              setAuthLoading(false);
              setPostsLoading(false);
            }
          },
        );
      })
      .catch((error) => {
        if (active) {
          setFirebaseError(error.message);
          setNotice({
            type: "error",
            text: `Could not load Firebase: ${error.message}`,
          });
          setAuthLoading(false);
          setPostsLoading(false);
        }
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authUser || !authUser.emailVerified || !firebaseApi) {
      return undefined;
    }

    let active = true;
    firebaseApi
      .getUserProfile(authUser.uid)
      .then((profile) => {
        if (!active) return;
        const profileUsername = profile?.username || "";
        setUsername(profileUsername);
        setUsernameInput(
          profileUsername ||
            window.localStorage.getItem(pendingUsernameKey(authUser.uid)) ||
            "",
        );
      })
      .catch((error) => {
        if (active) {
          setNotice({
            type: "error",
            text: `Could not load your profile: ${firebaseApi.getFirestoreErrorMessage(error)}`,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [authUser, firebaseApi]);

  useEffect(() => {
    if (!firebaseApi) return undefined;

    const unsubscribe = firebaseApi.subscribeToPosts(
      (items) => {
        setPosts(items);
        setFirebaseError("");
        setPostsLoading(false);
      },
      (error) => {
        const message = firebaseApi.getFirestoreErrorMessage(error);
        setFirebaseError(message);
        setNotice({
          type: "error",
          text: `Could not load stories: ${message}`,
        });
        setPostsLoading(false);
      },
    );
    return unsubscribe;
  }, [firebaseApi]);

  const storyCharactersRemaining = Math.max(0, 20 - message.trim().length);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("linkedout-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
  }

  function navigate(nextRoute) {
    const nextHash = `#/${nextRoute}`;
    if (window.location.hash === nextHash) {
      setRoute(nextRoute);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.location.hash = nextHash;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function continueWithVerifiedAccount(user) {
    const profile = await firebaseApi.getUserProfile(user.uid);
    if (profile?.username) {
      window.localStorage.removeItem(pendingUsernameKey(user.uid));
      setUsername(profile.username);
      setUsernameInput(profile.username);
      navigate("home");
      return;
    }

    const pendingUsername =
      window.localStorage.getItem(pendingUsernameKey(user.uid)) || "";
    if (!pendingUsername) {
      setUsernameInput("");
      navigate("profile");
      return;
    }

    try {
      const claimed = await firebaseApi.claimUsername(user.uid, pendingUsername);
      window.localStorage.removeItem(pendingUsernameKey(user.uid));
      setUsername(claimed);
      setUsernameInput(claimed);
      navigate("home");
    } catch (error) {
      setUsernameInput(pendingUsername);
      setAuthError(firebaseApi.getFirestoreErrorMessage(error));
      navigate("profile");
    }
  }

  async function handleAccountSubmit(event) {
    event.preventDefault();
    if (!firebaseApi) return;
    setAccountLoading(true);
    setAuthError("");
    setAuthStatus("");
    try {
      if (route === "signup") {
        const credential = await firebaseApi.createAccount(email, password);
        setEmail("");
        setPassword("");
        const requestedUsername = usernameInput.trim().toLowerCase();
        window.localStorage.setItem(
          pendingUsernameKey(credential.user.uid),
          requestedUsername,
        );
        navigate("verify");
        try {
          await firebaseApi.sendVerificationEmail(credential.user);
          setAuthStatus(
            `We sent a verification link to ${credential.user.email}. Verify your email to claim @${requestedUsername}.`,
          );
        } catch (error) {
          setAuthError(firebaseApi.getAuthErrorMessage(error));
        }
      } else {
        const credential = await firebaseApi.signIn(email, password);
        setEmail("");
        setPassword("");
        if (!credential.user.emailVerified) {
          navigate("verify");
          setAuthStatus(
            `Please verify ${credential.user.email} before continuing.`,
          );
          return;
        }

        await continueWithVerifiedAccount(credential.user);
      }
    } catch (error) {
      setAuthError(firebaseApi.getAuthErrorMessage(error));
    } finally {
      setAccountLoading(false);
    }
  }

  async function handleVerificationCheck() {
    if (!authUser || !firebaseApi) return;
    setAccountLoading(true);
    setAuthError("");
    try {
      const refreshedUser = await firebaseApi.refreshUser(authUser);
      setAuthUser(refreshedUser);
      if (!refreshedUser.emailVerified) {
        setAuthError(
          "Your email is not verified yet. Check your inbox, then try again.",
        );
        return;
      }

      await continueWithVerifiedAccount(refreshedUser);
    } catch (error) {
      setAuthError(firebaseApi.getAuthErrorMessage(error));
    } finally {
      setAccountLoading(false);
    }
  }

  async function handleResendVerification() {
    if (!authUser || !firebaseApi) return;
    setAccountLoading(true);
    setAuthError("");
    setAuthStatus("");
    try {
      await firebaseApi.sendVerificationEmail(authUser);
      setAuthStatus(
        `A new verification link is on its way to ${authUser.email}.`,
      );
    } catch (error) {
      setAuthError(firebaseApi.getAuthErrorMessage(error));
    } finally {
      setAccountLoading(false);
    }
  }

  async function handleUsernameSubmit(event) {
    event.preventDefault();
    if (!authUser || !firebaseApi || !authUser.emailVerified) return;
    setUsernameLoading(true);
    setAuthError("");
    try {
      const claimed = await firebaseApi.claimUsername(
        authUser.uid,
        usernameInput,
      );
      window.localStorage.removeItem(pendingUsernameKey(authUser.uid));
      setUsername(claimed);
      setUsernameInput(claimed);
      setNotice({
        type: "success",
        text: `You're in as @${claimed}. Your email stays private.`,
      });
      navigate("home");
    } catch (error) {
      setAuthError(firebaseApi.getFirestoreErrorMessage(error));
    } finally {
      setUsernameLoading(false);
    }
  }

  async function handleLogout() {
    if (!firebaseApi) return;
    setAccountLoading(true);
    try {
      await firebaseApi.signOutUser();
      setUsername("");
      setUsernameInput("");
      setEmail("");
      setPassword("");
      setNotice({ type: "success", text: "You’ve been signed out." });
      navigate("home");
    } catch (error) {
      setNotice({
        type: "error",
        text: `Could not sign out: ${firebaseApi.getAuthErrorMessage(error)}`,
      });
    } finally {
      setAccountLoading(false);
    }
  }

  async function handlePostSubmit(event) {
    event.preventDefault();
    if (!authUser || !username || !firebaseApi) return;
    setPostLoading(true);
    setNotice(null);
    try {
      await firebaseApi.createPost({
        username,
        company,
        message,
        outcome,
      });
      setCompany("");
      setMessage("");
      setNotice({
        type: "success",
        text: "Your story is out there. The form is ready whenever you want to share another.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        text: `Your story could not be published: ${firebaseApi.getFirestoreErrorMessage(error)}`,
      });
    } finally {
      setPostLoading(false);
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="app-shell">
        <Header
          authUser={authUser}
          username={username}
          accountLoading={accountLoading}
          handleLogout={handleLogout}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        <main>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={route}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {route === "about" ? (
                <AboutPage />
              ) : route === "signin" || route === "signup" ? (
                <AccountPage
                  mode={route}
                  email={email}
                  onEmailChange={setEmail}
                  password={password}
                  onPasswordChange={setPassword}
                  username={usernameInput}
                  onUsernameChange={setUsernameInput}
                  configured={firebaseConfigured}
                  connectionError={firebaseError}
                  loading={accountLoading || !firebaseApi}
                  error={authError}
                  onSubmit={handleAccountSubmit}
                />
              ) : route === "verify" ? (
                <VerificationPage
                  authUser={authUser}
                  authStatus={authStatus}
                  authError={authError}
                  firebaseError={firebaseError}
                  accountLoading={accountLoading}
                  handleVerificationCheck={handleVerificationCheck}
                  handleResendVerification={handleResendVerification}
                />
              ) : route === "profile" ? (
                <ProfilePage
                  firebaseError={firebaseError}
                  authUser={authUser}
                  usernameInput={usernameInput}
                  setUsernameInput={setUsernameInput}
                  authError={authError}
                  usernameLoading={usernameLoading}
                  handleUsernameSubmit={handleUsernameSubmit}
                />
              ) : (
                <>
                  <Home
                    authLoading={authLoading}
                    authUser={authUser}
                    username={username}
                    company={company}
                    setCompany={setCompany}
                    outcome={outcome}
                    setOutcome={setOutcome}
                    message={message}
                    setMessage={setMessage}
                    storyCharactersRemaining={storyCharactersRemaining}
                    postLoading={postLoading}
                    handlePostSubmit={handlePostSubmit}
                  />

                  {notice && (
                    <div
                      className={`notice notice-${notice.type}`}
                      role={notice.type === "error" ? "alert" : "status"}
                    >
                      <span>{notice.type === "error" ? "!" : "✓"}</span>
                      <p>{notice.text}</p>
                      <button
                        type="button"
                        aria-label="Dismiss message"
                        onClick={() => setNotice(null)}
                      >
                        ×
                      </button>
                    </div>
                  )}

                  <Feed
                    posts={posts}
                    filter={filter}
                    setFilter={setFilter}
                    postsLoading={postsLoading}
                    firebaseError={firebaseError}
                    firebaseConfigured={firebaseConfigured}
                    username={username}
                    firebaseApi={firebaseApi}
                  />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}

export default App;
