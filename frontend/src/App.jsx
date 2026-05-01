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
import MainLayout from "./components/MainLayout";

// HOC pour protéger les routes et appliquer le Layout
const ProtectedRoute = ({ children, allowedRoles }) => {
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
  
  return <MainLayout>{children}</MainLayout>;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Pages Publiques (Sans Sidebar) */}
          <Route path="/"         element={<LandingPage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Routes Protégées (Avec Sidebar/Header via MainLayout) */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={["Client", "Administrateur"]}>
              <ClientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/transactions" element={
            <ProtectedRoute allowedRoles={["Client", "Administrateur"]}>
              <TransactionsPage />
            </ProtectedRoute>
          } />
          <Route path="/transfers" element={
            <ProtectedRoute allowedRoles={["Client"]}>
              <TransferPage />
            </ProtectedRoute>
          } />
          <Route path="/score" element={
            <ProtectedRoute allowedRoles={["Client", "Analyste Risque"]}>
              <ScorePage />
            </ProtectedRoute>
          } />
          {/* Note: In App.jsx line 62 it was /scoring, but MainLayout uses /score. Harmonizing to /score */}
          <Route path="/scoring" element={<Navigate to="/score" replace />} />

          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          } />

          {/* Accès Admin / Staff */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={["Administrateur"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/agent" element={
            <ProtectedRoute allowedRoles={["Agent de Crédit", "Administrateur"]}>
              <AgentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/risk" element={
            <ProtectedRoute allowedRoles={["Analyste Risque", "Administrateur"]}>
              <RiskDashboard />
            </ProtectedRoute>
          } />
          <Route path="/audit" element={
            <ProtectedRoute allowedRoles={["Régulateur (BCRG)", "Administrateur"]}>
              <AuditPage />
            </ProtectedRoute>
          } />
          <Route path="/client/:id" element={
            <ProtectedRoute allowedRoles={["Administrateur", "Agent de Crédit", "Analyste Risque"]}>
              <ClientDetailPage />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

