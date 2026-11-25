export function Table({ columns, rows, keyField = "_id", onRowClick, empty }) {
  if (!rows?.length) return empty || null;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[keyField]} onClick={() => onRowClick?.(row)} className={onRowClick ? "clickable" : ""}>
              {columns.map((c) => (
                <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <nav className="event-tabs" role="tablist">
      {tabs.map((t) => {
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={t.id === active}
            className={t.id === active ? "event-tab active" : "event-tab"}
            onClick={() => onChange(t.id)}
          >
            {Icon ? <Icon size={16} strokeWidth={2} /> : null}
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}

export function StatusBadge({ status }) {
  const tone = {
    Draft: "draft",
    Active: "active",
    Completed: "completed",
    Archived: "archived",
    Pending: "pending",
  }[status] || "neutral";
  return <span className={`badge badge-${tone}`}>{status}</span>;
}
