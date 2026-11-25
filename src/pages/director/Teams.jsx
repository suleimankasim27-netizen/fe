import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { teamsApi } from "../../api/client.js";
import { Card, EmptyState, Skeleton } from "../../components/ui/Display.jsx";
import { Table } from "../../components/ui/Table.jsx";
import { Input } from "../../components/ui/Form.jsx";

export default function Teams() {
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    teamsApi.all().then((d) => setRows(d.teams));
  }, []);

  if (!rows) return <Skeleton height={200} />;
  const filtered = rows.filter((t) => t.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <h1 className="page-title">Teams</h1>
      <p className="page-sub">Startups and teams across all events.</p>
      <div style={{ maxWidth: 320, margin: "16px 0" }}>
        <Input placeholder="Search teams" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <Card>
        {filtered.length === 0 ? (
          <EmptyState title="No teams added yet." />
        ) : (
          <Table
            rows={filtered}
            columns={[
              { key: "pitchNumber", label: "#", render: (r) => r.pitchNumber ?? "—" },
              { key: "name", label: "Team" },
              {
                key: "eventName",
                label: "Event",
                render: (r) => <Link to={`/director/events/${r.eventId}`}>{r.eventName}</Link>,
              },
              { key: "members", label: "Members" },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
