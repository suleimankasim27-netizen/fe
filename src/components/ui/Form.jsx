export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  type = "button",
  style,
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${className}`}
      disabled={disabled || loading}
      style={style}
      {...props}
    >
      {loading ? "Please wait…" : children}
      <style>{`
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid transparent;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.15s ease;
          white-space: nowrap;
        }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-md { height: 42px; padding: 0 16px; font-size: 14px; }
        .btn-lg { height: 48px; padding: 0 20px; font-size: 15px; min-width: 160px; }
        .btn-sm { height: 34px; padding: 0 12px; font-size: 13px; }
        .btn-primary { background: var(--navy); color: #fff; }
        .btn-primary:hover:not(:disabled) { background: var(--navy-2); }
        .btn-gold { background: var(--gold); color: #fff; }
        .btn-secondary { background: #fff; color: var(--ink); border-color: var(--line-strong); }
        .btn-secondary:hover:not(:disabled) { background: #f8fafc; }
        .btn-ghost { background: transparent; color: var(--muted); }
        .btn-danger { background: var(--danger-soft); color: var(--danger); border-color: #f3c4c0; }
        .btn-success { background: var(--success); color: #fff; }
      `}</style>
    </button>
  );
}

export function Input({ label, error, hint, id, ...props }) {
  const inputId = id || props.name;
  return (
    <label className="field" htmlFor={inputId}>
      {label && <span className="field-label">{label}</span>}
      <input id={inputId} className={`field-input ${error ? "has-error" : ""}`} {...props} />
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
      <style>{`
        .field { display: flex; flex-direction: column; gap: 6px; width: 100%; }
        .field-label { font-size: 13px; font-weight: 600; color: var(--ink); }
        .field-input, .field-textarea, .field-select {
          height: 44px;
          border: 1px solid var(--line-strong);
          border-radius: 8px;
          padding: 0 12px;
          background: #fff;
          color: var(--ink);
          font-size: 15px;
          outline: none;
        }
        .field-textarea { height: auto; min-height: 96px; padding: 10px 12px; resize: vertical; }
        .field-input:focus, .field-textarea:focus, .field-select:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(21, 128, 61, 0.15);
        }
        .has-error { border-color: var(--danger); }
        .field-error { color: var(--danger); font-size: 12px; }
        .field-hint { color: var(--muted); font-size: 12px; }
      `}</style>
    </label>
  );
}

export function Textarea({ label, error, id, ...props }) {
  const inputId = id || props.name;
  return (
    <label className="field" htmlFor={inputId}>
      {label && <span className="field-label">{label}</span>}
      <textarea id={inputId} className={`field-textarea ${error ? "has-error" : ""}`} {...props} />
      {error && <span className="field-error">{error}</span>}
      <style>{`
        .field { display: flex; flex-direction: column; gap: 6px; width: 100%; }
        .field-label { font-size: 13px; font-weight: 600; color: var(--ink); }
        .field-textarea {
          width: 100%;
          min-height: 96px;
          border: 1px solid var(--line-strong);
          border-radius: 8px;
          padding: 10px 12px;
          background: #fff;
          color: var(--ink);
          font-size: 15px;
          line-height: 1.5;
          resize: vertical;
          outline: none;
        }
        .field-textarea:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(21, 128, 61, 0.15);
        }
        .field-textarea:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .field-textarea.has-error { border-color: var(--danger); }
        .field-error { color: var(--danger); font-size: 12px; }
      `}</style>
    </label>
  );
}

export function Select({ label, error, children, id, ...props }) {
  const inputId = id || props.name;
  return (
    <label className="field" htmlFor={inputId}>
      {label && <span className="field-label">{label}</span>}
      <select id={inputId} className="field-select" {...props}>
        {children}
      </select>
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}
