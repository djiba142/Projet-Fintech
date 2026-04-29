import { useState, useEffect } from "react";
import MainLayout from "../components/MainLayout";
import axios from "axios";

const API = "http://localhost:8000/m3";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get("http://localhost:8000/m3/admin/system-overview");
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <MainLayout>
      <div style={{ display: "flex", justifyContent: "center", padding: "10rem 0" }}>
         <div style={{ width: 50, height: 50, border: "5px solid #1E293B", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div style={{ padding: "1rem 0" }}>
        {/* Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
          <div>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 950, color: "#1E293B", letterSpacing: "-1.5px" }}>Supervision Système</h1>
            <p style={{ color: "#64748B", fontSize: "1.1rem", fontWeight: 600, marginTop: "0.5rem" }}>État global de l'écosystème Kandjou en temps réel.</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
             <button style={{ padding: "0.9rem 1.8rem", background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 16, fontSize: "0.85rem", fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>Paramètres</button>
             <button style={{ padding: "0.9rem 1.8rem", background: "#1E293B", border: "none", color: "#fff", borderRadius: 16, fontSize: "0.85rem", fontWeight: 800, cursor: "pointer", boxShadow: "0 10px 25px rgba(30,41,59,0.2)" }}>Exporter Rapport</button>
          </div>
        </header>

        {/* KPIs Section */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "3rem" }}>
          {[
            { label: "Utilisateurs", val: data.users.length, icon: "👥", trend: "+8%" },
            { label: "Sessions Actives", val: data.stats.active_sessions, icon: "📡", trend: "Live" },
            { label: "Scorings (24h)", val: data.stats.total_scorings_today, icon: "🛡️", trend: "+12%" },
            { label: "Latence Moyenne", val: data.stats.avg_latency, icon: "⚡", color: "#10B981", trend: "-5ms" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", padding: "2rem", borderRadius: 32, border: "1px solid #F1F5F9", boxShadow: "0 10px 30px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1.5rem" }}>
                <div style={{ width: 48, height: 48, background: s.color ? `${s.color}10` : "#F1F5F9", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>{s.icon}</div>
                <span style={{ fontSize: "0.7rem", fontWeight: 900, color: s.trend.includes("-") || s.trend === "Live" ? "#10B981" : "#10B981", background: s.trend.includes("-") || s.trend === "Live" ? "#ECFDF5" : "#ECFDF5", padding: "5px 10px", borderRadius: 10 }}>{s.trend}</span>
              </div>
              <p style={{ fontSize: "0.75rem", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: "6px" }}>{s.label}</p>
              <p style={{ fontSize: "2.4rem", fontWeight: 950, color: s.color || "#1E293B", letterSpacing: "-1.5px" }}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Charts & Logs Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "2rem" }}>
          {/* Left Column: Users List */}
          <div style={{ background: "#fff", padding: "2.5rem", borderRadius: 36, border: "1px solid #F1F5F9", boxShadow: "0 15px 45px rgba(0,0,0,0.03)" }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 900, color: "#1E293B", textTransform: "uppercase", letterSpacing: 2, marginBottom: "2rem" }}>Gestion des Utilisateurs</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              {data.users.slice(0, 5).map((u, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.4rem", background: "#F8FAFC", borderRadius: 24 }}>
                  <div style={{ display: "flex", gap: "1.2rem", alignItems: "center" }}>
                     <div style={{ width: 44, height: 44, background: "#1E293B", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: "1.1rem" }}>{u.fullname.charAt(0)}</div>
                     <div>
                        <p style={{ fontSize: "0.95rem", fontWeight: 800, color: "#1E293B" }}>{u.fullname}</p>
                        <p style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600 }}>{u.username} • <span style={{ color: "#3B82F6" }}>{u.role}</span></p>
                     </div>
                  </div>
                  <span style={{ fontSize: "0.7rem", fontWeight: 900, color: u.status === "active" ? "#10B981" : "#EF4444", background: "#fff", padding: "6px 14px", borderRadius: 12, border: "1px solid #E2E8F0", textTransform: "uppercase" }}>{u.status}</span>
                </div>
              ))}
            </div>
            <button style={{ width: "100%", marginTop: "2rem", padding: "1.2rem", borderRadius: 24, border: "2px solid #F1F5F9", background: "none", color: "#64748B", fontWeight: 900, fontSize: "0.9rem", cursor: "pointer", transition: "all 0.2s" }}>Gérer tous les comptes</button>
          </div>

          {/* Right Column: Alerts & Services */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Security Alerts */}
            <div style={{ background: "#1E293B", padding: "2.5rem", borderRadius: 36, color: "#fff", boxShadow: "0 15px 45px rgba(30,41,59,0.15)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                 <h3 style={{ fontSize: "0.9rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.6)" }}>Alertes Sécurité</h3>
                 <span style={{ fontSize: "1.2rem" }}>🛡️</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                {data.security_alerts.map((a, i) => (
                  <div key={i} style={{ padding: "1.2rem", background: "rgba(255,255,255,0.05)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)" }}>
                     <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#EF4444" }}>{a.reason}</p>
                     <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", fontWeight: 600, marginTop: "4px" }}>IP: {a.ip} • {a.time}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Health */}
            <div style={{ background: "#fff", padding: "2.5rem", borderRadius: 36, border: "1px solid #F1F5F9", boxShadow: "0 15px 45px rgba(0,0,0,0.03)" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 900, color: "#1E293B", textTransform: "uppercase", letterSpacing: 2, marginBottom: "2rem" }}>État des Modules</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {Object.entries(data.system_status).map(([name, status], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ fontSize: "0.95rem", fontWeight: 800, color: "#1E293B", textTransform: "capitalize" }}>{name.replace("_", " ")}</p>
                      <p style={{ fontSize: "0.8rem", color: "#10B981", fontWeight: 700 }}>● {status}</p>
                    </div>
                    <div style={{ width: 32, height: 32, background: "#F1F5F9", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem" }}>✔️</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
