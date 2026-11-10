import { motion } from "motion/react";
import { BrandMark, ArrowIcon, ThemeIcon } from "../shared/Icons.jsx";
import "./Header.css";

export function Header({
  authUser,
  username,
  accountLoading,
  handleLogout,
  theme,
  toggleTheme,
}) {
  return (
    <header className="topbar">
      <a className="brand" href="#/home" aria-label="LinkedOut home">
        <BrandMark />
        <span>
          linked<span className="brand-light">out</span>
        </span>
      </a>
      <nav className="top-nav" aria-label="Main navigation">
        <a href="#/home">Home</a>
        <a href="#stories">Stories</a>
        <a href="#/about">About</a>
      </nav>
      <div className="topbar-end">
        {authUser ? (
          <>
            {username && (
              <span className="handle-pill">
                <span className="online-dot" /> @{username}
              </span>
            )}
            <motion.button
              className="nav-logout"
              type="button"
              onClick={handleLogout}
              disabled={accountLoading}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
            >
              {accountLoading ? "Signing out…" : "Log out"}
            </motion.button>
          </>
        ) : (
          <>
            <motion.a
              className="nav-cta"
              href="#/signin"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
            >
              Sign in
            </motion.a>
            <motion.a
              className="nav-signup"
              href="#/signup"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
            >
              Sign up <ArrowIcon />
            </motion.a>
          </>
        )}
        <motion.button
          className="theme-toggle"
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          aria-pressed={theme === "dark"}
          title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          whileHover={{ rotate: 8, scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
        >
          <ThemeIcon theme={theme} />
        </motion.button>
      </div>
    </header>
  );
}
