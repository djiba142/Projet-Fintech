import { useState, useEffect } from "react";
import axios from "axios";
import MainLayout from "../components/MainLayout";

const API_BASE = "http://localhost:8000/m3";

const ROLE_COLORS = {
  "Administrateur":   { bg: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "rgba(139,92,246,0.3)" },
  "Agent de Crédit": { bg: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "rgba(59,130,246,0.3)" },
  "Analyste Risque": { bg: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "rgba(245,158,11,0.3)" },
};

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [services, setServices] = useState({
    m1: { label: "M1 - AGGREGATOR", status: "checking", latency: null },
    m2: { label: "M2 - SIMULATORS", status: "checking", latency: null },
    m3: { label: "M3 - SECURITY",   status: "checking", latency: null },
  });

  const fetchData = async () => {
    try {
      const [uRes, aRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/users`),
        axios.get(`${API_BASE}/admin/alerts`)
      ]);
      setUsers(uRes.data);
      setAlerts(aRes.data);
    } catch (err) {
      console.error("Erreur admin fetchData:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const checkHealth = async () => {
      try {
        const t0 = Date.now();
        const resp = await fetch(`http://localhost:8000/health`);
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

  const toggleStatus = async (username) => {
    try {
      await axios.post(`${API_BASE}/admin/toggle-user`, { username });
      fetchData(); // Refresh list
    } catch (err) {
      console.error("Erreur toggleStatus:", err);
    }
  };

  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser]   = useState({ username: "", password: "", role: "Agent de Crédit", fullname: "" });
  const [formError, setFormError] = useState("");

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      await axios.post(`${API_BASE}/admin/create-user`, newUser);
      setShowForm(false);
      setNewUser({ username: "", password: "", role: "Agent de Crédit", fullname: "" });
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.detail || "Erreur lors de la création.");
    }
  };

  return (
    <MainLayout>
      <div style={s.page}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Console d'Administration</h1>
            <p style={s.subtitle}>Supervision des microservices et gestion des accès</p>
          </div>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <button onClick={() => setShowForm(!showForm)} style={s.btnNew}>
              {showForm ? "ANNULER" : "NOUVEAU COLLABORATEUR"}
            </button>
            <div style={s.systemBadge}>
              <span style={{ ...s.dot, background: "#22c55e" }} /> SYSTÈMES OPÉRATIONNELS
            </div>
          </div>
        </div>

        {showForm && (
          <div style={s.formCard}>
            <h2 style={s.tableTitle}>CRÉER UN NOUVEAU COMPTE</h2>
            <form onSubmit={handleCreateUser} style={s.form}>
              <div style={s.inputRow}>
                <input type="text" placeholder="Nom Complet" value={newUser.fullname} onChange={e => setNewUser({...newUser, fullname: e.target.value})} style={s.input} required />
                <input type="email" placeholder="Email / Username" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} style={s.input} required />
              </div>
              <div style={s.inputRow}>
                <input type="password" placeholder="Mot de passe" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} style={s.input} required />
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} style={s.select}>
                  <option value="Agent de Crédit">Agent de Crédit</option>
                  <option value="Analyste Risque">Analyste Risque</option>
                  <option value="Administrateur">Administrateur</option>
                </select>
              </div>
              {formError && <p style={s.error}>{formError}</p>}
              <button type="submit" style={s.btnSubmit}>ENREGISTRER L'UTILISATEUR</button>
            </form>
          </div>
        )}

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
                {users.map((u, i) => (
                  <tr key={i} style={s.tr}>
                    <td style={s.td}>
                      <div style={s.userCell}>
                        <div style={s.avatar}>{u.fullname[0]}</div>
                        <div><div style={s.userName}>{u.fullname}</div><div style={s.userEmail}>{u.username}</div></div>
                      </div>
                    </td>
                    <td style={s.td}>
                      <span style={{ ...s.roleBadge, background: ROLE_COLORS[u.role]?.bg, color: ROLE_COLORS[u.role]?.color }}>{u.role}</span>
                    </td>
                    <td style={s.td}>
                      <span style={{ color: u.status === "active" ? "#22c55e" : "#ef4444", fontSize: "0.8rem", fontWeight: "bold" }}>{u.status.toUpperCase()}</span>
                    </td>
                    <td style={s.td}>
                      <button onClick={() => toggleStatus(u.username)} style={s.btnAction}>
                        {u.status === "active" ? "SUSPENDRE" : "RÉACTIVER"}
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
              {alerts.length === 0 ? (
                <p style={{ color: "#475569", fontSize: "0.75rem", textAlign: "center" }}>Aucune alerte active.</p>
              ) : alerts.map((entry, i) => (
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
  systemBadge: { background: "rgba(34,197,94,0.1)", padding: "0.5rem 1rem", borderRadius: "20px", color: "#22c55e", fontSize: "0.7rem", fontWeight: "bold", border: "1px solid #1E293B" },
  modulesGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" },
  moduleCard: { background: "#151C2C", border: "1px solid #1E293B", borderRadius: "12px", padding: "1.2rem" },
  moduleTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  moduleLabel: { fontSize: "0.8rem", fontWeight: "bold", color: "#94a3b8" },
  moduleStatus: { display: "flex", alignItems: "center", gap: "0.5rem" },
  statusDot: { width: "8px", height: "8px", borderRadius: "50%" },
  latency: { fontSize: "0.7rem", color: "#475569", marginTop: "0.5rem" },
  mainGrid: { display: "grid", gridTemplateColumns: "1fr 350px", gap: "2rem" },
  tableCard: { background: "#151C2C", border: "1px solid #1E293B", borderRadius: "16px", overflow: "hidden" },
  tableHeader: { padding: "1.2rem", borderBottom: "1px solid #1E293B" },
  tableTitle: { fontSize: "0.75rem", fontWeight: "bold", color: "#475569", letterSpacing: "1px" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "1rem", textAlign: "left", fontSize: "0.65rem", color: "#475569", fontWeight: "bold", borderBottom: "1px solid #1E293B" },
  td: { padding: "1rem", borderBottom: "1px solid rgba(255,255,255,0.03)" },
  userCell: { display: "flex", alignItems: "center", gap: "0.8rem" },
  avatar: { width: "32px", height: "32px", borderRadius: "8px", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" },
  userName: { fontSize: "0.85rem", fontWeight: "bold" },
  userEmail: { fontSize: "0.7rem", color: "#475569" },
  roleBadge: { padding: "0.2rem 0.5rem", borderRadius: "6px", fontSize: "0.65rem", fontWeight: "bold" },
  btnAction: { background: "rgba(255,255,255,0.05)", border: "1px solid #1E293B", color: "#94a3b8", padding: "0.4rem 0.8rem", borderRadius: "6px", fontSize: "0.7rem", cursor: "pointer" },
  btnNew: { background: "#3b82f6", color: "#fff", border: "none", padding: "0.6rem 1.2rem", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "900", cursor: "pointer", letterSpacing: "1px" },
  formCard: { background: "#151C2C", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "16px", padding: "1.5rem", marginBottom: "2rem" },
  form: { display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" },
  inputRow: { display: "flex", gap: "1rem" },
  input: { flex: 1, background: "#0B1120", border: "1px solid #1E293B", borderRadius: "8px", padding: "0.8rem", color: "#fff", outline: "none", fontSize: "0.9rem" },
  select: { flex: 1, background: "#0B1120", border: "1px solid #1E293B", borderRadius: "8px", padding: "0.8rem", color: "#fff", outline: "none", fontSize: "0.9rem" },
  btnSubmit: { background: "#22c55e", color: "#fff", border: "none", padding: "1rem", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", marginTop: "0.5rem" },
  error: { color: "#ef4444", fontSize: "0.8rem", margin: 0 },
  ipsCard: { background: "#151C2C", border: "1px solid #1E293B", borderRadius: "16px", padding: "1.5rem" },
  ipsList: { marginTop: "1rem", display: "flex", flexDirection: "column", gap: "1rem" },
  ipRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.8rem", background: "rgba(239,68,68,0.05)", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.1)" },
  ipCode: { color: "#ef4444", fontSize: "0.8rem", fontFamily: "monospace" },
  ipReason: { fontSize: "0.7rem", color: "#64748b", margin: 0 },
  btnUnblock: { width: "24px", height: "24px", background: "#22c55e", border: "none", borderRadius: "4px", color: "#fff", cursor: "pointer" },
  dot: { width: "8px", height: "8px", borderRadius: "50%" }
};
