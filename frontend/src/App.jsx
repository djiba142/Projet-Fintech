import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ClientDashboard from "./pages/ClientDashboard";
import TransactionsPage from "./pages/TransactionsPage";
import TransferPage from "./pages/TransferPage";
import ScorePage from "./pages/ScorePage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/AdminDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import RiskDashboard from "./pages/RiskDashboard";
import AuditPage from "./pages/AuditPage";
import ClientDetailPage from "./pages/ClientDetailPage";
import NotificationsPage from "./pages/NotificationsPage";

// HOC pour protéger les routes
const LayoutRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) return (
    <div style={{display:'flex', height:'100vh', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#F8FAFC'}}>
       <div className="spinner" style={{width: 50, height: 50, border: '5px solid #E2E8F0', borderTopColor: '#006233', borderRadius: '50%', animation: 'spin 1s linear infinite'}} />
       <p style={{marginTop: 20, fontWeight: 900, color: '#1E293B'}}>Initialisation de Kandjou...</p>
       <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  
  return children;
};

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
            <LayoutRoute allowedRoles={["Client"]}>
              <TransferPage />
            </LayoutRoute>
          } />
          <Route path="/scoring" element={
            <LayoutRoute allowedRoles={["Client", "Analyste Risque"]}>
              <ScorePage />
            </LayoutRoute>
          } />
          <Route path="/profile" element={
            <LayoutRoute>
              <ProfilePage />
            </LayoutRoute>
          } />
          <Route path="/notifications" element={
            <LayoutRoute>
              <NotificationsPage />
            </LayoutRoute>
          } />

          {/* Accès Admin / Staff */}
          <Route path="/admin" element={
            <LayoutRoute allowedRoles={["Administrateur"]}>
              <AdminDashboard />
            </LayoutRoute>
          } />
          <Route path="/agent" element={
            <LayoutRoute allowedRoles={["Agent de Crédit", "Administrateur"]}>
              <AgentDashboard />
            </LayoutRoute>
          } />
          <Route path="/risk" element={
            <LayoutRoute allowedRoles={["Analyste Risque", "Administrateur"]}>
              <RiskDashboard />
            </LayoutRoute>
          } />
          <Route path="/audit" element={
            <Route allowedRoles={["Régulateur (BCRG)", "Administrateur"]}>
              <AuditPage />
            </Route>
          } />
          <Route path="/client/:id" element={
            <LayoutRoute allowedRoles={["Administrateur", "Agent de Crédit", "Analyste Risque"]}>
              <ClientDetailPage />
            </LayoutRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
