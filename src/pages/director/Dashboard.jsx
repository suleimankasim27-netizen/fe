import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardApi } from "../../api/client.js";
import { Card, Skeleton, EmptyState } from "../../components/ui/Display.jsx";
import { StatusBadge } from "../../components/ui/Table.jsx";
import { Button } from "../../components/ui/Form.jsx";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import EventNewPanel from "./EventNew.jsx";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    dashboardApi()
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (!data && !error) {
    return (
      <div className="grid-stats">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <Skeleton height={72} />
          </Card>
        ))}
      </div>
    );
  }

  if (error) return <p className="muted">{error}</p>;

  const cards = [
    ["Total Competitions", data.stats.totalEvents],
    ["Active Competitions", data.stats.activeEvents],
    ["Total Judges", data.stats.totalJudges],
    ["Total Teams", data.stats.totalTeams],
    ["Completed Evaluations", data.stats.completedEvaluations],
    ["Pending Evaluations", data.stats.pendingEvaluations],
  ];

  const chartData = data.recentEvents.map((e) => ({
    name: e.name.length > 16 ? `${e.name.slice(0, 16)}…` : e.name,
    completed: e.completedEvaluations,
    expected: e.expectedEvaluations,
  }));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Overview of your competitions and evaluation progress.</p>
        </div>
        <Button onClick={() => setPanelOpen(true)}>Create competition</Button>
      </div>
      <div className="grid-stats" style={{ marginBottom: 20 }}>
        {cards.map(([label, value]) => (
          <Card key={label}>
            <p className="muted" style={{ fontSize: 13, fontWeight: 600 }}>
              {label}
            </p>
            <p style={{ fontFamily: "var(--serif)", fontSize: 32, marginTop: 6 }}>{value}</p>
          </Card>
        ))}
      </div>
      <div className="grid-2">
        <Card>
          <h2 style={{ fontFamily: "var(--serif)", marginBottom: 16 }}>Evaluation completion</h2>
          {chartData.length === 0 ? (
            <EmptyState title="No competitions yet." body="Create your first competition to get started." />
          ) : (
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="expected" fill="#cfd8e3" name="Expected" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" fill="#14532d" name="Completed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card>
          <h2 style={{ fontFamily: "var(--serif)", marginBottom: 16 }}>Recent competitions</h2>
          {data.recentEvents.length === 0 ? (
            <EmptyState
              title="No competitions yet."
              body="Create your first competition to get started."
              action={
                <Button onClick={() => setPanelOpen(true)}>Create competition</Button>
              }
            />
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {data.recentEvents.map((event) => (
                <Link key={event._id} to={`/director/events/${event._id}`} className="recent">
                  <span className={`recent-accent status-${(event.status || "").toLowerCase()}`} />
                  <div className="recent-body">
                    <div className="recent-top">
                      <strong>{event.name}</strong>
                      <StatusBadge status={event.status} />
                    </div>
                    <p className="muted">
                      {event.teamCount} Teams · {event.evaluatorCount} Judges · {event.completedEvaluations} /{" "}
                      {event.expectedEvaluations} Evaluations
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
      <style>{`
        .recent {
          display: flex;
          overflow: hidden;
          border: 1px solid var(--line);
          border-radius: 12px;
          background: #fff;
        }
        .recent:hover { border-color: var(--line-strong); box-shadow: var(--shadow); }
        .recent-accent { width: 4px; flex-shrink: 0; background: var(--accent); }
        .recent-accent.status-active { background: var(--success); }
        .recent-accent.status-completed { background: var(--gold); }
        .recent-accent.status-archived { background: #94a3b8; }
        .recent-body { flex: 1; min-width: 0; padding: 12px 14px; }
        .recent-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 4px; }
        .recent-top strong { font-size: 14px; color: var(--navy); }
      `}</style>
      <EventNewPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </div>
  );
}
