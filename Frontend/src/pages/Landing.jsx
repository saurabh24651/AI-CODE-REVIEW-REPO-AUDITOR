import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import ssLogo from "../assets/ss-logo.png";

// The terminal preview is broken into its own component since it's a
// self-contained, reusable "proof" widget — not tied to landing-page state.
function TerminalPreview() {
  return (
    <div className="terminal">
      <div className="terminal-bar">
        <div className="terminal-dot"></div>
        <div className="terminal-dot"></div>
        <div className="terminal-dot"></div>
        <span className="mono terminal-label">audit-preview.log</span>
      </div>
      <div className="terminal-body mono">
        <div className="term-line">
          <span className="term-file">objectIs.js</span>
          <span className="term-status term-pass">
            <span className="status-icon">✓</span>
            <span className="term-score">9.4</span>
          </span>
        </div>
        <div className="term-line">
          <span className="term-file">shallowEqual.js</span>
          <span className="term-status term-warn">
            <span className="status-icon">⚠</span>
            <span className="term-score">7.1</span>
          </span>
        </div>
        <div className="term-line">
          <span className="term-file">legacyHelpers.js</span>
          <span className="term-status term-fail">
            <span className="status-icon">✕</span>
            <span className="term-score">3.2</span>
          </span>
        </div>
        <div className="term-scanning">
          scanning next file<span className="cursor"></span>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [repoUrl, setRepoUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // The audit endpoint is protected, so route accordingly.
    navigate(isAuthenticated ? "/dashboard" : "/signup");
  };

  return (
    <div className="page">
      <div style={{ padding: "24px" }}>
        <div className="hero-stage">
          {/* Ambient backdrop — ring/sweep now sit behind the terminal, not as the main focal point */}
          <div className="scan-field">
            <div className="grid-overlay"></div>
            <div className="scan-rings">
              <div className="ring"></div>
              <div className="ring r2"></div>
              <div className="ring r3"></div>
              <div className="ring r4"></div>
              <div className="sweep"></div>
            </div>
          </div>

          <nav className="topbar hero-nav" style={{ borderBottom: "none" }}>
            <div className="logo">
              <div className="logo-mark">AI</div>
              Repo<span className="dim">Auditor</span>
            </div>
            <div className="nav-links">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-signal">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost">
                    Login
                  </Link>
                  <Link to="/signup" className="btn-signal">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>

          <section className="hero-section" style={{ textAlign: "center", padding: "88px 24px 0" }}>
            <div className="mono hero-eyebrow">
              <span className="dot"></span>
              Powered by AI code review
            </div>

            <h1 className="mono hero-h1">
              Your code has opinions.{" "}
              <span style={{ color: "var(--signal)" }}>So do we.</span>
            </h1>

            <p className="hero-sub">
              Paste any public GitHub repo. Get a real review of bugs,
              bad practices, and what a senior engineer would actually flag —
              in seconds, not sprints.
            </p>

            <form onSubmit={handleSubmit} className="hero-form">
              <span className="mono prompt-tick" style={{ color: "var(--text-low)", fontSize: "14px" }}>
                &gt;
              </span>
              <input
                type="text"
                className="mono"
                placeholder="github.com/owner/repository"
                aria-label="GitHub repository URL"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
              />
              <button type="submit" className="btn-signal">
                Submit for Audit
              </button>
            </form>

            <div className="mono" style={{ marginTop: "14px", fontSize: "12px", color: "var(--text-low)" }}>
              {isAuthenticated
                ? "ready when you are"
                : "sign up required to run an audit"}
            </div>

            <TerminalPreview />
          </section>

          <div className="hero-stats" style={{ paddingTop: "56px" }}>
            <div>
              <div className="mono hero-stat-num">
                <span style={{ color: "var(--signal)" }}>10K+</span>
              </div>
              <div className="hero-stat-label">Files Audited</div>
            </div>
            <div>
              <div className="mono hero-stat-num">4.2s</div>
              <div className="hero-stat-label">Avg. Review Time</div>
            </div>
            <div>
              <div className="mono hero-stat-num">
                <span style={{ color: "var(--signal)" }}>0</span>
              </div>
              <div className="hero-stat-label">Setup Required</div>
            </div>
          </div>
        </div>
      </div>
      <footer className="app-footer footer-branded">
        <img src={ssLogo} alt="SS Design logo" className="footer-logo" />
        <span>SS Design | AI Repo Auditor</span>
      </footer>
    </div>
  );
}
