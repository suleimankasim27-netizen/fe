import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, GuestRoute } from "./components/ProtectedRoute.jsx";
import Landing from "./pages/Landing.jsx";
import Signup from "./pages/director/Signup.jsx";
import Login from "./pages/director/Login.jsx";
import Dashboard from "./pages/director/Dashboard.jsx";
import Events from "./pages/director/Events.jsx";
import EventDetail from "./pages/director/EventDetail.jsx";
import Judges from "./pages/director/Judges.jsx";
import Teams from "./pages/director/Teams.jsx";
import Evaluations from "./pages/director/Evaluations.jsx";
import Results from "./pages/director/Results.jsx";
import Profile from "./pages/director/Profile.jsx";
import EvaluatorHome from "./pages/evaluate/EvaluatorHome.jsx";
import EvaluateTeam from "./pages/evaluate/EvaluateTeam.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<GuestRoute />}>
        <Route path="/director/signup" element={<Signup />} />
        <Route path="/director/login" element={<Login />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/director/dashboard" element={<Dashboard />} />
        <Route path="/director/events" element={<Events />} />
        <Route path="/director/events/new" element={<Navigate to="/director/events" replace state={{ openNewEvent: true }} />} />
        <Route path="/director/events/:eventId" element={<EventDetail />} />
        <Route path="/director/events/:eventId/rankings" element={<EventDetail />} />
        <Route path="/director/judges" element={<Judges />} />
        <Route path="/director/teams" element={<Teams />} />
        <Route path="/director/evaluations" element={<Evaluations />} />
        <Route path="/director/results" element={<Results />} />
        <Route path="/director/profile" element={<Profile />} />
      </Route>
      <Route path="/evaluate/:token" element={<EvaluatorHome />} />
      <Route path="/evaluate/:token/teams/:teamId" element={<EvaluateTeam />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
