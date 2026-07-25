import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/signup", form);
      // Backend sends an OTP to the email at this point.
      // Pass the email along so the verify page knows who it's verifying.
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (err) {
      const res = err.response?.data;
      if (res?.errors) {
        setError(res.errors.join(" • "));
      } else {
        setError(res?.message || "Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="auth-title">Create your account</div>
          <div className="auth-sub">Start auditing repos with AI in minutes.</div>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Saurabh Singh"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
              <div className="field-hint">
                8+ characters, 1 uppercase, 2 lowercase, 1 symbol (%@#$&*!)
              </div>
            </div>

            <button
              type="submit"
              className="btn-signal btn-block"
              disabled={loading}
            >
              {loading && <span className="spinner"></span>}
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </div>
      </div>
      <footer className="app-footer">AI Repo Auditor</footer>
    </div>
  );
}
