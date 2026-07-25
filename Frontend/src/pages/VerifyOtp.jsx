import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Email arrives via navigation state from the Signup page.
  // If someone lands here directly (e.g. page refresh), send them back to signup.
  const emailFromSignup = location.state?.email || "";

  const [email] = useState(emailFromSignup);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!emailFromSignup) {
      navigate("/signup", { replace: true });
    }
  }, [emailFromSignup, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/verify-email", { email, otp });
      // Backend returns { user, token } on success — log the user straight in.
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    setResending(true);

    try {
      await api.post("/auth/resend-otp", { email });
      setSuccess("A new OTP has been sent to your email.");
      setCooldown(30);
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="page">
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="auth-title">Verify your email</div>
          <div className="auth-sub">
            We sent a 6-digit code to <strong>{email}</strong>
          </div>

          {error && <div className="error-box">{error}</div>}
          {success && <div className="success-box">{success}</div>}

          <form onSubmit={handleVerify}>
            <div className="field">
              <label htmlFor="otp">Verification code</label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="otp-input"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                required
              />
              <div className="field-hint">Code expires in 10 minutes.</div>
            </div>

            <button
              type="submit"
              className="btn-signal btn-block"
              disabled={loading || otp.length !== 6}
            >
              {loading && <span className="spinner"></span>}
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          <div className="auth-footer">
            Didn't get the code?{" "}
            <button
              className="link-btn"
              onClick={handleResend}
              disabled={resending || cooldown > 0}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
            </button>
          </div>
        </div>
      </div>
      <footer className="app-footer">AI Repo Auditor</footer>
    </div>
  );
}
