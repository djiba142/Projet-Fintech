import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage     from "./pages/LandingPage";
import LoginPage       from "./pages/LoginPage";
import AgentDashboard  from "./pages/AgentDashboard";
import AdminDashboard  from "./pages/AdminDashboard";
import RiskDashboard   from "./pages/RiskDashboard";
import AuditPage       from "./pages/AuditPage";
import "./App.css";

function PrivateRoute({ children, allowedRoles }) {
  const raw  = localStorage.getItem("gn_user");
  if (!raw) return <Navigate to="/login" replace />;
  const user = JSON.parse(raw);
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const map = { "Agent de Crédit": "/agent", "Administrateur": "/admin", "Analyste Risque": "/risk" };
    return <Navigate to={map[user.role] || "/login"} replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"      element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/agent" element={
          <PrivateRoute allowedRoles={["Agent de Crédit", "Administrateur"]}>
            <AgentDashboard />
          </PrivateRoute>
        } />

        <Route path="/admin" element={
          <PrivateRoute allowedRoles={["Administrateur"]}>
            <AdminDashboard />
          </PrivateRoute>
        } />

        <Route path="/risk" element={
          <PrivateRoute allowedRoles={["Analyste Risque", "Administrateur"]}>
            <RiskDashboard />
          </PrivateRoute>
        } />

        <Route path="/audit" element={
          <PrivateRoute allowedRoles={["Administrateur", "Analyste Risque"]}>
            <AuditPage />
          </PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
