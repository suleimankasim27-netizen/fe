import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { evaluateApi } from "../../api/client.js";
import { ProgressBar, Skeleton } from "../../components/ui/Display.jsx";

const MESSAGES = {
  INVALID_LINK: "This evaluation link is invalid.",
  REVOKED_LINK: "This evaluation link has been revoked.",
  EXPIRED_LINK: "This evaluation link has expired.",
  EVENT_CLOSED: "This event has been closed.",
};

export default function EvaluatorHome() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    evaluateApi
      .session(token)
      .then(setData)
      .catch((e) => setError(MESSAGES[e.code] || e.message));
  }, [token]);

  if (error) {
    return (
      <Shell>
        <h1>Unable to open evaluation</h1>
        <p>{error}</p>
      </Shell>
    );
  }

  if (!data) {
    return (
      <Shell>
        <Skeleton height={24} width="60%" />
        <div style={{ height: 12 }} />
        <Skeleton height={120} />
      </Shell>
    );
  }

  const closed = data.event.closed;

  return (
    <Shell>
      <p className="kicker">{data.event.name}</p>
      <h1>Welcome, {data.evaluator.name}</h1>
      {closed && <div className="banner">This event has been closed. You can still view submitted evaluations.</div>}
      <div className="progress-card">
        <h2>Your Evaluations</h2>
        <p>
          {data.progress.completed} of {data.progress.total} completed
        </p>
        <ProgressBar value={data.progress.completed} max={data.progress.total || 1} />
      </div>
      <div className="team-list">
        {data.teams.map((team) => (
          <article key={team._id}>
            <div>
              <strong>
                {team.pitchNumber ? `${String(team.pitchNumber).padStart(2, "0")}  ` : ""}
                {team.name}
              </strong>
              <p
                className={
                  team.status === "Completed" ? "done" : team.status === "In progress" ? "progress" : "pending"
                }
              >
                {team.status}
              </p>
              {team.totalScore != null && (
                <p className="score">
                  {team.totalScore} / {data.maxTotal}
                </p>
              )}
            </div>
            <Link to={`/evaluate/${token}/teams/${team._id}`} className="action">
              {team.status === "Pending" ? "Evaluate" : team.status === "In progress" ? "Continue" : "View"}
            </Link>
          </article>
        ))}
        {data.teams.length === 0 && <p className="empty">You have no assigned teams yet.</p>}
      </div>
      <style>{styles}</style>
    </Shell>
  );
}

export function Shell({ children }) {
  return (
    <div className="eval-shell">
      <div className="eval-inner">{children}</div>
      <style>{`
        .eval-shell {
          min-height: 100vh;
          background: #f3f5f8;
        }
        .eval-inner {
          max-width: 560px;
          margin: 0 auto;
          padding: 20px 16px 48px;
        }
      `}</style>
    </div>
  );
}

const styles = `
  .kicker { color: var(--gold); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; font-size: 12px; }
  h1 { font-family: var(--serif); font-size: 1.7rem; margin: 6px 0 16px; }
  .banner { background: var(--warning-soft); color: #7a5410; padding: 12px; border-radius: 10px; margin-bottom: 16px; }
  .progress-card, .team-list article {
    background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 16px; margin-bottom: 12px;
  }
  .progress-card h2 { font-size: 15px; margin-bottom: 4px; }
  .team-list article { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
  .done { color: var(--success); font-weight: 600; font-size: 13px; }
  .progress { color: var(--accent); font-weight: 600; font-size: 13px; }
  .pending { color: var(--warning); font-weight: 600; font-size: 13px; }
  .score { font-size: 14px; }
  .action {
    background: var(--navy); color: #fff; padding: 12px 16px; border-radius: 10px; font-weight: 700; min-width: 96px; text-align: center;
  }
  .empty { color: var(--muted); text-align: center; padding: 24px; }
`;
