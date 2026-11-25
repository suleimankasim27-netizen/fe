import { useEffect } from "react";
import { X } from "lucide-react";

export function SidePanel({ open, title, subtitle, onClose, children, footer, width = 480 }) {
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="side-panel-root">
      <button type="button" className="side-panel-scrim" aria-label="Close panel" onClick={onClose} />
      <aside className="side-panel" style={{ maxWidth: width }} role="dialog" aria-modal="true" aria-labelledby="side-panel-title">
        <header className="side-panel-head">
          <div>
            <h2 id="side-panel-title">{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="side-panel-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <div className="side-panel-body">{children}</div>
        {footer && <footer className="side-panel-foot">{footer}</footer>}
      </aside>
      <style>{`
        .side-panel-root {
          position: fixed;
          inset: 0;
          z-index: 60;
          display: flex;
          justify-content: flex-end;
        }
        .side-panel-scrim {
          position: absolute;
          inset: 0;
          border: none;
          background: rgba(20, 83, 45, 0.38);
          cursor: pointer;
        }
        .side-panel {
          position: relative;
          width: min(100%, ${width}px);
          height: 100%;
          background: #fff;
          box-shadow: -16px 0 40px rgba(18, 32, 51, 0.12);
          display: flex;
          flex-direction: column;
          animation: slideIn 0.22s ease;
        }
        @keyframes slideIn {
          from { transform: translateX(24px); opacity: 0.6; }
          to { transform: none; opacity: 1; }
        }
        .side-panel-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          padding: 24px 24px 16px;
          border-bottom: 1px solid var(--line);
        }
        .side-panel-head h2 {
          font-family: var(--serif);
          font-size: 1.45rem;
          color: var(--navy);
        }
        .side-panel-head p {
          color: var(--muted);
          font-size: 14px;
          margin-top: 4px;
        }
        .side-panel-close {
          width: 36px;
          height: 36px;
          border: 1px solid var(--line);
          background: #fff;
          border-radius: 8px;
          display: grid;
          place-items: center;
          cursor: pointer;
          color: var(--muted);
          flex-shrink: 0;
        }
        .side-panel-close:hover { background: var(--bg); color: var(--ink); }
        .side-panel-body {
          flex: 1;
          overflow: auto;
          padding: 20px 24px 28px;
        }
        .side-panel-foot {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding: 16px 24px;
          border-top: 1px solid var(--line);
          background: #fafbfc;
        }
      `}</style>
    </div>
  );
}
