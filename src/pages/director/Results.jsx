import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { eventsApi } from "../../api/client.js";
import { Card, EmptyState, Skeleton } from "../../components/ui/Display.jsx";
import { Table } from "../../components/ui/Table.jsx";
import { Select } from "../../components/ui/Form.jsx";

export default function Results() {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [rankings, setRankings] = useState(null);

  useEffect(() => {
    eventsApi.list().then((d) => {
      setEvents(d.events);
      if (d.events[0]) setEventId(d.events[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!eventId) return;
    eventsApi.rankings(eventId).then(setRankings);
  }, [eventId]);

  return (
    <div>
      <h1 className="page-title">Results</h1>
      <p className="page-sub">Rankings are based on average evaluator scores.</p>
      {events.length === 0 ? (
        <Card style={{ marginTop: 16 }}>
          <EmptyState title="No rankings available yet." />
        </Card>
      ) : (
        <>
          <div style={{ maxWidth: 360, margin: "16px 0" }}>
            <Select value={eventId} onChange={(e) => setEventId(e.target.value)} label="Competition">
              {events.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.name}
                </option>
              ))}
            </Select>
          </div>
          <Card>
            {!rankings ? (
              <Skeleton height={160} />
            ) : rankings.rankings.length === 0 ? (
              <EmptyState title="No rankings available yet." />
            ) : (
              <Table
                rows={rankings.rankings}
                keyField="teamId"
                columns={[
                  { key: "rank", label: "Rank" },
                  { key: "name", label: "Team" },
                  {
                    key: "averageScore",
                    label: "Average",
                    render: (r) => `${r.averageScore} / ${rankings.maxTotal}`,
                  },
                  {
                    key: "completedEvaluations",
                    label: "Evaluations",
                    render: (r) => `${r.completedEvaluations} / ${r.expectedEvaluations}`,
                  },
                ]}
              />
            )}
            {eventId && (
              <p style={{ marginTop: 16 }}>
                <Link to={`/director/events/${eventId}`} style={{ color: "var(--accent)", fontWeight: 600 }}>
                  Open competition rankings →
                </Link>
              </p>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
