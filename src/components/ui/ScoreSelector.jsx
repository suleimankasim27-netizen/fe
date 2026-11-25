export function ScoreSelector({ criterion, value, onChange, disabled }) {
  return (
    <section className="score-card">
      <div className="score-head">
        <h3>{criterion.name}</h3>
        <span>Maximum {criterion.maxPoints} points</span>
      </div>
      {criterion.description && <p>{criterion.description}</p>}
      <div className="score-btns">
        {criterion.allowedScores.map((n) => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            className={value === n ? "selected" : ""}
            onClick={() => onChange(n)}
          >
            {n}
          </button>
        ))}
      </div>
      <style>{`
        .score-card {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 18px 16px;
          box-shadow: var(--shadow);
        }
        .score-head { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; }
        .score-head h3 { font-size: 1.05rem; }
        .score-head span { color: var(--muted); font-size: 13px; }
        .score-card > p { color: var(--muted); margin: 8px 0 14px; font-size: 14px; }
        .score-btns { display: flex; flex-wrap: wrap; gap: 8px; }
        .score-btns button {
          min-width: 52px;
          min-height: 48px;
          padding: 0 12px;
          border-radius: 10px;
          border: 1px solid var(--line-strong);
          background: #fff;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
        }
        .score-btns button.selected {
          background: var(--navy);
          color: #fff;
          border-color: var(--navy);
        }
        .score-btns button:disabled { opacity: 0.55; cursor: not-allowed; }
      `}</style>
    </section>
  );
}
