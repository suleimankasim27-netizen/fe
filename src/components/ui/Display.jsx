import { Button } from "./Form.jsx";

export function Card({ children, className = "", style, padded = true }) {
  return (
    <div className={`card ${padded ? "card-pad" : ""} ${className}`} style={style}>
      {children}
      <style>{`
        .card {
          background: transparent;
          border: none;
          box-shadow: none;
        }
        .card-pad { padding: 20px; }
      `}</style>
    </div>
  );
}

export function Badge({ children, tone = "neutral" }) {
  return (
    <span className={`badge badge-${tone}`}>
      {children}
      <style>{`
        .badge {
          display: inline-flex;
          align-items: center;
          height: 24px;
          padding: 0 8px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
        }
        .badge-neutral { background: #eef2f6; color: #445566; }
        .badge-active { background: var(--success-soft); color: var(--success); }
        .badge-draft { background: var(--info-soft); color: var(--accent); }
        .badge-completed { background: var(--gold-soft); color: #8a6918; }
        .badge-archived { background: #eee; color: #666; }
        .badge-pending { background: var(--warning-soft); color: var(--warning); }
        .badge-danger { background: var(--danger-soft); color: var(--danger); }
      `}</style>
    </span>
  );
}

export function ProgressBar({ value, max = 100 }) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="pbar">
      <div className="pbar-fill" style={{ width: `${pct}%` }} />
      <style>{`
        .pbar {
          height: 8px;
          background: #e8eef4;
          border-radius: 999px;
          overflow: hidden;
        }
        .pbar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--navy), var(--accent));
          border-radius: 999px;
        }
      `}</style>
    </div>
  );
}

export function EmptyState({ title, body, action }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      {body && <p>{body}</p>}
      {action}
      <style>{`
        .empty {
          text-align: center;
          padding: 48px 20px;
          color: var(--muted);
        }
        .empty h3 {
          font-family: var(--serif);
          color: var(--ink);
          font-size: 1.25rem;
          margin-bottom: 8px;
        }
      `}</style>
    </div>
  );
}

export function Skeleton({ height = 16, width = "100%" }) {
  return (
    <div className="skel" style={{ height, width }}>
      <style>{`
        .skel {
          background: linear-gradient(90deg, #eef2f6 25%, #f7f9fb 37%, #eef2f6 63%);
          background-size: 400% 100%;
          animation: shimmer 1.2s ease infinite;
          border-radius: 6px;
        }
        @keyframes shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: 0 0; }
        }
      `}</style>
    </div>
  );
}

export function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {title && <h2>{title}</h2>}
        {children}
      </div>
      <style>{`
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(20, 83, 45, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 70;
          padding: 16px;
        }
        .modal {
          background: #fff;
          border-radius: 16px;
          width: min(520px, 100%);
          padding: 24px;
          box-shadow: var(--shadow-lg);
        }
        .modal h2 {
          font-family: var(--serif);
          font-size: 1.35rem;
          margin-bottom: 12px;
        }
      `}</style>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  onCancel,
  onConfirm,
  loading,
  danger,
}) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p style={{ color: "var(--muted)", marginBottom: 20 }}>{body}</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
