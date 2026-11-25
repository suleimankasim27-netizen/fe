import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { evaluatorsApi } from "../../api/client.js";
import { Card, EmptyState, Skeleton } from "../../components/ui/Display.jsx";
import { Table, StatusBadge } from "../../components/ui/Table.jsx";

export default function Judges() {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    evaluatorsApi.all().then((d) => setRows(d.evaluators));
  }, []);

  if (!rows) return <Skeleton height={200} />;

  return (
    <div>
      <h1 className="page-title">Judges</h1>
      <p className="page-sub">All evaluators across your events. Manage links inside each event.</p>
      <Card style={{ marginTop: 16 }}>
        {rows.length === 0 ? (
          <EmptyState title="No judges added yet." />
        ) : (
          <Table
            rows={rows}
            columns={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              {
                key: "eventName",
                label: "Event",
                render: (r) => <Link to={`/director/events/${r.eventId}`}>{r.eventName}</Link>,
              },
              {
                key: "revoked",
                label: "Link",
                render: (r) => <StatusBadge status={r.revoked ? "Archived" : "Active"} />,
              },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
