import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { eventsApi, teamsApi, evaluatorsApi, criteriaApi, downloadExport } from "../../api/client.js";
import { EmptyState, ProgressBar, ConfirmDialog, Modal, Skeleton } from "../../components/ui/Display.jsx";
import { Tabs, Table, StatusBadge } from "../../components/ui/Table.jsx";
import { Button, Input, Select, Textarea } from "../../components/ui/Form.jsx";
import { SidePanel } from "../../components/ui/SidePanel.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  LayoutDashboard,
  Trophy,
  Building2,
  Users,
  ListChecks,
  UserCheck,
  Settings,
} from "lucide-react";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "rankings", label: "Rankings", icon: Trophy },
  { id: "teams", label: "Teams", icon: Building2 },
  { id: "judges", label: "Judges", icon: Users },
  { id: "criteria", label: "Criteria", icon: ListChecks },
  { id: "assignments", label: "Assignments", icon: UserCheck },
  { id: "settings", label: "Settings", icon: Settings },
];

function upsertById(list, item) {
  const id = String(item._id);
  const index = list.findIndex((row) => String(row._id) === id);
  if (index === -1) return [...list, item];
  const next = [...list];
  next[index] = { ...list[index], ...item };
  return next;
}

function removeById(list, id) {
  return list.filter((row) => String(row._id) !== String(id));
}

export default function EventDetail() {
  const { eventId } = useParams();
  const location = useLocation();
  const toast = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState(location.pathname.endsWith("/rankings") ? "rankings" : "overview");
  const [payload, setPayload] = useState(null);
  const [teams, setTeams] = useState([]);
  const [evaluators, setEvaluators] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [results, setResults] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const loadCore = useCallback(async () => {
    const data = await eventsApi.get(eventId);
    setPayload(data);
    const [t, j, c, a] = await Promise.all([
      eventsApi.teams(eventId),
      eventsApi.evaluators(eventId),
      eventsApi.criteria(eventId),
      eventsApi.assignments(eventId),
    ]);
    setTeams(t.teams);
    setEvaluators(j.evaluators);
    setCriteria(c.criteria);
    setAssignments(a.assignments);
  }, [eventId]);

  useEffect(() => {
    loadCore().catch((e) => toast.push(e.message, "error"));
  }, [loadCore]);

  useEffect(() => {
    if (tab === "rankings" || tab === "overview") {
      eventsApi.results(eventId).then(setResults).catch(() => {});
    }
  }, [tab, eventId, teams.length, evaluators.length]);

  if (!payload) return <Skeleton height={280} />;

  const { event, stats, progress } = payload;

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate("/director/events")}>
          ← Competitions
        </button>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 className="page-title">{event.name}</h1>
          <p className="page-sub">{event.location || "No location"} · {event.description?.slice(0, 120)}</p>
        </div>
        <StatusBadge status={event.status} />
      </div>
      <Tabs
          tabs={TABS}
          active={tab}
          onChange={(id) => {
            setTab(id);
            navigate(id === "rankings" ? `/director/events/${eventId}/rankings` : `/director/events/${eventId}`);
          }}
        />
      {tab === "overview" && (
        <Overview stats={stats} progress={progress} results={results} />
      )}
      {tab === "teams" && (
        <TeamsTab
          eventId={eventId}
          teams={teams}
          onSaved={(team) => setTeams((prev) => upsertById(prev, team))}
          onRemoved={(id) => setTeams((prev) => removeById(prev, id))}
          onRefresh={loadCore}
        />
      )}
      {tab === "judges" && (
        <JudgesTab
          eventId={eventId}
          evaluators={evaluators}
          onSaved={(evaluator) => setEvaluators((prev) => upsertById(prev, evaluator))}
          onRemoved={(id) => setEvaluators((prev) => removeById(prev, id))}
          onRefresh={loadCore}
        />
      )}
      {tab === "criteria" && (
        <CriteriaTab
          eventId={eventId}
          criteria={criteria}
          onSaved={(criterion) => setCriteria((prev) => upsertById(prev, criterion))}
          onRemoved={(id) => setCriteria((prev) => removeById(prev, id))}
          onRefresh={loadCore}
        />
      )}
      {tab === "assignments" && (
        <AssignmentsTab
          eventId={eventId}
          teams={teams}
          evaluators={evaluators}
          assignments={assignments}
          onChange={loadCore}
        />
      )}
      {tab === "rankings" && (
        <RankingsTab
          eventId={eventId}
          results={results}
          selectedTeam={selectedTeam}
          setSelectedTeam={setSelectedTeam}
        />
      )}
      {tab === "settings" && (
        <SettingsTab event={event} onSaved={loadCore} />
      )}
    </div>
  );
}

