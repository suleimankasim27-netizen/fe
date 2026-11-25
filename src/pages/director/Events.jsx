import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { eventsApi } from "../../api/client.js";
import { Card, EmptyState, Skeleton } from "../../components/ui/Display.jsx";
import { Button, Input } from "../../components/ui/Form.jsx";
import { EventCard } from "../../components/ui/EventCard.jsx";
import EventNewPanel from "./EventNew.jsx";

export default function Events() {
  const location = useLocation();
  const [events, setEvents] = useState(null);
  const [q, setQ] = useState("");
  const [panelOpen, setPanelOpen] = useState(Boolean(location.state?.openNewEvent));

  useEffect(() => {
    eventsApi.list().then((d) => setEvents(d.events));
  }, []);

  if (!events) {
    return <Skeleton height={240} />;
  }

  const filtered = events.filter((e) => e.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Competitions</h1>
          <p className="page-sub">Create and manage competitions.</p>
        </div>
        <Button onClick={() => setPanelOpen(true)}>New competition</Button>
      </div>
      <div style={{ maxWidth: 320, marginBottom: 16 }}>
        <Input placeholder="Search competitions" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            title="No competitions yet."
            body="Create your first competition to get started."
            action={<Button onClick={() => setPanelOpen(true)}>Create competition</Button>}
          />
        </Card>
      ) : (
        <div className="event-list">
          {filtered.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}
      <EventNewPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
      <style>{`
        .event-list { display: grid; gap: 14px; }
      `}</style>
    </div>
  );
}
