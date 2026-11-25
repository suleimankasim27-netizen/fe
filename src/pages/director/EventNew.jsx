import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { eventsApi } from "../../api/client.js";
import { Button, Input, Select, Textarea } from "../../components/ui/Form.jsx";
import { SidePanel } from "../../components/ui/SidePanel.jsx";
import { useToast } from "../../context/ToastContext.jsx";

const emptyForm = {
  name: "",
  description: "",
  date: "",
  location: "",
  status: "Draft",
  evaluationStartDate: "",
  evaluationEndDate: "",
  useDefaultCriteria: true,
  evaluationOpen: true,
  allowEvaluatorEdits: true,
  includeIncompleteInRankings: true,
};

export default function EventNewPanel({ open, onClose, onCreated }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function close() {
    if (loading) return;
    setForm(emptyForm);
    onClose();
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { event } = await eventsApi.create({
        name: form.name,
        description: form.description,
        date: form.date,
        location: form.location,
        status: form.status,
        evaluationStartDate: form.evaluationStartDate,
        evaluationEndDate: form.evaluationEndDate,
        useDefaultCriteria: form.useDefaultCriteria,
        settings: {
          evaluationOpen: form.evaluationOpen,
          allowEvaluatorEdits: form.allowEvaluatorEdits,
          includeIncompleteInRankings: form.includeIncompleteInRankings,
          requireFeedback: false,
        },
      });
      toast.push("Event created.");
      setForm(emptyForm);
      onClose();
      if (onCreated) onCreated(event);
      else navigate(`/director/events/${event._id}`);
    } catch (err) {
      toast.push(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SidePanel
      open={open}
      title="New competition"
      subtitle="Startup pitch competitions include default 100-point criteria."
      onClose={close}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={close} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="new-event-form" loading={loading}>
            Create competition
          </Button>
        </>
      }
    >
      <form id="new-event-form" onSubmit={onSubmit} className="event-panel-form">
        <Input label="Competition name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
        <Textarea label="Description" value={form.description} onChange={(e) => set("description", e.target.value)} />
        <Input label="Date" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
        <Input label="Location" value={form.location} onChange={(e) => set("location", e.target.value)} />
        <Select label="Status" value={form.status} onChange={(e) => set("status", e.target.value)}>
          <option>Draft</option>
          <option>Active</option>
          <option>Completed</option>
          <option>Archived</option>
        </Select>
        <div className="event-panel-dates">
          <Input
            label="Evaluation start"
            type="date"
            value={form.evaluationStartDate}
            onChange={(e) => set("evaluationStartDate", e.target.value)}
          />
          <Input
            label="Evaluation end"
            type="date"
            value={form.evaluationEndDate}
            onChange={(e) => set("evaluationEndDate", e.target.value)}
          />
        </div>
        <label className="event-panel-check">
          <input
            type="checkbox"
            checked={form.useDefaultCriteria}
            onChange={(e) => set("useDefaultCriteria", e.target.checked)}
          />
          <span>Pre-populate default startup pitch criteria (100 points)</span>
        </label>
        <label className="event-panel-check">
          <input
            type="checkbox"
            checked={form.evaluationOpen}
            onChange={(e) => set("evaluationOpen", e.target.checked)}
          />
          <span>Evaluation open</span>
        </label>
        <label className="event-panel-check">
          <input
            type="checkbox"
            checked={form.allowEvaluatorEdits}
            onChange={(e) => set("allowEvaluatorEdits", e.target.checked)}
          />
          <span>Allow evaluators to edit submissions</span>
        </label>
        <label className="event-panel-check">
          <input
            type="checkbox"
            checked={form.includeIncompleteInRankings}
            onChange={(e) => set("includeIncompleteInRankings", e.target.checked)}
          />
          <span>Include incomplete teams in rankings</span>
        </label>
      </form>
      <style>{`
        .event-panel-form { display: grid; gap: 14px; }
        .event-panel-dates { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .event-panel-check {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          padding: 12px;
          border: 1px solid var(--line);
          border-radius: 10px;
          background: var(--bg);
          font-size: 14px;
          line-height: 1.4;
        }
        .event-panel-check input { margin-top: 3px; }
        @media (max-width: 560px) {
          .event-panel-dates { grid-template-columns: 1fr; }
        }
      `}</style>
    </SidePanel>
  );
}
