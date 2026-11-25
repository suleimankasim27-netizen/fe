import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = "success") => {
    const id = crypto.randomUUID();
    setToasts((list) => [...list, { id, message, type }]);
    setTimeout(() => {
      setToasts((list) => list.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="toast-stack" role="status">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
      <style>{`
        .toast-stack {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 80;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .toast {
          background: #fff;
          border: 1px solid var(--line);
          box-shadow: var(--shadow-lg);
          border-radius: 10px;
          padding: 12px 16px;
          min-width: 240px;
          max-width: 360px;
          font-size: 14px;
        }
        .toast-success { border-left: 4px solid var(--success); }
        .toast-error { border-left: 4px solid var(--danger); }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
