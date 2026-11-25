import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { DirectorLayout } from "./layout/DirectorLayout.jsx";
import { Skeleton } from "./ui/Display.jsx";

export function ProtectedRoute() {
  const { director, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <Skeleton height={28} width={220} />
        <div style={{ height: 16 }} />
        <Skeleton height={160} />
      </div>
    );
  }
  if (!director) return <Navigate to="/director/login" replace />;
  return (
    <DirectorLayout>
      <Outlet />
    </DirectorLayout>
  );
}

export function GuestRoute() {
  const { director, loading } = useAuth();
  if (loading) return null;
  if (director) return <Navigate to="/director/dashboard" replace />;
  return <Outlet />;
}
