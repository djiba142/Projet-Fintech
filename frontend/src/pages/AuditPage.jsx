import { useState, useEffect } from "react";
import axios from "axios";
import MainLayout from "../components/MainLayout";

const API_BASE = "http://localhost:8000/m3";

const SECURITY_METRICS = [
  { label: "Chiffrement", value: "AES-256", icon: "🔐", ok: true },
  { label: "Transport", value: "HTTPS/TLS", icon: "🛡", ok: true },
  { label: "Tokens actifs", value: "3", icon: "🔑", ok: true },
  { label: "IPs bloquées", value: "0", icon: "🚫", ok: true },
];

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${API_BASE}/admin/audit-logs`);
        setLogs(res.data);
      } catch (err) {
        console.error("Erreur lors du chargement des logs :", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filtered = logs.filter(log => {
    const matchFilter = filter === "ALL" || log.result === filter;
    const actor = log.user_id || "";
    const action = log.action || "";
    const matchSearch = actor.toLowerCase().includes(search.toLowerCase()) || 
                        action.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const exportCSV = () => {
    const csv = "ID;Timestamp;Actor;Action;Result\n" + filtered.map((l, i) => `#${logs.length - i};${l.timestamp};${l.user_id};${l.action};${l.result}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "kandjou_audit.csv"; a.click();
  };

  return (
    <MainLayout>
      <div style={s.page}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Audit & Sécurité</h1>
            <p style={s.subtitle}>Traçabilité complète des accès et des actions</p>
          </div>
          <button onClick={exportCSV} style={s.btnExport}>Exporter CSV</button>
        </div>

        <div style={s.metricsGrid}>
          {SECURITY_METRICS.map((m, i) => (
            <div key={i} style={s.metricCard}>
              <span style={s.metricIcon}>{m.icon}</span>
              <div>
                <p style={s.metricVal}>{m.value}</p>
                <p style={s.metricLab}>{m.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={s.auditCard}>
          <div style={s.auditHeader}>
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={s.search}
            />
            <div style={s.filters}>
              {["ALL", "SUCCESS", "BLOCKED"].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{...s.filterBtn, opacity: filter === f ? 1 : 0.4}}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>ID</th>
                <th style={s.th}>HORODATAGE</th>
                <th style={s.th}>ACTEUR</th>
                <th style={s.th}>ACTION</th>
                <th style={s.th}>STATUT</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: "center", padding: "2rem" }}>Chargement des données...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: "center", padding: "2rem" }}>Aucun log trouvé.</td></tr>
              ) : filtered.map((l, i) => (
                <tr key={i} style={s.tr}>
                  <td style={s.td}>#{logs.length - i}</td>
                  <td style={s.td}>{new Date(l.timestamp).toLocaleString()}</td>
                  <td style={s.td}>{l.user_id}</td>
                  <td style={s.td}>{l.action}</td>
                  <td style={s.td}>
                    <span style={{...s.status, color: l.result === "SUCCESS" ? "#22c55e" : "#ef4444"}}>
                      {l.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}

const s = {
  page: { padding: "2rem", color: "#fff", background: "transparent", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", marginBottom: "2rem" },
  title: { fontSize: "1.5rem", fontWeight: "900", margin: 0 },
  subtitle: { color: "#64748b", fontSize: "0.85rem" },
  btnExport: { background: "rgba(255,255,255,0.05)", border: "1px solid #1E293B", color: "#fff", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer" },
  metricsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" },
  metricCard: { background: "#151C2C", border: "1px solid #1E293B", borderRadius: "12px", padding: "1.2rem", display: "flex", gap: "1rem", alignItems: "center" },
  metricIcon: { fontSize: "1.5rem" },
  metricVal: { fontSize: "1rem", fontWeight: "bold", margin: 0 },
  metricLab: { fontSize: "0.7rem", color: "#475569", margin: 0 },
  auditCard: { background: "#151C2C", border: "1px solid #1E293B", borderRadius: "16px", padding: "1.5rem" },
  auditHeader: { display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" },
  search: { background: "#0B1120", border: "1px solid #1E293B", borderRadius: "8px", padding: "0.5rem 1rem", color: "#fff", width: "250px" },
  filters: { display: "flex", gap: "0.5rem" },
  filterBtn: { background: "#3b82f6", color: "#fff", border: "none", padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.7rem", fontWeight: "bold" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "1rem", fontSize: "0.7rem", color: "#475569", borderBottom: "1px solid #1E293B" },
  td: { padding: "1rem", fontSize: "0.85rem", borderBottom: "1px solid rgba(255,255,255,0.03)" },
  status: { fontWeight: "bold", fontSize: "0.75rem" }
};
