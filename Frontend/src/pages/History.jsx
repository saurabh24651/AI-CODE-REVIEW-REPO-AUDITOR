import { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import api from "../api/axios.js";

function scoreClass(score) {
  if (score >= 8) return "score-high";
  if (score >= 5) return "score-mid";
  return "score-low";
}

export default function History() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/audit/history");
        setAudits(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="page">
      <Navbar />
      <div className="container">
        <div className="page-header">
          <div className="page-title mono">Audit History</div>
          <div className="page-sub">Every repo you've audited, most recent first.</div>
        </div>

        <div style={{ marginTop: "24px", marginBottom: "40px" }}>
          {loading && <div className="loading-state">Loading history...</div>}

          {error && <div className="error-box">{error}</div>}

          {!loading && !error && audits.length === 0 && (
            <div className="empty-state">
              No audits yet. Run your first one from the Audit page.
            </div>
          )}

          {!loading &&
            audits.map((audit) => (
              <div key={audit._id}>
                <div
                  className="history-item"
                  onClick={() => toggleExpand(audit._id)}
                >
                  <div>
                    <div className="history-meta">
                      {audit.repoUrl}/{audit.filePath}
                    </div>
                    <div className="history-date">
                      {new Date(audit.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <span
                    className={`score-badge mono ${scoreClass(
                      audit.review?.qualityScore
                    )}`}
                  >
                    {audit.review?.qualityScore ?? "—"}/10
                  </span>
                </div>

                {expandedId === audit._id && (
                  <div className="review-card" style={{ marginTop: "-4px" }}>
                    <div className="review-section">
                      <div className="review-section-title">Bugs</div>
                      {audit.review?.bugs?.length ? (
                        <ul className="review-list">
                          {audit.review.bugs.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="empty-note">No bugs found.</div>
                      )}
                    </div>

                    <div className="review-section">
                      <div className="review-section-title">Bad Practices</div>
                      {audit.review?.badPractices?.length ? (
                        <ul className="review-list">
                          {audit.review.badPractices.map((b, i) => (
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
                        {audit.review?.suggestions?.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
      <footer className="app-footer">AI Repo Auditor</footer>
    </div>
  );
}
