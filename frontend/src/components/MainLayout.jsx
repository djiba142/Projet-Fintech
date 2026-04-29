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
  AlertTriangle
} from "lucide-react";

export default function MainLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("kandjou_user") || "{}");
  const role = user.role || "Client";

  const handleLogout = () => {
    localStorage.removeItem("kandjou_token");
    localStorage.removeItem("kandjou_user");
    navigate("/login");
  };

  const getMenu = () => {
    const base = [
      { path: "/dashboard", label: "Accueil", icon: Home },
      { path: "/transactions", label: "Transactions", icon: FileText },
      { path: "/transfers", label: "Transferts", icon: ArrowLeftRight },
      { path: "/score", label: "Score", icon: PieChart },
      { path: "/profile", label: "Profil", icon: User },
    ];

    // Add logout as a standard item at the end
    return [...base, { path: "logout", label: "Déconnexion", icon: LogOut, action: handleLogout }];
  };

  const menu = getMenu();

  const getSidebarBg = () => {
    if (role === "Client") return "#006233"; // Exact mockup Green
    if (role === "Administrateur") return "#1E293B";
    return "#004d28";
  };

  const sidebarContent = (
    <>
      {/* Logo Section */}
      <div style={{ display: "flex", alignItems: "center", cursor: "pointer", marginBottom: "3rem" }}
        onClick={() => { navigate("/dashboard"); setIsMobileMenuOpen(false); }}>
        <img src="/logo_kandjou.png" alt="Kandjou Logo" style={{ height: 40, objectFit: "contain", filter: "brightness(0) invert(1)" }} />
        <span style={{ color: "#fff", marginLeft: 10, fontWeight: 900, fontSize: "1.2rem", letterSpacing: -0.5 }}>KANDJOU</span>
      </div>

      {/* Nav Section */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {menu.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => {
                if (item.action) item.action();
                else { navigate(item.path); setIsMobileMenuOpen(false); }
              }}
              style={{
                display: "flex", alignItems: "center", gap: "1rem",
                padding: "0.9rem 1.4rem", borderRadius: 12, border: "none",
                background: active ? "rgba(255,255,255,0.15)" : "transparent",
                color: active ? "#fff" : "rgba(255,255,255,0.6)",
                fontSize: "0.9rem", fontWeight: active ? 700 : 500,
                cursor: "pointer", transition: "all 0.2s",
                textAlign: "left", width: "100%"
              }}
            >
              <item.icon size={20} />
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
        width: 260, background: getSidebarBg(), display: "flex", flexDirection: "column",
        padding: "2rem 1.2rem", flexShrink: 0, position: "sticky", top: 0, height: "100vh",
        zIndex: 100
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
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
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
          <span style={{ fontWeight: 900, color: "#1E293B", fontSize: "1rem" }}>KANDJOU</span>
          <div style={{ width: 38 }} />
        </div>

        <div className="main-content-layout" style={{
          padding: "2.5rem 3rem", width: "100%", maxWidth: 1200, margin: "0 auto", flex: 1
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
