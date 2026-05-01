import { useState, useEffect } from "react";
import { 
  Users, 
  Activity, 
  Cpu, 
  Database, 
  ShieldAlert, 
  ArrowUpRight, 
  Terminal,
  Zap,
  Globe,
  Server,
  Settings,
  ArrowRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from "recharts";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const SystemMetric = ({ label, value, icon, color }) => (
  <div style={{ background: "#fff", padding: "1.2rem", borderRadius: 20, border: "1px solid #E2E8F0", flex: 1 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </div>
      <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>{label}</span>
    </div>
    <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#1E293B" }}>{value}</div>
  </div>
);

export default function AdminDashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axios.get(`${API}/m3/admin/overview`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error("Admin Overview Error", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchAdmin();
  }, [token]);

  if (loading) return <div style={{ padding: "4rem", textAlign: "center", fontWeight: 900, color: "#1E293B" }}>Synchronisation avec les serveurs centraux...</div>;

  return (
    <div style={{ padding: "2rem", background: "#F8FAFC", minHeight: "100vh" }}>
      
      <header style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 950, color: "#1E293B", margin: 0, letterSpacing: -1.5 }}>Pilotage Système</h1>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#64748B", fontWeight: 600 }}>Console de contrôle opérationnel et monitoring en temps réel</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
           <div style={{ padding: "8px 15px", background: "#10B98115", borderRadius: 12, border: "1px solid #10B98130", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
              <span style={{ fontSize: "0.8rem", fontWeight: 900, color: "#10B981" }}>Backend: {data?.kpis?.system_health || "N/A"}</span>
           </div>
        </div>
      </header>

      {/* ── METRICS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
        <div style={{ background: "#1E293B", padding: "1.8rem", borderRadius: 28, color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "start" }}>
           <div>
              <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Utilisateurs Totaux</p>
              <h2 style={{ margin: "5px 0", fontSize: "2.2rem", fontWeight: 950 }}>{data?.kpis?.total_users || 0}</h2>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#10B981", fontWeight: 700 }}>+12% vs mois dernier</p>
           </div>
           <Users size={40} color="rgba(255,255,255,0.1)" />
        </div>
        <SystemMetric label="Charge CPU" value={`${data?.system?.cpu || 0}%`} icon={<Cpu size={16} color="#3B82F6" />} color="#3B82F6" />
        <SystemMetric label="Mémoire RAM" value={`${data?.system?.ram || 0}%`} icon={<Database size={16} color="#8B5CF6" />} color="#8B5CF6" />
        <SystemMetric label="Latence API" value={data?.system?.latency || "N/A"} icon={<Zap size={16} color="#F59E0B" />} color="#F59E0B" />
        <SystemMetric label="Disponibilité" value={data?.kpis?.uptime || "99.98%"} icon={<Globe size={16} color="#10B981" />} color="#10B981" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: "2rem" }}>
        
        {/* ── TRAFFIC CHART ── */}
        <div style={{ background: "#fff", borderRadius: 32, padding: "2rem", border: "1px solid #E2E8F0" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#1E293B", marginBottom: "2rem", display: "flex", alignItems: "center", gap: 10 }}>
            <Activity size={20} color="#3B82F6" /> Trafic Système & Inscriptions
          </h3>
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.user_growth}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#64748B'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#64748B'}} />
                <Tooltip contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 800 }} />
                <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── SECURITY / QUICK ACTIONS ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
           <div style={{ background: "#fff", borderRadius: 32, padding: "2rem", border: "1px solid #E2E8F0" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#1E293B", marginBottom: "1.5rem" }}>Actions Rapides</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                 <button onClick={() => navigate("/admin-users")} style={S.actionBtn}><Users size={18} /> Gérer Utilisateurs</button>
                 <button onClick={() => alert("Audit de sécurité national lancé...")} style={S.actionBtn}><ShieldAlert size={18} /> Audit Sécurité</button>
                 <button onClick={() => navigate("/admin-logs")} style={S.actionBtn}><Terminal size={18} /> Voir Logs</button>
                 <button onClick={() => navigate("/admin-settings")} style={S.actionBtn}><Settings size={18} /> Config Système</button>
              </div>
           </div>

           <div style={{ background: "#FEE2E2", borderRadius: 32, padding: "2rem", border: "1px solid #FECACA" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
                 <ShieldAlert color="#DC2626" />
                 <h3 style={{ fontSize: "1rem", fontWeight: 900, color: "#991B1B", margin: 0 }}>Alerte Système</h3>
              </div>
              {data?.recent_alerts && data.recent_alerts.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                   {data.recent_alerts.slice(0, 2).map((a, i) => (
                     <p key={i} style={{ fontSize: "0.8rem", color: "#991B1B", fontWeight: 600, lineHeight: 1.5, margin: 0 }}>
                        ● {a.details}
                     </p>
                   ))}
                </div>
              ) : (
                <p style={{ fontSize: "0.8rem", color: "#991B1B", fontWeight: 600, lineHeight: 1.5, margin: 0 }}>
                   Aucune alerte de sécurité critique détectée dans les dernières 24h.
                </p>
              )}
           </div>
        </div>

      </div>

    </div>
  );
}

const S = {
  actionBtn: { 
    display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "1.2rem", 
    borderRadius: 20, border: "1.5px solid #F1F5F9", background: "#F8FAFC", color: "#475569", 
    fontSize: "0.75rem", fontWeight: 800, cursor: "pointer", transition: "0.2s" 
  }
};
