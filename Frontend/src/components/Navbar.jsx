import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="topbar">
      <Link to="/" className="logo">
        <div className="logo-mark">AI</div>
        Repo<span className="dim">Auditor</span>
      </Link>

      {isAuthenticated ? (
        <div className="nav-links">
          <Link
            to="/dashboard"
            className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
          >
            Audit
          </Link>
          <Link
            to="/history"
            className={`nav-link ${isActive("/history") ? "active" : ""}`}
          >
            History
          </Link>
          <span className="nav-link mono" style={{ color: "var(--text-low)" }}>
            {user?.name}
          </span>
          <button className="btn-ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <div className="nav-links">
          <Link to="/login" className="btn-ghost">
            Login
          </Link>
          <Link to="/signup" className="btn-signal">
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
}