function Overview({ stats, progress, results }) {
  return (
    <div className="tab-panel">
      <div className="metric-grid">
        <div className="metric-tile"><span>Teams</span><strong>{stats.teamCount}</strong></div>
        <div className="metric-tile"><span>Judges</span><strong>{stats.evaluatorCount}</strong></div>
        <div className="metric-tile"><span>Completed</span><strong>{stats.completedEvaluations}</strong></div>
        <div className="metric-tile"><span>Pending</span><strong>{stats.pendingEvaluations}</strong></div>
      </div>
      <div className="split-grid">
        <div className="surface-block">
          <h3 className="section-title">Evaluation progress</h3>
          <p className="muted" style={{ margin: "8px 0 12px" }}>
            Expected {progress?.expected || 0} · Completed {progress?.completed || 0} · Remaining {progress?.remaining || 0}
          </p>
          <ProgressBar value={progress?.completed || 0} max={progress?.expected || 1} />
          {(progress?.byEvaluator || []).map((row) => (
            <div key={row.evaluatorId} className="progress-row">
              <div className="progress-row-head">
                <strong>{row.name}</strong>
                <span className="muted">{row.completed} / {row.total} · {row.percent}%</span>
              </div>
              <ProgressBar value={row.completed} max={row.total || 1} />
            </div>
          ))}
        </div>
        <div className="surface-block">
          <h3 className="section-title">Average scores by criterion</h3>
          {results?.rankings?.length ? (
            <div style={{ height: 260, marginTop: 12 }}>
              <ResponsiveContainer>
                <BarChart
                  data={(results.criteria || []).map((c) => ({
                    name: c.name.split(" ")[0],
                    avg:
                      results.rankings.reduce((s, r) => {
                        const found = r.criterionAverages.find((x) => x.name === c.name);
                        return s + (found?.average || 0);
                      }, 0) / results.rankings.length,
                    max: c.maxPoints,
                  }))}
                >
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avg" fill="#15803d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="No rankings available yet." body="Scores appear after evaluations are submitted." />
          )}
        </div>
      </div>
    </div>
  );
}

function TeamsTab({ eventId, teams, onSaved, onRemoved, onRefresh }) {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyTeam());
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  function emptyTeam() {
    return { name: "", description: "", members: "", logo: "", pitchNumber: "", website: "", notes: "" };
  }

  function startEdit(team) {
    setEditing(team);
    setForm({
      name: team.name,
      description: team.description || "",
      members: team.members || "",
      logo: team.logo || "",
      pitchNumber: team.pitchNumber ?? "",
      website: team.website || "",
      notes: team.notes || "",
    });
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setEditing(null);
    setForm(emptyTeam());
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const data = editing
        ? await teamsApi.update(editing._id, form)
        : await eventsApi.createTeam(eventId, form);
      onSaved(data.team);
      toast.push(editing ? "Team updated." : "Team added.");
      close();
      await onRefresh();
    } catch (err) {
      toast.push(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  const filtered = teams.filter((t) => t.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="tab-panel">
      <div className="tab-toolbar">
        <div>
          <h2>Teams</h2>
          <p>Startups and teams in this competition.</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ minWidth: 220 }}>
            <Input placeholder="Search teams" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Button
            onClick={() => {
              setEditing(null);
              setForm(emptyTeam());
              setOpen(true);
            }}
          >
            Add team
          </Button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="data-surface">
          <EmptyState
            title="No teams added yet."
            action={
              <Button
                onClick={() => {
                  setEditing(null);
                  setForm(emptyTeam());
                  setOpen(true);
                }}
              >
                Add team
              </Button>
            }
          />
        </div>
      ) : (
        <div className="data-surface">
          <Table
            rows={filtered}
            columns={[
              { key: "pitchNumber", label: "#", render: (r) => String(r.pitchNumber || "").padStart(2, "0") || "—" },
              { key: "name", label: "Team" },
              { key: "members", label: "Members" },
              {
                key: "actions",
                label: "",
                render: (r) => (
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button size="sm" variant="secondary" onClick={() => startEdit(r)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => setConfirm(r)}>
                      Delete
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}
      <SidePanel
        open={open}
        title={editing ? "Edit team" : "Add team"}
        subtitle="Add a startup or team that judges will evaluate."
        onClose={close}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={close} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="team-form" loading={saving}>
              {editing ? "Save team" : "Add team"}
            </Button>
          </>
        }
      >
        <form id="team-form" onSubmit={save} className="panel-form">
          <Input label="Team/startup name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input label="Founder/team members" value={form.members} onChange={(e) => setForm({ ...form, members: e.target.value })} />
          <Input label="Pitch number" type="number" value={form.pitchNumber} onChange={(e) => setForm({ ...form, pitchNumber: e.target.value })} />
          <Textarea label="Additional notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </form>
        <style>{`.panel-form { display: grid; gap: 14px; }`}</style>
      </SidePanel>
      <ConfirmDialog
        open={Boolean(confirm)}
        title="Delete team?"
        body="This removes assignments and evaluations for this team."
        confirmLabel="Delete"
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          const id = confirm._id;
          await teamsApi.remove(id);
          setConfirm(null);
          onRemoved(id);
          await onRefresh();
        }}
      />
    </div>
  );
}

