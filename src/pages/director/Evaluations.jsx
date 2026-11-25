import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { evaluationsApi } from "../../api/client.js";
import { Card, EmptyState, Skeleton } from "../../components/ui/Display.jsx";
import { Table } from "../../components/ui/Table.jsx";

export default function Evaluations() {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    evaluationsApi.all().then((d) => setRows(d.evaluations));
  }, []);

  if (!rows) return <Skeleton height={200} />;

  return (
    <div>
      <h1 className="page-title">Evaluations</h1>
      <p className="page-sub">Submitted scores across your events.</p>
      <Card style={{ marginTop: 16 }}>
        {rows.length === 0 ? (
          <EmptyState title="No evaluations submitted yet." />
        ) : (
          <Table
            rows={rows}
            columns={[
              {
                key: "eventName",
                label: "Event",
                render: (r) => <Link to={`/director/events/${r.eventId}`}>{r.eventName}</Link>,
              },
              { key: "teamName", label: "Team" },
              { key: "evaluatorName", label: "Evaluator" },
              { key: "totalScore", label: "Score" },
              {
                key: "submittedAt",
                label: "Submitted",
                render: (r) => new Date(r.submittedAt).toLocaleString(),
              },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
