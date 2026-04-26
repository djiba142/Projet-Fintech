import { useState, useEffect } from "react";
import MainLayout from "../components/MainLayout";

const AUDIT_MOCK = [
  { id: "EVT-1042", time: "2026-04-25 16:10:05", user: "djiba@kandjou.gn", action: "SCORING", target: "224622***456", status: "SUCCESS", ip: "192.168.1.10" },
  { id: "EVT-1041", time: "2026-04-25 16:05:12", user: "IP: 192.168.1.50", action: "LOGIN_FAIL", target: "Admin Portal", status: "BLOCKED", ip: "192.168.1.50" },
  { id: "EVT-1040", time: "2026-04-25 15:45:30", user: "abdou@kandjou.gn", action: "PDF_EXPORT", target: "224664***012", status: "SUCCESS", ip: "192.168.1.22" },
];

const SECURITY_METRICS = [
  { label: "Chiffrement", value: "AES-256", icon: "🔐", ok: true },
  { label: "Transport", value: "HTTPS/TLS", icon: "🛡", ok: true },
  { label: "Tokens actifs", value: "3", icon: "🔑", ok: true },
  { label: "IPs bloquées", value: "4", icon: "🚫", ok: false },
];

export default function AuditPage() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filtered = AUDIT_MOCK.filter(log => {
    const matchFilter = filter === "ALL" || log.status === filter;
    const matchSearch = log.user.toLowerCase().includes(search.toLowerCase()) || log.action.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const exportCSV = () => {
    const csv = "ID;Time;User;Action;Target;Status;IP\n" + filtered.map(l => `${l.id};${l.time};${l.user};${l.action};${l.target};${l.status};${l.ip}`).join("\n");
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
              {filtered.map(l => (
                <tr key={l.id} style={s.tr}>
                  <td style={s.td}>{l.id}</td>
                  <td style={s.td}>{l.time}</td>
                  <td style={s.td}>{l.user}</td>
                  <td style={s.td}>{l.action}</td>
                  <td style={s.td}>
                    <span style={{...s.status, color: l.status === "SUCCESS" ? "#22c55e" : "#ef4444"}}>
                      {l.status}
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
  page: { padding: "2rem", color: "#fff", background: "#0a1628", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", marginBottom: "2rem" },
  title: { fontSize: "1.5rem", fontWeight: "900", margin: 0 },
  subtitle: { color: "#64748b", fontSize: "0.85rem" },
  btnExport: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer" },
  metricsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" },
  metricCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1.2rem", display: "flex", gap: "1rem", alignItems: "center" },
  metricIcon: { fontSize: "1.5rem" },
  metricVal: { fontSize: "1rem", fontWeight: "bold", margin: 0 },
  metricLab: { fontSize: "0.7rem", color: "#475569", margin: 0 },
  auditCard: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "1.5rem" },
  auditHeader: { display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" },
  search: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0.5rem 1rem", color: "#fff", width: "250px" },
  filters: { display: "flex", gap: "0.5rem" },
  filterBtn: { background: "#3b82f6", color: "#fff", border: "none", padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.7rem", fontWeight: "bold" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "1rem", fontSize: "0.7rem", color: "#475569", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  td: { padding: "1rem", fontSize: "0.85rem", borderBottom: "1px solid rgba(255,255,255,0.03)" },
  status: { fontWeight: "bold", fontSize: "0.75rem" }
};
