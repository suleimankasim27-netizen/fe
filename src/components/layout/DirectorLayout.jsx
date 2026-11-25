import { useAuth } from "../../context/AuthContext.jsx";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, CalendarDays, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { to: "/director/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/director/events", label: "Competitions", icon: CalendarDays },
];

export function DirectorLayout({ children }) {
  const { director, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/director/login");
  }

  return (
    <div className="shell">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-top">
          <div className="brand">
            <span className="mark" />
            <div>
              <strong>Pitching Evaluator</strong>
              <small>Judging Platform</small>
            </div>
          </div>
          <button className="sidebar-close" type="button" onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
        <nav>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              <l.icon size={18} />
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <NavLink to="/director/profile" className="profile-link" onClick={() => setOpen(false)}>
            <span className="avatar">{director?.name?.[0] || "D"}</span>
            <span className="who">
              <strong>{director?.name}</strong>
              <small>Profile</small>
            </span>
          </NavLink>
          <button className="logout" type="button" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
      {open && <div className="sidebar-scrim" onClick={() => setOpen(false)} />}
      <div className="main">
        <button className="menu-btn" type="button" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <div className="content">{children}</div>
      </div>
      <style>{`
        .shell { display: flex; min-height: 100vh; }
        .sidebar {
          width: var(--sidebar);
          background: var(--navy);
          color: #fff;
          padding: 24px 16px 16px;
          position: sticky;
          top: 0;
          height: 100vh;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
        }
        .sidebar-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 28px;
        }
        .brand { display: flex; gap: 12px; align-items: center; padding: 0 8px; }
        .mark {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, var(--gold), #e0c070);
          flex-shrink: 0;
        }
        .brand strong { display: block; font-size: 15px; line-height: 1.25; }
        .brand small { color: rgba(255,255,255,0.65); font-size: 12px; }
        .sidebar nav { flex: 1; }
        .nav-link {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 8px; color: rgba(255,255,255,0.78);
          margin-bottom: 4px; font-weight: 500;
        }
        .nav-link.active, .nav-link:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .sidebar-footer {
          margin-top: auto;
          padding: 14px 12px 8px;
          border-top: 1px solid rgba(255,255,255,0.12);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .profile-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          border-radius: 10px;
          color: #fff;
        }
        .profile-link:hover { background: rgba(255,255,255,0.08); }
        .avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(255,255,255,0.14);
          color: #fff;
          display: grid; place-items: center; font-weight: 700;
          flex-shrink: 0;
        }
        .who strong { display: block; font-size: 14px; line-height: 1.3; }
        .who small { color: rgba(255,255,255,0.62); font-size: 12px; }
        .logout {
          width: 100%;
          border: 1px solid rgba(255,255,255,0.16);
          background: rgba(255,255,255,0.06);
          height: 40px;
          padding: 0 12px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          font-weight: 600;
          color: rgba(255,255,255,0.88);
        }
        .logout:hover { background: rgba(255,255,255,0.12); }
        .main { flex: 1; min-width: 0; }
        .content { padding: 28px; }
        .menu-btn, .sidebar-close, .sidebar-scrim { display: none; }
        @media (max-width: 900px) {
          .sidebar {
            position: fixed; left: 0; top: 0; z-index: 40;
            transform: translateX(-100%);
            transition: 0.2s ease;
          }
          .sidebar.open { transform: none; }
          .menu-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            margin: 12px 0 0 12px;
            background: #fff;
            border: 1px solid var(--line);
            border-radius: 8px;
            cursor: pointer;
            color: var(--navy);
          }
          .sidebar-close {
            display: inline-flex;
            background: none;
            border: none;
            color: rgba(255,255,255,0.8);
            cursor: pointer;
            padding: 4px;
          }
          .content { padding: 16px; }
          .sidebar-scrim {
            display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 30;
          }
        }
      `}</style>
    </div>
  );
}
