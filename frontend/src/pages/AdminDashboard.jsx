import { useState, useEffect } from "react";
import MainLayout from "../components/MainLayout";

const API = "http://localhost:8000";

// ── Données mock ──
const USERS_MOCK = [
  { id: 1, name: "Djiba Kourouma",   email: "djiba@kandjou.gn",  role: "ADMIN",        status: "ACTIVE",    lastActivity: "10 min ago" },
  { id: 2, name: "Abdoulaye Diallo", email: "abdou@kandjou.gn",  role: "AGENT",        status: "ACTIVE",    lastActivity: "2 hours ago" },
  { id: 3, name: "Mariama Barry",    email: "mariama@kandjou.gn", role: "RISK_MANAGER", status: "ACTIVE",    lastActivity: "1 day ago" },
  { id: 4, name: "Moussa Camara",    email: "moussa@kandjou.gn",  role: "AGENT",        status: "SUSPENDED", lastActivity: "3 days ago" },
];

const IPS_MOCK = [
  { ip: "192.168.1.50", reason: "Tentatives multiples OTP",  date: "2026-04-25 14:30" },
  { ip: "10.0.0.12",    reason: "Accès Admin non autorisé",  date: "2026-04-25 11:15" },
  { ip: "172.16.1.100", reason: "Violation de la sécurité",  date: "2026-04-24 09:45" },
];

const ROLE_COLORS = {
  ADMIN:        { bg: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "rgba(139,92,246,0.3)" },
  AGENT:        { bg: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "rgba(59,130,246,0.3)" },
  RISK_MANAGER: { bg: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "rgba(245,158,11,0.3)" },
};

