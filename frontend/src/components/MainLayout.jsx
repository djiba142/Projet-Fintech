import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  ArrowLeftRight,
  PieChart,
  User,
  LogOut,
  ShieldCheck,
  FileText,
  Menu,
  X,
  AlertTriangle,
  Users,
  Activity,
  Building2,
  ShieldAlert,
  Target,
  Terminal
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function MainLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const role = user?.role || "Client";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getMenu = () => {
    // Menu Client (4 Nav + Profil)
    if (role === "Client") {
      return [
        { path: "/dashboard", label: "Accueil", icon: Home },
        { path: "/transactions", label: "Transactions", icon: FileText },
        { path: "/transfers", label: "Transferts", icon: ArrowLeftRight },
        { path: "/score", label: "Score Crédit", icon: PieChart },
        { path: "/profile", label: "Mon Profil", icon: User },
      ];
    }

    // Menu Agent de Crédit (Fidèle à la maquette)
    if (role === "Agent de Crédit") {
      return [
        { path: "/agent", label: "Accueil", icon: Home },
        { path: "/agent?view=dossiers", label: "Dossiers", icon: FileText },
        { path: "/agent?view=clients", label: "Clients", icon: Users },
        { path: "/agent?view=analyses", label: "Analyses", icon: PieChart },
        { path: "/profile", label: "Mon Profil", icon: User },
      ];
    }

    // Menu Administrateur (Command Center)
    if (role === "Administrateur") {
      return [
        { path: "/admin", label: "Dashboard Système", icon: Home },
        { path: "/admin-users", label: "Utilisateurs", icon: Users },
        { path: "/admin-logs", label: "Journaux (Logs)", icon: Terminal },
        { path: "/admin-settings", label: "Configuration", icon: Settings },
        { path: "/profile", label: "Profil Admin", icon: User },
      ];
    }

    // Menu Analyste Risque (Moteur de Décision)
    if (role === "Analyste Risque") {
      return [
        { path: "/risk", label: "Dashboard Risque", icon: Home },
        { path: "/risk-clients", label: "Répertoire Clients", icon: Users },
        { path: "/audit-alerts", label: "Alertes Risque", icon: AlertTriangle },
        { path: "/profile", label: "Mon Profil", icon: User },
      ];
    }

    // Menu Régulateur BCRG (Centre de Contrôle National)
    if (role === "Régulateur (BCRG)") {
      return [
        { path: "/audit", label: "Supervision", icon: Home },
        { path: "/audit-transactions", label: "Flux & Audit", icon: Activity },
        { path: "/audit-alerts", label: "Alertes AML", icon: ShieldAlert },
        { path: "/audit-institutions", label: "Institutions", icon: Building2 },
        { path: "/audit-reports", label: "Rapports", icon: FileText },
        { path: "/profile", label: "Profil Officiel", icon: User },
      ];
    }

    return [];
  };

  const baseMenu = getMenu();
  const menu = [...baseMenu, { path: "logout", label: "Déconnexion", icon: LogOut, action: handleLogout }];

  const getSidebarBg = () => {
    if (role === "Client") return "#006233"; // Exact mockup Green
    if (role === "Administrateur") return "#1E293B";
    if (role === "Régulateur (BCRG)") return "#0F172A"; 
    if (role === "Analyste Risque") return "#334155"; // Analytical Slate
    return "#004d28";
  };

  const sidebarContent = (
    <>
      {/* Logo Section */}
      <div style={{ display: "flex", alignItems: "center", cursor: "pointer", marginBottom: "3rem" }}
        onClick={() => { 
          const dest = role === "Agent de Crédit" ? "/agent" : 
                       role === "Administrateur" ? "/admin" : 
                       role === "Analyste Risque" ? "/risk" : 
                       role === "Régulateur (BCRG)" ? "/audit" : "/dashboard";
          navigate(dest); 
          setIsMobileMenuOpen(false); 
        }}>
        <img src="/logo_kandjou.png" alt="Kandjou Logo" style={{ height: 48, objectFit: "contain" }} />
        <span style={{ color: "#fff", marginLeft: 10, fontWeight: 900, fontSize: "1.2rem", letterSpacing: -0.5 }}>KANDJOU</span>
      </div>

      {/* Nav Section */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {menu.map((item) => {
          const isMatch = item.path.includes('?') 
            ? (location.pathname === item.path.split('?')[0] && location.search === `?${item.path.split('?')[1]}`)
            : (location.pathname === item.path);
          return (
            <button
              key={item.label}
              onClick={() => {
                if (item.action) item.action();
                else { 
                  navigate(item.path); 
                  setIsMobileMenuOpen(false); 
                }
              }}
              className={isMatch ? "active-sidebar-item" : ""}
              style={{
                display: "flex", alignItems: "center", gap: "1.2rem",
                padding: "1rem 1.6rem", borderRadius: 16, border: "none",
                background: isMatch ? "rgba(255,255,255,0.18)" : "transparent",
                color: isMatch ? "#fff" : "rgba(255,255,255,0.85)",
                fontSize: "1rem", fontWeight: isMatch ? 800 : 600,
                cursor: "pointer", transition: "all 0.2s",
                textAlign: "left", width: "100%"
              }}
            >
              <item.icon size={18} strokeWidth={isMatch ? 2.5 : 2} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom info */}
      <div style={{ padding: "1rem 0", borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: "1rem" }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase" }}>Version 4.2.0 • 2026</p>
      </div>
    </>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#F4F7F6", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="desktop-sidebar" style={{
        width: 240, background: getSidebarBg(), display: "flex", flexDirection: "column",
        padding: "2rem 1.2rem", flexShrink: 0, position: "sticky", top: 0, height: "100vh",
        zIndex: 100, boxShadow: "4px 0 24px rgba(0,0,0,0.05)"
      }}>
        {sidebarContent}
      </aside>

      {/* ── MOBILE OVERLAY ── */}
      {isMobileMenuOpen && (
        <div className="mobile-sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            zIndex: 998, backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* ── MOBILE SIDEBAR ── */}
      <aside className="mobile-sidebar"
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0,
          width: 260, background: getSidebarBg(),
          display: "flex", flexDirection: "column",
          padding: "2rem 1.2rem", zIndex: 999,
          transform: isMobileMenuOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease-in-out",
        }}
      >
        <button onClick={() => setIsMobileMenuOpen(false)} style={{
          position: "absolute", top: 12, right: 12,
          background: "rgba(255,255,255,0.1)", border: "none",
          borderRadius: 10, width: 34, height: 34, cursor: "pointer",
          color: "#fff", display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <X size={18} />
        </button>
        {sidebarContent}
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        {/* Mobile top bar */}
        <div className="mobile-topbar" style={{
          display: "none", alignItems: "center", justifyContent: "space-between",
          padding: "0.8rem 1.2rem", background: "#fff", borderBottom: "1px solid #E2E8F0",
          position: "sticky", top: 0, zIndex: 50
        }}>
          <button onClick={() => setIsMobileMenuOpen(true)} style={{
            background: "#F1F5F9", border: "none", borderRadius: 8, width: 38, height: 38, cursor: "pointer"
          }}>
            <Menu size={20} color="#1E293B" />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src="/logo_kandjou.png" alt="Logo" style={{ height: 28, objectFit: "contain" }} />
            <span style={{ fontWeight: 900, color: "#1E293B", fontSize: "1rem", letterSpacing: -0.5 }}>KANDJOU</span>
          </div>
          <div style={{ width: 38 }} />
        </div>

        {/* ── DESKTOP HEADER ── */}
        <header className="desktop-header" style={{
          height: 80, background: "#fff", borderBottom: "1px solid #F1F5F9",
          display: "flex", alignItems: "center", justifyContent: "flex-end",
          padding: "0 3.5rem", position: "sticky", top: 0, zIndex: 40,
          boxShadow: "0 4px 12px rgba(0,0,0,0.02)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
            {/* Profile Button */}
            <div 
              onClick={() => navigate("/profile")}
              style={{ 
                display: "flex", alignItems: "center", gap: "1rem", 
                padding: "0.5rem 1rem", paddingRight: "2.5rem", 
                borderRight: "1.5px solid #F1F5F9", cursor: "pointer",
                borderRadius: "16px", transition: "all 0.2s"
              }}
              className="profile-trigger"
              onMouseOver={e => e.currentTarget.style.background = "#F8FAFC"}
              onMouseOut={e => e.currentTarget.style.background = "transparent"}
            >
               <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 900, color: "#1E293B", letterSpacing: "-0.3px" }}>{user?.fullname || "Utilisateur"}</p>
                  <p style={{ margin: 0, fontSize: "0.65rem", fontWeight: 800, color: "#006233", textTransform: "uppercase", letterSpacing: "1px" }}>Voir mon profil</p>
               </div>
               <div style={{ 
                 width: 48, height: 48, borderRadius: "16px", 
                 background: "#F1F5F9", border: "1.5px solid #E2E8F0",
                 display: "flex", alignItems: "center", justifyContent: "center", color: "#1E293B",
                 boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
               }}>
                  <User size={22} strokeWidth={2.5} />
               </div>
            </div>

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              style={{ 
                padding: "0.7rem 1.4rem", borderRadius: "14px", 
                border: "none", background: "#FEF2F2", color: "#EF4444", 
                fontWeight: 800, fontSize: "0.8rem", cursor: "pointer", 
                display: "flex", alignItems: "center", gap: 10,
                transition: "all 0.2s"
              }}
              onMouseOver={e => e.currentTarget.style.background = "#FEE2E2"}
              onMouseOut={e => e.currentTarget.style.background = "#FEF2F2"}
            >
              <LogOut size={16} strokeWidth={3} /> <span>Quitter la session</span>
            </button>
          </div>
        </header>

        <div className="main-content-layout" style={{
          padding: "2.5rem 3rem", width: "100%", maxWidth: 1400, margin: "0 auto", flex: 1
        }}>
          {children}
        </div>
      </main>

      <style>{`
        @media (min-width: 769px) {
          .mobile-sidebar { display: none !important; }
          .mobile-topbar { display: none !important; }
        }
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-topbar { display: flex !important; }
          .main-content-layout { padding: 1.5rem !important; }
        }
      `}</style>
    </div>
  );
}
