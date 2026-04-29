import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage      from "./pages/LandingPage";
import LoginPage        from "./pages/LoginPage";
import RegisterPage     from "./pages/RegisterPage";
import ClientDashboard  from "./pages/ClientDashboard";
import TransactionsPage from "./pages/TransactionsPage";
import TransferPage     from "./pages/TransferPage";
import ScorePage        from "./pages/ScorePage";
import ProfilePage      from "./pages/ProfilePage";
import AgentDashboard   from "./pages/AgentDashboard";
import ClientDetailPage from "./pages/ClientDetailPage";
import AdminDashboard   from "./pages/AdminDashboard";
import RiskDashboard    from "./pages/RiskDashboard";
import AuditPage        from "./pages/AuditPage";
import "./App.css";

function PrivateRoute({ children, allowedRoles }) {
  const raw = localStorage.getItem("kandjou_user");
  if (!raw) return <Navigate to="/login" replace />;
  const user = JSON.parse(raw);
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const map = {
      "Client": "/dashboard",
      "Agent de Crédit": "/agent",
      "Administrateur": "/admin",
      "Analyste Risque": "/risk",
      "Régulateur (BCRG)": "/audit"
    };
    return <Navigate to={map[user.role] || "/login"} replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Client */}
        <Route path="/dashboard" element={
          <PrivateRoute allowedRoles={["Client", "Administrateur"]}>
            <ClientDashboard />
          </PrivateRoute>
        } />
        <Route path="/transactions" element={
          <PrivateRoute allowedRoles={["Client", "Administrateur"]}>
            <TransactionsPage />
          </PrivateRoute>
        } />
        <Route path="/transfers" element={
          <PrivateRoute allowedRoles={["Client", "Administrateur"]}>
            <TransferPage />
          </PrivateRoute>
        } />
        <Route path="/score" element={
          <PrivateRoute allowedRoles={["Client", "Administrateur"]}>
            <ScorePage />
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute allowedRoles={["Client", "Administrateur"]}>
            <ProfilePage />
          </PrivateRoute>
        } />

        {/* Institution financière */}
        <Route path="/agent" element={
          <PrivateRoute allowedRoles={["Agent de Crédit", "Administrateur"]}>
            <AgentDashboard />
          </PrivateRoute>
        } />
        <Route path="/client-detail" element={
          <PrivateRoute allowedRoles={["Agent de Crédit", "Administrateur"]}>
            <ClientDetailPage />
          </PrivateRoute>
        } />

        {/* Administrateur */}
        <Route path="/admin" element={
          <PrivateRoute allowedRoles={["Administrateur"]}>
            <AdminDashboard />
          </PrivateRoute>
        } />

        {/* Analyste Risque */}
        <Route path="/risk" element={
          <PrivateRoute allowedRoles={["Analyste Risque", "Administrateur"]}>
            <RiskDashboard />
          </PrivateRoute>
        } />

        {/* Régulateur BCRG */}
        <Route path="/audit" element={
          <PrivateRoute allowedRoles={["Administrateur", "Analyste Risque", "Régulateur (BCRG)"]}>
            <AuditPage />
          </PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