export default function AdminDashboard() {
  const [users, setUsers] = useState(USERS_MOCK);
  const [services, setServices] = useState({
    m1: { label: "M1 - AGGREGATOR", status: "checking", latency: null },
    m2: { label: "M2 - SIMULATORS", status: "checking", latency: null },
    m3: { label: "M3 - SECURITY",   status: "checking", latency: null },
  });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const t0 = Date.now();
        const resp = await fetch(`${API}/health`);
        const latency = Date.now() - t0;
        if (resp.ok) {
          setServices({
            m1: { label: "M1 - AGGREGATOR", status: "online", latency: `${Math.round(latency * 0.4)}ms` },
            m2: { label: "M2 - SIMULATORS", status: "online", latency: `${Math.round(latency * 0.9)}ms` },
            m3: { label: "M3 - SECURITY",   status: "online", latency: `${Math.round(latency * 0.15)}ms` },
          });
        }
      } catch {
        setServices(prev => Object.fromEntries(
          Object.entries(prev).map(([k, v]) => [k, { ...v, status: "offline", latency: "—" }])
        ));
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleStatus = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" } : u));
  };

  return (
    <MainLayout>
      <div style={s.page}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Console d'Administration</h1>
            <p style={s.subtitle}>Supervision des microservices et gestion des accès</p>
          </div>
          <div style={s.systemBadge}>
            <span style={{ ...s.dot, background: "#22c55e" }} /> SYSTÈMES OPÉRATIONNELS
          </div>
        </div>

        <div style={s.modulesGrid}>
          {Object.entries(services).map(([key, svc]) => (
            <div key={key} style={s.moduleCard}>
              <div style={s.moduleTop}>
                <span style={s.moduleLabel}>{svc.label}</span>
                <div style={s.moduleStatus}>
                  <span style={{ ...s.statusDot, background: svc.status === "online" ? "#22c55e" : "#ef4444" }} />
                  <span style={{ color: svc.status === "online" ? "#22c55e" : "#94a3b8", fontSize: "0.7rem", fontWeight: "bold" }}>
                    {svc.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <p style={s.latency}>LATENCE: {svc.latency || "..."}</p>
            </div>
          ))}
        </div>

        <div style={s.mainGrid}>
          <div style={s.tableCard}>
            <div style={s.tableHeader}>
              <h2 style={s.tableTitle}>UTILISATEURS ACTIFS</h2>
            </div>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>UTILISATEUR</th>
                  <th style={s.th}>RÔLE</th>
                  <th style={s.th}>STATUT</th>
                  <th style={s.th}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={s.tr}>
                    <td style={s.td}>
                      <div style={s.userCell}>
                        <div style={s.avatar}>{u.name[0]}</div>
                        <div><div style={s.userName}>{u.name}</div><div style={s.userEmail}>{u.email}</div></div>
                      </div>
                    </td>
                    <td style={s.td}>
                      <span style={{ ...s.roleBadge, background: ROLE_COLORS[u.role]?.bg, color: ROLE_COLORS[u.role]?.color }}>{u.role}</span>
                    </td>
                    <td style={s.td}>
                      <span style={{ color: u.status === "ACTIVE" ? "#22c55e" : "#ef4444", fontSize: "0.8rem", fontWeight: "bold" }}>{u.status}</span>
                    </td>
                    <td style={s.td}>
                      <button onClick={() => toggleStatus(u.id)} style={s.btnAction}>
                        {u.status === "ACTIVE" ? "SUSPENDRE" : "RÉACTIVER"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={s.ipsCard}>
            <h2 style={s.tableTitle}>SÉCURITÉ : IPS BLOQUÉES</h2>
            <div style={s.ipsList}>
              {IPS_MOCK.map((entry, i) => (
                <div key={i} style={s.ipRow}>
                  <div><code style={s.ipCode}>{entry.ip}</code><p style={s.ipReason}>{entry.reason}</p></div>
                  <button style={s.btnUnblock}>✓</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

const s = {
  page: { padding: "2rem", color: "#fff" },
  header: { display: "flex", justifyContent: "space-between", marginBottom: "2rem" },
  title: { fontSize: "1.5rem", fontWeight: "900", margin: 0 },
  subtitle: { color: "#64748b", fontSize: "0.85rem" },
  systemBadge: { background: "rgba(34,197,94,0.1)", padding: "0.5rem 1rem", borderRadius: "20px", color: "#22c55e", fontSize: "0.7rem", fontWeight: "bold", border: "1px solid rgba(34,197,94,0.2)" },
  modulesGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" },
  moduleCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1.2rem" },
  moduleTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  moduleLabel: { fontSize: "0.8rem", fontWeight: "bold", color: "#94a3b8" },
  moduleStatus: { display: "flex", alignItems: "center", gap: "0.5rem" },
  statusDot: { width: "8px", height: "8px", borderRadius: "50%" },
  latency: { fontSize: "0.7rem", color: "#475569", marginTop: "0.5rem" },
  mainGrid: { display: "grid", gridTemplateColumns: "1fr 350px", gap: "2rem" },
  tableCard: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", overflow: "hidden" },
  tableHeader: { padding: "1.2rem", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  tableTitle: { fontSize: "0.75rem", fontWeight: "bold", color: "#475569", letterSpacing: "1px" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "1rem", textAlign: "left", fontSize: "0.65rem", color: "#475569", fontWeight: "bold", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  td: { padding: "1rem", borderBottom: "1px solid rgba(255,255,255,0.03)" },
  userCell: { display: "flex", alignItems: "center", gap: "0.8rem" },
  avatar: { width: "32px", height: "32px", borderRadius: "8px", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" },
  userName: { fontSize: "0.85rem", fontWeight: "bold" },
  userEmail: { fontSize: "0.7rem", color: "#475569" },
  roleBadge: { padding: "0.2rem 0.5rem", borderRadius: "6px", fontSize: "0.65rem", fontWeight: "bold" },
  btnAction: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", padding: "0.4rem 0.8rem", borderRadius: "6px", fontSize: "0.7rem", cursor: "pointer" },
  ipsCard: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "1.5rem" },
  ipsList: { marginTop: "1rem", display: "flex", flexDirection: "column", gap: "1rem" },
  ipRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.8rem", background: "rgba(239,68,68,0.05)", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.1)" },
  ipCode: { color: "#ef4444", fontSize: "0.8rem", fontFamily: "monospace" },
  ipReason: { fontSize: "0.7rem", color: "#64748b", margin: 0 },
  btnUnblock: { width: "24px", height: "24px", background: "#22c55e", border: "none", borderRadius: "4px", color: "#fff", cursor: "pointer" },
  dot: { width: "8px", height: "8px", borderRadius: "50%" }
};
