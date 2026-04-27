import { useNavigate, useLocation } from "react-router-dom";

const ALL_ROUTES = [
  { path: "/agent", label: "Analyse Client",  icon: "◈", roles: ["Agent de Crédit", "Administrateur"] },
  { path: "/admin", label: "Administration",  icon: "⚙", roles: ["Administrateur"] },
  { path: "/risk",  label: "Risques",         icon: "◎", roles: ["Analyste Risque", "Administrateur"] },
  { path: "/audit", label: "Audit & Sécurité",icon: "🔐", roles: ["Administrateur", "Analyste Risque"] },
];

export default function MainLayout({ children }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const raw       = localStorage.getItem("gn_user");
  const user      = raw ? JSON.parse(raw) : null;

  const handleLogout = () => {
    localStorage.removeItem("gn_user");
    navigate("/login");
  };

  const accessibles = ALL_ROUTES.filter(r => user && r.roles.includes(user.role));

  const avatarColor = user?.role === "Administrateur"
    ? "linear-gradient(135deg,#7c3aed,#a855f7)"
    : user?.role === "Analyste Risque"
    ? "linear-gradient(135deg,#d97706,#f59e0b)"
    : "linear-gradient(135deg,#1565C0,#1976D2)";

  return (
    <div style={styles.shell}>
      {/* Lueurs de fond (Glows) */}
      <div style={styles.glowBlue} />
      <div style={styles.glowIndigo} />
      
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={{ fontSize: "1.5rem", color: "#3b82f6" }}>◈</span>
          <div>
            <div style={styles.logoName}>KANDJOU</div>
            <div style={styles.logoSub}>Intelligence de Crédit</div>
          </div>
        </div>

        <div style={styles.opsSection}>
          <p style={styles.opsLabel}>AGRÉGATION ACTIVE</p>
          <div style={styles.opsRow}>
            <img src="/orange.png" alt="Orange" style={styles.opBadge} onError={e => e.target.style.display = "none"} />
            <img src="/mtn.png" alt="MTN" style={styles.opBadge} onError={e => e.target.style.display = "none"} />
          </div>
        </div>

        <nav style={styles.nav}>
          {accessibles.map(route => {
            const isActive = location.pathname === route.path;
            return (
              <button key={route.path} onClick={() => navigate(route.path)} style={{ ...styles.navItem, ...(isActive ? styles.navActive : {}) }}>
                <span style={styles.navIcon}>{route.icon}</span>
                <span>{route.label}</span>
              </button>
            );
          })}
        </nav>

        <div style={{ flex: 1 }} />

        {user && (
          <div style={styles.profile}>
            <div style={{ ...styles.avatar, background: avatarColor }}>{user.username[0].toUpperCase()}</div>
            <div style={styles.profileInfo}>
              <div style={styles.profileRole}>{user.role}</div>
              <div style={styles.profileEmail}>{user.username}</div>
            </div>
          </div>
        )}

        <button onClick={handleLogout} style={styles.btnLogout}>⏻ Déconnexion</button>
      </aside>

      <main style={styles.main}>{children}</main>
    </div>
  );
}

const styles = {
  shell: { display: "flex", minHeight: "100vh", background: "#0B1120", fontFamily: "Inter, sans-serif", position: "relative", overflow: "hidden" },
  glowBlue: { position: "absolute", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)", top: "20%", left: "30%", zIndex: 0, pointerEvents: "none" },
  glowIndigo: { position: "absolute", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)", top: "-10%", right: "5%", zIndex: 0, pointerEvents: "none" },
  sidebar: { width: "220px", minWidth: "220px", background: "rgba(11, 17, 32, 0.8)", backdropFilter: "blur(20px)", borderRight: "1px solid #1E293B", display: "flex", flexDirection: "column", padding: "1.4rem 1rem", zIndex: 1 },
  logo: { display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "1.4rem", paddingBottom: "1.2rem", borderBottom: "1px solid #1E293B" },
  logoImg: { width: "40px", height: "40px", objectFit: "contain", filter: "drop-shadow(0 0 8px rgba(59,130,246,0.3))" },
  logoName: { color: "#f1f5f9", fontWeight: "800", fontSize: "0.9rem", letterSpacing: "2px" },
  logoSub: { color: "#64748b", fontSize: "0.6rem" },
  opsSection: { marginBottom: "1.2rem" },
  opsLabel: { color: "#64748b", fontSize: "0.58rem", fontWeight: "800", letterSpacing: "1.5px", marginBottom: "0.4rem" },
  opsRow: { display: "flex", gap: "0.5rem" },
  opBadge: { width: "28px", height: "18px", objectFit: "contain", borderRadius: "3px" },
  nav: { display: "flex", flexDirection: "column", gap: "0.25rem" },
  navItem: { display: "flex", alignItems: "center", gap: "0.7rem", background: "none", border: "none", borderRadius: "8px", padding: "0.65rem 0.8rem", color: "#64748b", fontSize: "0.85rem", cursor: "pointer", textAlign: "left", width: "100%" },
  navActive: { background: "rgba(59,130,246,0.1)", color: "#3b82f6", borderLeft: "2px solid #3b82f6" },
  navIcon: { fontSize: "1rem", width: "20px", textAlign: "center" },
  profile: { display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.8rem 0", borderTop: "1px solid #1E293B" },
  avatar: { width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold" },
  profileInfo: { overflow: "hidden" },
  profileRole: { color: "#64748b", fontSize: "0.65rem", fontWeight: "bold" },
  profileEmail: { color: "#475569", fontSize: "0.6rem", overflow: "hidden", textOverflow: "ellipsis" },
  btnLogout: { background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.15)", borderRadius: "8px", color: "#f87171", fontSize: "0.8rem", fontWeight: "600", padding: "0.6rem", cursor: "pointer", marginTop: "0.5rem" },
  main: { flex: 1, overflow: "auto", position: "relative", zIndex: 1 }
};