function JudgesTab({ eventId, evaluators, onSaved, onRemoved, onRefresh }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [linkModal, setLinkModal] = useState(null);
  const [busy, setBusy] = useState("");
  const [saving, setSaving] = useState(false);

  function close() {
    setOpen(false);
    setForm({ name: "", email: "" });
  }

  async function add(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await eventsApi.createEvaluator(eventId, form);
      onSaved(data.evaluator);
      toast.push("Evaluator added.");
      setForm({ name: "", email: "" });
      setOpen(false);
      setLinkModal(data.evaluator);
      await onRefresh();
    } catch (err) {
      toast.push(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function copyLink(id) {
    setBusy(id);
    try {
      const data = await evaluatorsApi.regenerateLink(id);
      await navigator.clipboard.writeText(data.evaluator.link);
      toast.push("New link copied to clipboard.");
      setLinkModal(data.evaluator);
      onSaved(data.evaluator);
    } catch (err) {
      toast.push(err.message, "error");
    } finally {
      setBusy("");
    }
  }

  async function send(id, resend = false) {
    setBusy(id);
    try {
      const data = resend ? await evaluatorsApi.resendLink(id) : await evaluatorsApi.sendLink(id);
      toast.push("Evaluation link emailed.");
      setLinkModal(data.evaluator);
      onSaved(data.evaluator);
    } catch (err) {
      toast.push(err.message, "error");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="tab-panel">
      <div className="tab-toolbar">
        <div>
          <h2>Judges</h2>
          <p>Evaluators access the competition through a unique link.</p>
        </div>
        <Button onClick={() => setOpen(true)}>Add Evaluator</Button>
      </div>
      {evaluators.length === 0 ? (
        <div className="data-surface">
          <EmptyState
            title="No judges added yet."
            action={<Button onClick={() => setOpen(true)}>Add Evaluator</Button>}
          />
        </div>
      ) : (
        <div className="data-surface">
          <Table
            rows={evaluators}
            columns={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "status", label: "Link", render: (r) => (r.revoked ? <StatusBadge status="Archived" /> : <StatusBadge status="Active" />) },
              {
                key: "a",
                label: "",
                render: (r) => (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <Button size="sm" variant="secondary" loading={busy === r._id} onClick={() => copyLink(r._id)}>Copy Link</Button>
                    <Button size="sm" onClick={() => send(r._id, Boolean(r.lastEmailSentAt))}>
                      {r.lastEmailSentAt ? "Resend Link" : "Send Link"}
                    </Button>
                    {r.revoked ? (
                      <Button size="sm" variant="secondary" onClick={() => copyLink(r._id)}>Generate New Link</Button>
                    ) : (
                      <Button size="sm" variant="danger" onClick={async () => { await evaluatorsApi.revokeLink(r._id); onSaved({ ...r, revoked: true }); toast.push("Link revoked."); }}>Revoke Link</Button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}
      <SidePanel
        open={open}
        title="Add Evaluator"
        subtitle="The evaluator does not get an account. Access is through a unique secure link."
        onClose={close}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={close} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="evaluator-form" loading={saving}>
              Add Evaluator
            </Button>
          </>
        }
      >
        <form id="evaluator-form" onSubmit={add} className="panel-form">
          <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </form>
        <style>{`.panel-form { display: grid; gap: 14px; }`}</style>
      </SidePanel>
      <Modal open={Boolean(linkModal)} title="Evaluator link" onClose={() => setLinkModal(null)}>
        <p className="muted" style={{ marginBottom: 8 }}>Share this unique link. Generating a new link invalidates the previous one.</p>
        <Input readOnly value={linkModal?.link || ""} />
        <div style={{ marginTop: 12 }}>
          <Button onClick={() => navigator.clipboard.writeText(linkModal.link)}>Copy</Button>
        </div>
      </Modal>
    </div>
  );
}

function CriteriaTab({ eventId, criteria, onSaved, onRemoved, onRefresh }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    maxPoints: 20,
    allowedScores: "0, 4, 8, 12, 16, 20",
  });

  function close() {
    setOpen(false);
    setForm({
      name: "",
      description: "",
      maxPoints: 20,
      allowedScores: "0, 4, 8, 12, 16, 20",
    });
  }

  async function add(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await eventsApi.createCriterion(eventId, form);
      onSaved(data.criterion);
      toast.push("Criterion added.");
      close();
      await onRefresh();
    } catch (err) {
      toast.push(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="tab-panel">
      <div className="tab-toolbar">
        <div>
          <h2>Criteria</h2>
          <p>What judges score for this competition.</p>
        </div>
        <Button onClick={() => setOpen(true)}>Add criterion</Button>
      </div>
      {criteria.length === 0 ? (
        <div className="data-surface">
          <EmptyState
            title="No criteria yet."
            action={<Button onClick={() => setOpen(true)}>Add criterion</Button>}
          />
        </div>
      ) : (
        <div className="criterion-list">
          {criteria.map((c) => (
            <div key={c._id} className="criterion-item">
              <div className="criterion-item-top">
                <div>
                  <strong>{c.name}</strong>
                  <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>{c.description}</p>
                  <p style={{ fontSize: 13, marginTop: 6 }}>Scores: {c.allowedScores.join(" · ")}</p>
                </div>
                <span className="muted">{c.maxPoints} pts</span>
              </div>
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    const data = await criteriaApi.update(c._id, { active: !c.active });
                    onSaved(data.criterion);
                  }}
                >
                  {c.active ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={async () => {
                    await criteriaApi.remove(c._id);
                    onRemoved(c._id);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <SidePanel
        open={open}
        title="Add criterion"
        subtitle="Define what judges score for this competition."
        onClose={close}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={close} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="criterion-form" loading={saving}>
              Add criterion
            </Button>
          </>
        }
      >
        <form id="criterion-form" onSubmit={add} className="panel-form">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input label="Maximum points" type="number" value={form.maxPoints} onChange={(e) => setForm({ ...form, maxPoints: e.target.value })} />
          <Input
            label="Allowed score values"
            hint="Comma-separated, for example 0, 5, 10, 15, 20, 25"
            value={form.allowedScores}
            onChange={(e) => setForm({ ...form, allowedScores: e.target.value })}
          />
        </form>
        <style>{`.panel-form { display: grid; gap: 14px; }`}</style>
      </SidePanel>
    </div>
  );
}

function AssignmentsTab({ eventId, teams, evaluators, assignments, onChange }) {
  const toast = useToast();
  const [saving, setSaving] = useState("");

  async function toggle(evaluatorId, teamId, checked, current) {
    const next = checked ? [...current, teamId] : current.filter((id) => id !== teamId);
    setSaving(evaluatorId);
    try {
      await eventsApi.replaceAssignments(eventId, evaluatorId, { teamIds: next });
      onChange();
    } catch (err) {
      toast.push(err.message, "error");
    } finally {
      setSaving("");
    }
  }

  async function assignAll(evaluatorId) {
    setSaving(evaluatorId);
    try {
      await eventsApi.replaceAssignments(eventId, evaluatorId, { assignAll: true });
      onChange();
    } catch (err) {
      toast.push(err.message, "error");
    } finally {
      setSaving("");
    }
  }

  if (!evaluators.length || !teams.length) {
    return (
      <div className="tab-panel">
        <div className="tab-toolbar">
          <div>
            <h2>Assignments</h2>
            <p>Choose which teams each judge evaluates.</p>
          </div>
        </div>
        <div className="data-surface">
          <EmptyState title="Add teams and judges before assigning." />
        </div>
      </div>
    );
  }

  return (
    <div className="tab-panel">
      <div className="tab-toolbar">
        <div>
          <h2>Assignments</h2>
          <p>Choose which teams each judge evaluates.</p>
        </div>
      </div>
      {evaluators.map((ev) => {
        const current = assignments
          .filter((a) => String(a.evaluatorId) === String(ev._id))
          .map((a) => String(a.teamId));
        return (
          <div key={ev._id} className="assign-card">
            <div className="assign-head">
              <h3 className="section-title">{ev.name}</h3>
              <Button size="sm" variant="secondary" loading={saving === ev._id} onClick={() => assignAll(ev._id)}>
                Assign all teams
              </Button>
            </div>
            <div className="assign-grid">
              {teams.map((team) => {
                const checked = current.includes(String(team._id));
                return (
                  <label key={team._id} className="assign-chip">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => toggle(ev._id, team._id, e.target.checked, current)}
                    />
                    {team.name}
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RankingsTab({ eventId, results, selectedTeam, setSelectedTeam }) {
  const toast = useToast();
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!selectedTeam) {
      setDetail(null);
      return;
    }
    setLoadingDetail(true);
    eventsApi
      .teamResults(eventId, selectedTeam)
      .then(setDetail)
      .catch((e) => {
        toast.push(e.message, "error");
        setSelectedTeam(null);
      })
      .finally(() => setLoadingDetail(false));
  }, [selectedTeam, eventId]);

  if (!results) return <Skeleton height={200} />;

  async function exportCsv(detailed) {
    try {
      await downloadExport(eventId, detailed);
    } catch (e) {
      toast.push(e.message, "error");
    }
  }

  return (
    <div className="tab-panel">
      <div className="tab-toolbar">
        <div>
          <h2>Rankings</h2>
          <p>Sorted by average score. Click a team for the full breakdown.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="secondary" onClick={() => exportCsv(false)}>Export CSV</Button>
          <Button variant="secondary" onClick={() => exportCsv(true)}>Export detailed CSV</Button>
        </div>
      </div>
      {results.incompleteTeams?.length > 0 && (
        <p className="muted">
          Incomplete evaluations are excluded from rankings unless enabled in Settings.
        </p>
      )}
      <div className="data-surface">
        {results.rankings?.length ? (
          <Table
            rows={results.rankings}
            keyField="teamId"
            onRowClick={(r) => setSelectedTeam(r.teamId)}
            columns={[
              { key: "rank", label: "Rank" },
              { key: "name", label: "Team" },
              { key: "averageScore", label: "Average", render: (r) => `${r.averageScore} / ${results.maxTotal}` },
              { key: "completedEvaluations", label: "Evaluations", render: (r) => `${r.completedEvaluations} / ${r.expectedEvaluations}` },
              { key: "complete", label: "Status", render: (r) => (r.complete ? "Complete" : "Incomplete") },
            ]}
          />
        ) : (
          <EmptyState title="No rankings available yet." />
        )}
      </div>
      {results.incompleteTeams?.length > 0 && (
        <div>
          <h3 className="section-title" style={{ marginBottom: 10 }}>Incomplete teams</h3>
          <div className="data-surface">
            <Table
              rows={results.incompleteTeams}
              keyField="teamId"
              onRowClick={(r) => setSelectedTeam(r.teamId)}
              columns={[
                { key: "name", label: "Team" },
                { key: "completedEvaluations", label: "Completed", render: (r) => `${r.completedEvaluations} / ${r.expectedEvaluations}` },
                { key: "averageScore", label: "Partial average", render: (r) => (r.averageScore == null ? "—" : r.averageScore) },
              ]}
            />
          </div>
        </div>
      )}
      <SidePanel
        open={Boolean(selectedTeam)}
        title={detail?.team?.name || "Team results"}
        subtitle={
          detail
            ? `${detail.completedEvaluations} / ${detail.expectedEvaluations} evaluations`
            : "Loading team results…"
        }
        onClose={() => setSelectedTeam(null)}
        width={560}
      >
        {loadingDetail || !detail ? (
          <Skeleton height={280} />
        ) : (
          <div className="rank-detail">
            <div className="rank-hero">
              <p>Overall Average</p>
              <strong>
                {detail.overallAverage ?? "—"}
                <span> / {detail.maxTotal}</span>
              </strong>
            </div>
            <section>
              <h3>Criteria averages</h3>
              <div className="rank-criteria">
                {detail.criterionAverages.map((c) => {
                  const pct = c.average == null || !c.maxPoints ? 0 : Math.round((c.average / c.maxPoints) * 100);
                  return (
                    <div key={c.criterionId} className="rank-criterion">
                      <div className="rank-criterion-top">
                        <span>{c.name}</span>
                        <strong>
                          {c.average ?? "—"} / {c.maxPoints}
                        </strong>
                      </div>
                      <div className="rank-bar">
                        <span style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
            <section>
              <h3>Evaluator feedback</h3>
              {detail.evaluatorResults.length === 0 ? (
                <p className="muted">No evaluations submitted yet.</p>
              ) : (
                detail.evaluatorResults.map((ev) => (
                  <article key={ev.evaluationId} className="rank-eval">
                    <div className="rank-eval-head">
                      <strong>{ev.evaluatorName}</strong>
                      <span>
                        {ev.totalScore} / {ev.maxTotal}
                      </span>
                    </div>
                    <ul className="rank-eval-scores">
                      {(detail.criterionAverages.length
                        ? detail.criterionAverages.map((c) => {
                            const entered = (ev.scores || []).find(
                              (s) => String(s.criterionId) === String(c.criterionId) || s.name === c.name
                            );
                            return {
                              id: c.criterionId,
                              name: c.name,
                              score: entered?.score,
                              maxPoints: c.maxPoints,
                            };
                          })
                        : (ev.scores || []).map((s) => ({
                            id: s.criterionId,
                            name: s.name,
                            score: s.score,
                            maxPoints: s.maxPoints,
                          }))
                      ).map((row) => (
                        <li key={row.id}>
                          <span>{row.name}</span>
                          <strong>
                            {row.score ?? "—"} / {row.maxPoints}
                          </strong>
                        </li>
                      ))}
                    </ul>
                    <p>
                      <em>Strengths</em>
                      {ev.strengths || "—"}
                    </p>
                    <p>
                      <em>Areas for Improvement</em>
                      {ev.improvements || "—"}
                    </p>
                  </article>
                ))
              )}
            </section>
          </div>
        )}
        <style>{`
          .rank-detail { display: grid; gap: 22px; }
          .rank-hero {
            background: var(--navy);
            color: #fff;
            border-radius: 14px;
            padding: 20px 22px;
          }
          .rank-hero p {
            font-size: 12px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: rgba(255,255,255,0.7);
            margin-bottom: 6px;
          }
          .rank-hero strong {
            font-family: var(--serif);
            font-size: 2.2rem;
            font-weight: 600;
          }
          .rank-hero span { font-size: 1.1rem; color: rgba(255,255,255,0.7); }
          .rank-detail h3 {
            font-family: var(--serif);
            font-size: 1.05rem;
            margin-bottom: 12px;
            color: var(--navy);
          }
          .rank-criteria { display: grid; gap: 12px; }
          .rank-criterion-top {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            font-size: 14px;
            margin-bottom: 6px;
          }
          .rank-bar {
            height: 8px;
            background: #e8eef4;
            border-radius: 999px;
            overflow: hidden;
          }
          .rank-bar span {
            display: block;
            height: 100%;
            background: linear-gradient(90deg, var(--navy), var(--accent));
          }
          .rank-eval {
            border: 1px solid var(--line);
            border-radius: 12px;
            padding: 14px 16px;
            margin-bottom: 10px;
            background: var(--bg);
          }
          .rank-eval-head {
            display: flex;
            justify-content: space-between;
            gap: 8px;
            margin-bottom: 10px;
          }
          .rank-eval-head span {
            font-weight: 700;
            color: var(--navy);
          }
          .rank-eval-scores {
            list-style: none;
            display: grid;
            gap: 6px;
            margin: 4px 0 12px;
            padding: 10px 12px;
            background: #fff;
            border: 1px solid var(--line);
            border-radius: 10px;
          }
          .rank-eval-scores li {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            font-size: 13px;
            padding: 4px 0;
            border-bottom: 1px solid var(--line);
          }
          .rank-eval-scores li:last-child { border-bottom: none; }
          .rank-eval-scores li span { color: var(--ink); }
          .rank-eval-scores li strong { color: var(--navy); white-space: nowrap; }
          .rank-eval p { font-size: 14px; color: var(--ink); margin-top: 8px; }
          .rank-eval em {
            display: block;
            font-style: normal;
            font-size: 11px;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: var(--muted);
            margin-bottom: 4px;
          }
        `}</style>
      </SidePanel>
    </div>
  );
}

function SettingsTab({ event, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    name: event.name,
    description: event.description || "",
    date: event.date ? event.date.slice(0, 10) : "",
    location: event.location || "",
    status: event.status,
    evaluationStartDate: event.evaluationStartDate ? event.evaluationStartDate.slice(0, 10) : "",
    evaluationEndDate: event.evaluationEndDate ? event.evaluationEndDate.slice(0, 10) : "",
    settings: {
      allowEvaluatorEdits: Boolean(event.settings?.allowEvaluatorEdits),
      requireFeedback: Boolean(event.settings?.requireFeedback),
      includeIncompleteInRankings: Boolean(event.settings?.includeIncompleteInRankings),
      evaluationOpen: event.settings?.evaluationOpen !== false,
    },
  });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const navigate = useNavigate();

  function setSetting(key, value) {
    setForm((f) => ({ ...f, settings: { ...f.settings, [key]: value } }));
  }

  async function save(e) {
    e.preventDefault();
    try {
      await eventsApi.update(event._id, form);
      toast.push("Settings saved.");
      onSaved();
    } catch (err) {
      toast.push(err.message, "error");
    }
  }

  async function closeEvent() {
    await eventsApi.update(event._id, { ...form, status: "Completed", settings: { ...form.settings, evaluationOpen: false } });
    toast.push("Competition closed. New submissions are disabled.");
    onSaved();
  }

  return (
    <div className="tab-panel settings-grid">
      <div className="tab-toolbar">
        <div>
          <h2>Settings</h2>
          <p>Competition details, dates, and ranking rules.</p>
        </div>
      </div>
      <form onSubmit={save} className="settings-grid">
        <div className="settings-block">
          <h3 className="section-title">Competition details</h3>
          <Input label="Competition name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>Draft</option>
            <option>Active</option>
            <option>Completed</option>
            <option>Archived</option>
          </Select>
        </div>
        <div className="settings-block">
          <h3 className="section-title">Evaluation window</h3>
          <Input label="Evaluation start" type="date" value={form.evaluationStartDate} onChange={(e) => setForm({ ...form, evaluationStartDate: e.target.value })} />
          <Input label="Evaluation end" type="date" value={form.evaluationEndDate} onChange={(e) => setForm({ ...form, evaluationEndDate: e.target.value })} />
        </div>
        <div className="settings-block">
          <h3 className="section-title">Options</h3>
          <label className="check-row"><input type="checkbox" checked={form.settings.evaluationOpen} onChange={(e) => setSetting("evaluationOpen", e.target.checked)} /> Evaluation open</label>
          <label className="check-row"><input type="checkbox" checked={form.settings.allowEvaluatorEdits} onChange={(e) => setSetting("allowEvaluatorEdits", e.target.checked)} /> Allow evaluators to edit submissions</label>
          <label className="check-row"><input type="checkbox" checked={form.settings.requireFeedback} onChange={(e) => setSetting("requireFeedback", e.target.checked)} /> Require feedback fields</label>
          <label className="check-row"><input type="checkbox" checked={form.settings.includeIncompleteInRankings} onChange={(e) => setSetting("includeIncompleteInRankings", e.target.checked)} /> Include incomplete teams in rankings</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Button type="submit">Save settings</Button>
            <Button type="button" variant="secondary" onClick={closeEvent}>Close competition</Button>
            <Button type="button" variant="danger" onClick={() => setConfirmDelete(true)}>Delete competition</Button>
          </div>
        </div>
      </form>
      <ConfirmDialog
        open={confirmDelete}
        title="Delete this competition?"
        body="Teams, judges, assignments, and evaluations will be removed."
        danger
        confirmLabel="Delete"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          await eventsApi.remove(event._id);
          navigate("/director/events");
        }}
      />
    </div>
  );
}
