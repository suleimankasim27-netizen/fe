import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Users, Building2, ClipboardCheck, ArrowRight } from "lucide-react";
import { StatusBadge } from "./Table.jsx";

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function EventCard({ event }) {
  const expected = event.expectedEvaluations || 0;
  const completed = event.completedEvaluations || 0;
  const percent = expected === 0 ? 0 : Math.min(100, Math.round((completed / expected) * 100));
  const dateLabel = formatDate(event.date);
  const status = (event.status || "Draft").toLowerCase();

  return (
    <article className={`event-card status-${status}`}>
      <div className="event-card-accent" />
      <div className="event-card-body">
        <div className="event-card-top">
          <div>
            <h2>{event.name}</h2>
            <div className="event-card-meta">
              {dateLabel && (
                <span>
                  <CalendarDays size={14} />
                  {dateLabel}
                </span>
              )}
              {event.location && (
                <span>
                  <MapPin size={14} />
                  {event.location}
                </span>
              )}
              {!dateLabel && !event.location && event.description && (
                <span className="event-card-desc">{event.description}</span>
              )}
            </div>
          </div>
          <StatusBadge status={event.status} />
        </div>

        <div className="event-card-stats">
          <div className="stat">
            <Building2 size={16} />
            <div>
              <strong>{event.teamCount || 0}</strong>
              <small>Teams</small>
            </div>
          </div>
          <div className="stat">
            <Users size={16} />
            <div>
              <strong>{event.evaluatorCount || 0}</strong>
              <small>Judges</small>
            </div>
          </div>
          <div className="stat">
            <ClipboardCheck size={16} />
            <div>
              <strong>
                {completed} / {expected}
              </strong>
              <small>Evaluations</small>
            </div>
          </div>
        </div>

        <div className="event-card-progress">
          <div className="event-card-progress-label">
            <span>Evaluation progress</span>
            <span>{percent}%</span>
          </div>
          <div className="event-card-bar">
            <span style={{ width: `${percent}%` }} />
          </div>
        </div>

        <div className="event-card-actions">
          <Link to={`/director/events/${event._id}`} className="open-event">
            Open Competition
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
      <style>{`
        .event-card {
          display: flex;
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: var(--shadow);
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        }
        .event-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
          border-color: var(--line-strong);
        }
        .event-card-accent {
          width: 6px;
          flex-shrink: 0;
          background: var(--accent);
        }
        .status-draft .event-card-accent { background: var(--accent); }
        .status-active .event-card-accent { background: var(--success); }
        .status-completed .event-card-accent { background: var(--gold); }
        .status-archived .event-card-accent { background: #94a3b8; }
        .event-card-body {
          flex: 1;
          min-width: 0;
          padding: 20px 22px 18px;
        }
        .event-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
        }
        .event-card-top h2 {
          font-family: var(--serif);
          font-size: 1.35rem;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: var(--navy);
          line-height: 1.25;
        }
        .event-card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px 16px;
          margin-top: 8px;
          color: var(--muted);
          font-size: 13px;
        }
        .event-card-meta span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .event-card-desc {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .event-card-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 16px;
        }
        .event-card-stats .stat {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          background: var(--bg);
          border: 1px solid var(--line);
          border-radius: 12px;
          color: var(--navy);
        }
        .event-card-stats .stat strong {
          display: block;
          font-size: 16px;
          line-height: 1.2;
        }
        .event-card-stats .stat small {
          color: var(--muted);
          font-size: 12px;
        }
        .event-card-progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          font-weight: 600;
          color: var(--muted);
          margin-bottom: 6px;
        }
        .event-card-bar {
          height: 8px;
          background: #e8eef4;
          border-radius: 999px;
          overflow: hidden;
        }
        .event-card-bar span {
          display: block;
          height: 100%;
          background: linear-gradient(90deg, var(--navy), var(--accent));
          border-radius: 999px;
        }
        .event-card-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 16px;
        }
        .open-event {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 40px;
          padding: 0 16px;
          border-radius: 8px;
          background: var(--navy);
          color: #fff;
          font-weight: 600;
          font-size: 14px;
        }
        .open-event:hover { background: var(--navy-2); }
        @media (max-width: 720px) {
          .event-card-stats { grid-template-columns: 1fr; }
          .event-card-actions { justify-content: stretch; }
          .open-event { width: 100%; justify-content: center; }
        }
      `}</style>
    </article>
  );
}
