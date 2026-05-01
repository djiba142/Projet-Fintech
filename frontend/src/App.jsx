import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage      from "./pages/LandingPage";
import LoginPage        from "./pages/LoginPage";
import RegisterPage     from "./pages/RegisterPage";
import ClientDashboard  from "./pages/ClientDashboard";
import TransactionsPage from "./pages/TransactionsPage";
import TransferPage     from "./pages/TransferPage";
import ScorePage        from "./pages/ScorePage";
import ProfilePage      from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import ClientDetailPage from "./pages/ClientDetailPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminInstitutions from "./pages/admin/AdminInstitutions";
import AdminTransactions from "./pages/admin/AdminTransactions";
import RiskDashboard    from "./pages/risk/RiskDashboard";
import AuditDashboard from "./pages/audit/AuditDashboard";
import AuditTransactions from "./pages/audit/AuditTransactions";
import AuditAlerts from "./pages/audit/AuditAlerts";
import AuditInstitutions from "./pages/audit/AuditInstitutions";
import AuditReports from "./pages/audit/AuditReports";
import RiskClients from "./pages/risk/RiskClients";
import RiskAnalysis from "./pages/risk/RiskAnalysis";
import { AuthProvider, useAuth } from "./context/AuthContext";
import MainLayout from "./components/MainLayout";
import "./App.css";

// --- Sécurisation du Routage ---
function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Chargement...</div>;
  if (!user || !user.role) return <Navigate to="/login" replace />;

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

// --- Centralisation du Layout ---
function LayoutRoute({ children, allowedRoles }) {
  return (
    <PrivateRoute allowedRoles={allowedRoles}>
      <MainLayout>{children}</MainLayout>
    </PrivateRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Pages Publiques */}
          <Route path="/"         element={<LandingPage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Accès Client */}
          <Route path="/dashboard" element={
            <LayoutRoute allowedRoles={["Client", "Administrateur"]}>
              <ClientDashboard />
            </LayoutRoute>
          } />
          <Route path="/transactions" element={
            <LayoutRoute allowedRoles={["Client", "Administrateur"]}>
              <TransactionsPage />
            </LayoutRoute>
          } />
          <Route path="/transfers" element={
            <LayoutRoute allowedRoles={["Client", "Administrateur"]}>
              <TransferPage />
            </LayoutRoute>
          } />
          <Route path="/score" element={
            <LayoutRoute allowedRoles={["Client", "Administrateur"]}>
              <ScorePage />
            </LayoutRoute>
          } />
          <Route path="/profile" element={
            <LayoutRoute allowedRoles={["Client", "Agent de Crédit", "Administrateur", "Analyste Risque", "Régulateur (BCRG)"]}>
              <ProfilePage />
            </LayoutRoute>
          } />
          <Route path="/notifications" element={
            <LayoutRoute allowedRoles={["Client", "Agent de Crédit", "Administrateur", "Analyste Risque", "Régulateur (BCRG)"]}>
              <NotificationsPage />
            </LayoutRoute>
          } />

          {/* Accès Institution (Agent) */}
          <Route path="/agent" element={
            <LayoutRoute allowedRoles={["Agent de Crédit", "Administrateur"]}>
              <AgentDashboard />
            </LayoutRoute>
          } />
          <Route path="/client-detail" element={
            <LayoutRoute allowedRoles={["Agent de Crédit", "Administrateur"]}>
              <ClientDetailPage />
            </LayoutRoute>
          } />

          {/* Accès Administrateur */}
          <Route path="/admin" element={
            <LayoutRoute allowedRoles={["Administrateur"]}>
              <AdminDashboard />
            </LayoutRoute>
          } />
          <Route path="/admin-users" element={
            <LayoutRoute allowedRoles={["Administrateur"]}>
              <AdminUsers />
            </LayoutRoute>
          } />
          <Route path="/admin-logs" element={
            <LayoutRoute allowedRoles={["Administrateur"]}>
              <AdminLogs />
            </LayoutRoute>
          } />
          <Route path="/admin-settings" element={
            <LayoutRoute allowedRoles={["Administrateur"]}>
              <AdminSettings />
            </LayoutRoute>
          } />
          <Route path="/admin-roles" element={
            <LayoutRoute allowedRoles={["Administrateur"]}>
              <AdminRoles />
            </LayoutRoute>
          } />
          <Route path="/admin-institutions" element={
            <LayoutRoute allowedRoles={["Administrateur"]}>
              <AdminInstitutions />
            </LayoutRoute>
          } />
          <Route path="/admin-transactions" element={
            <LayoutRoute allowedRoles={["Administrateur"]}>
              <AdminTransactions />
            </LayoutRoute>
          } />

          {/* Accès Analyste Risque */}
          <Route path="/risk" element={
            <LayoutRoute allowedRoles={["Analyste Risque", "Administrateur"]}>
              <RiskDashboard />
            </LayoutRoute>
          } />
          <Route path="/risk-clients" element={
            <LayoutRoute allowedRoles={["Analyste Risque", "Administrateur"]}>
              <RiskClients />
            </LayoutRoute>
          } />
          <Route path="/risk-analysis" element={
            <LayoutRoute allowedRoles={["Analyste Risque", "Administrateur"]}>
              <RiskAnalysis />
            </LayoutRoute>
          } />

          {/* Accès Régulateur BCRG */}
          <Route path="/audit" element={
            <LayoutRoute allowedRoles={["Régulateur (BCRG)", "Administrateur"]}>
              <AuditDashboard />
            </LayoutRoute>
          } />
          <Route path="/audit-transactions" element={
            <LayoutRoute allowedRoles={["Régulateur (BCRG)", "Administrateur"]}>
              <AuditTransactions />
            </LayoutRoute>
          } />
          <Route path="/audit-alerts" element={
            <LayoutRoute allowedRoles={["Régulateur (BCRG)", "Administrateur"]}>
              <AuditAlerts />
            </LayoutRoute>
          } />
          <Route path="/audit-institutions" element={
            <LayoutRoute allowedRoles={["Régulateur (BCRG)", "Administrateur"]}>
              <AuditInstitutions />
            </LayoutRoute>
          } />
          <Route path="/audit-reports" element={
            <LayoutRoute allowedRoles={["Régulateur (BCRG)", "Administrateur"]}>
              <AuditReports />
            </LayoutRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
