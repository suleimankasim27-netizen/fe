import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { evaluateApi } from "../../api/client.js";
import { ScoreSelector } from "../../components/ui/ScoreSelector.jsx";
import { Textarea } from "../../components/ui/Form.jsx";
import { Shell } from "./EvaluatorHome.jsx";

const MESSAGES = {
  INVALID_LINK: "This evaluation link is invalid.",
  REVOKED_LINK: "This evaluation link has been revoked.",
  EXPIRED_LINK: "This evaluation link has expired.",
  EVENT_CLOSED: "This event has been closed.",
  ALREADY_SUBMITTED: "You have already submitted this evaluation.",
  NOT_ASSIGNED: "You are not assigned to evaluate this team.",
};

function Spinner() {
  return <div className="eval-spinner" aria-hidden="true" />;
}

export default function EvaluateTeam() {
  const { token, teamId } = useParams();
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [scores, setScores] = useState({});
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [loadingPage, setLoadingPage] = useState(true);
  const [saveState, setSaveState] = useState("idle");
  const saveTimer = useRef(null);
  const saveSeq = useRef(0);
  const lastSave = useRef(null);

  function loadTeam() {
    setLoadingPage(true);
    setLoadError("");
    evaluateApi
      .team(token, teamId)
      .then((payload) => {
        setData(payload);
        if (payload.evaluation) {
          const map = {};
          payload.evaluation.scores.forEach((s) => {
            map[s.criterionId] = s.score;
          });
          setScores(map);
          setStrengths(payload.evaluation.strengths || "");
          setImprovements(payload.evaluation.improvements || "");
        }
      })
      .catch((e) => setLoadError(MESSAGES[e.code] || e.message || "Could not load this evaluation."))
      .finally(() => setLoadingPage(false));
  }

  useEffect(() => {
    loadTeam();
  }, [token, teamId]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const total = useMemo(() => {
    if (!data) return 0;
    return data.criteria.reduce((sum, c) => sum + Number(scores[c._id] ?? 0), 0);
  }, [data, scores]);

  const submittedComplete = Boolean(data?.evaluation?.complete);
  const closed = data?.event?.closed;
  const readOnly = closed || (submittedComplete && !data?.event?.settings?.allowEvaluatorEdits);
  const saving = saveState === "saving";

  async function persist(nextScores, nextStrengths, nextImprovements, criteria) {
    const payloadScores = criteria
      .filter((c) => nextScores[c._id] !== undefined && nextScores[c._id] !== null && nextScores[c._id] !== "")
      .map((c) => ({ criterionId: c._id, score: nextScores[c._id] }));
    if (!payloadScores.length) return;

    lastSave.current = { nextScores, nextStrengths, nextImprovements, criteria };
    const seq = ++saveSeq.current;
    setSaveState("saving");
    setSaveError("");
    try {
      const result = await evaluateApi.submit(token, teamId, {
        scores: payloadScores,
        strengths: nextStrengths,
        improvements: nextImprovements,
      });
      if (seq !== saveSeq.current) return;
      setData((d) => (d ? { ...d, evaluation: result.evaluation } : d));
      setSaveState("saved");
    } catch (e) {
      if (seq !== saveSeq.current) return;
      setSaveState("error");
      setSaveError(MESSAGES[e.code] || e.message || "Could not save this evaluation.");
    }
  }

  function retrySave() {
    const last = lastSave.current;
    if (!last) return;
    persist(last.nextScores, last.nextStrengths, last.nextImprovements, last.criteria);
  }

  function dismissSaveError() {
    setSaveState("idle");
    setSaveError("");
  }

  function onScoreChange(criterionId, value) {
    if (!data || readOnly || saving) return;
    const next = { ...scores, [criterionId]: value };
    setScores(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    persist(next, strengths, improvements, data.criteria);
  }

  function queueFeedbackSave(nextStrengths, nextImprovements) {
    if (!data || readOnly || saving) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      persist(scores, nextStrengths, nextImprovements, data.criteria);
    }, 500);
  }

  if (loadingPage) {
    return (
      <Shell>
        <div className="eval-page-loader" role="status" aria-live="polite">
          <Spinner />
          <p>Loading evaluation…</p>
        </div>
        <EvalStyles />
      </Shell>
    );
  }

  if (loadError || !data) {
    return (
      <Shell>
        <div className="eval-page-error" role="alert">
          <h1>Unable to evaluate</h1>
          <p>{loadError || "This evaluation could not be loaded."}</p>
          <div className="eval-error-actions">
            <button type="button" className="eval-btn" onClick={loadTeam}>
              Try again
            </button>
            <Link to={`/evaluate/${token}`}>Back to assignments</Link>
          </div>
        </div>
        <EvalStyles />
      </Shell>
    );
  }

  return (
    <Shell>
      <Link to={`/evaluate/${token}`} className="back">
        ← Your evaluations
      </Link>
      <p className="kicker">{data.event.name}</p>
      <h1>Evaluate {data.team.name}</h1>
      <p className="who">Evaluator · {data.evaluator.name}</p>
      {closed && <div className="banner">This event has been closed.</div>}
      <div className="stack">
        {data.criteria.map((c) => (
          <ScoreSelector
            key={c._id}
            criterion={c}
            value={scores[c._id]}
            disabled={readOnly || saving}
            onChange={(n) => onScoreChange(c._id, n)}
          />
        ))}
        <section className="fb">
          <Textarea
            label="Strengths & Key Highlights"
            value={strengths}
            placeholder="What stood out? Key strengths of this team…"
            rows={5}
            onChange={(e) => {
              const value = e.target.value;
              setStrengths(value);
              queueFeedbackSave(value, improvements);
            }}
            disabled={readOnly || saving}
          />
          <Textarea
            label="Areas for Improvement / Main Risks"
            value={improvements}
            placeholder="What should they improve? Main risks or gaps…"
            rows={5}
            onChange={(e) => {
              const value = e.target.value;
              setImprovements(value);
              queueFeedbackSave(strengths, value);
            }}
            disabled={readOnly || saving}
          />
        </section>
      </div>
      <aside className="summary">
        <div className="summary-head">
          <span>Score summary</span>
          {saveState === "saved" && <em className="save-ok">Saved</em>}
        </div>
        <div className="lines">
          {data.criteria.map((c) => (
            <div key={c._id}>
              <span>{c.name}</span>
              <strong>
                {scores[c._id] ?? "—"} / {c.maxPoints}
              </strong>
            </div>
          ))}
        </div>
        <div className="total">
          <span>TOTAL</span>
          <strong>
            {total} / {data.maxTotal}
          </strong>
        </div>
      </aside>

      {saving && (
        <div className="eval-overlay" role="status" aria-live="polite">
          <div className="eval-overlay-card">
            <Spinner />
            <p>Saving evaluation…</p>
          </div>
        </div>
      )}

      {saveState === "error" && saveError && (
        <div className="eval-overlay" role="alert">
          <div className="eval-overlay-card eval-overlay-error">
            <h2>Could not save</h2>
            <p>{saveError}</p>
            <div className="eval-error-actions">
              <button type="button" className="eval-btn" onClick={retrySave}>
                Try again
              </button>
              <button type="button" className="eval-btn ghost" onClick={dismissSaveError}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
      <EvalStyles />
    </Shell>
  );
}

function EvalStyles() {
  return (
    <style>{`
      .back { display: inline-block; margin-bottom: 8px; color: var(--accent); font-weight: 600; }
      .kicker { color: var(--gold); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; font-size: 12px; }
      h1 { font-family: var(--serif); font-size: 1.6rem; margin: 4px 0; }
      .who { color: var(--muted); margin-bottom: 16px; }
      .banner { background: var(--warning-soft); padding: 12px; border-radius: 10px; margin-bottom: 12px; }
      .stack { display: grid; gap: 12px; }
      .fb {
        background: #fff;
        border: 1px solid var(--line);
        border-radius: 16px;
        padding: 18px 16px;
        display: grid;
        gap: 16px;
        box-shadow: var(--shadow);
      }
      .fb .field { display: flex; flex-direction: column; gap: 8px; width: 100%; }
      .fb .field-label {
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--ink);
      }
      .fb .field-textarea {
        width: 100%;
        min-height: 120px;
        padding: 12px 14px;
        border: 1px solid var(--line-strong);
        border-radius: 10px;
        background: #f8fafc;
        color: var(--ink);
        font-size: 15px;
        line-height: 1.5;
        resize: vertical;
        outline: none;
      }
      .fb .field-textarea::placeholder { color: #8a97a8; }
      .fb .field-textarea:focus {
        border-color: var(--accent);
        background: #fff;
        box-shadow: 0 0 0 3px rgba(26, 79, 124, 0.12);
      }
      .fb .field-textarea:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
      .summary {
        margin-top: 16px;
        background: #fff;
        border: 1px solid var(--line);
        border-radius: 16px;
        padding: 16px;
      }
      .summary-head {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: baseline;
        margin-bottom: 8px;
        font-size: 13px;
        font-weight: 700;
      }
      .save-ok { font-style: normal; color: var(--success); font-weight: 600; }
      .lines div, .total { display: flex; justify-content: space-between; font-size: 13px; padding: 3px 0; }
      .total { border-top: 1px solid var(--line); margin-top: 6px; padding-top: 8px; font-size: 16px; }
      .eval-page-loader, .eval-page-error {
        min-height: 50vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 12px;
        padding: 32px 12px;
      }
      .eval-page-error h1 { font-size: 1.4rem; }
      .eval-page-error p, .eval-page-loader p, .eval-overlay-card p {
        color: var(--muted);
        max-width: 360px;
      }
      .eval-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 39, 68, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 80;
        padding: 16px;
      }
      .eval-overlay-card {
        background: #fff;
        border-radius: 16px;
        padding: 28px 24px;
        width: min(380px, 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        text-align: center;
        box-shadow: var(--shadow-lg);
      }
      .eval-overlay-error h2 {
        font-family: var(--serif);
        font-size: 1.25rem;
        margin: 0;
      }
      .eval-overlay-error p { color: var(--danger); }
      .eval-error-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: center;
        margin-top: 8px;
      }
      .eval-btn {
        height: 42px;
        padding: 0 16px;
        border-radius: 8px;
        border: none;
        background: var(--navy);
        color: #fff;
        font-weight: 600;
        cursor: pointer;
      }
      .eval-btn.ghost {
        background: #fff;
        color: var(--ink);
        border: 1px solid var(--line-strong);
      }
      .eval-spinner {
        width: 36px;
        height: 36px;
        border: 3px solid #e8eef4;
        border-top-color: var(--navy);
        border-radius: 50%;
        animation: eval-spin 0.8s linear infinite;
      }
      @keyframes eval-spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  );
}
