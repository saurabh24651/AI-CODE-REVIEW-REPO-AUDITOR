import { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import api from "../api/axios.js";

function scoreClass(score) {
  if (score >= 8) return "score-high";
  if (score >= 5) return "score-mid";
  return "score-low";
}

function ReviewCard({ audit }) {
  const { repoUrl, filePath, review } = audit;

  return (
    <div className="review-card">
      <div className="review-header">
        <span className="review-file mono">
          {repoUrl}/{filePath}
        </span>
        <span className={`score-badge mono ${scoreClass(review.qualityScore)}`}>
          {review.qualityScore}/10
        </span>
      </div>

      <div className="review-section">
        <div className="review-section-title">Bugs</div>
        {review.bugs?.length ? (
          <ul className="review-list">
            {review.bugs.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        ) : (
          <div className="empty-note">No bugs found.</div>
        )}
      </div>

      <div className="review-section">
        <div className="review-section-title">Bad Practices</div>
        {review.badPractices?.length ? (
          <ul className="review-list">
            {review.badPractices.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        ) : (
          <div className="empty-note">None flagged.</div>
        )}
      </div>

      <div className="review-section">
        <div className="review-section-title">Suggestions</div>
        <ul className="review-list">
          {review.suggestions?.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [form, setForm] = useState({ owner: "", repo: "", filePath: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await api.post("/audit", form);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Audit failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Navbar />
      <div className="container">
        <div className="page-header">
          <div className="page-title mono">New Audit</div>
          <div className="page-sub">
            Point at any public GitHub file — get bugs, bad practices, and suggestions back.
          </div>
        </div>

        <div className="audit-form-card">
          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="field">
                <label htmlFor="owner">Repo Owner</label>
                <input
                  id="owner"
                  name="owner"
                  type="text"
                  placeholder="Github-Username"
                  value={form.owner}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="repo">Repo Name</label>
                <input
                  id="repo"
                  name="repo"
                  type="text"
                  placeholder="Github-Repo Name"
                  value={form.repo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field form-row-full">
                <label htmlFor="filePath">File Path</label>
                <input
                  id="filePath"
                  name="filePath"
                  type="text"
                  className="mono"
                  placeholder="packages/shared/objectIs.js"
                  value={form.filePath}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ marginTop: "18px" }}>
              <button type="submit" className="btn-signal" disabled={loading}>
                {loading && <span className="spinner"></span>}
                {loading ? "Auditing..." : "Run Audit"}
              </button>
            </div>
          </form>
        </div>

        {result && <ReviewCard audit={result} />}
      </div>
      <footer className="app-footer">AI Repo Auditor</footer>
    </div>
  );
}
