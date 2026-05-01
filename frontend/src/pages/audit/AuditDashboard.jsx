import { useState, useEffect } from "react";
import { 
  Shield, 
  Activity, 
  BarChart3, 
  AlertTriangle, 
  Building2, 
  TrendingUp, 
  ArrowUpRight, 
  Clock,
  ArrowRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from "recharts";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const StatCard = ({ title, value, icon, trend, color }) => (
  <div style={{
    background: "#fff", padding: "1.5rem", borderRadius: 24, border: "1px solid #E2E8F0",
    boxShadow: "0 4px 20px rgba(0,0,0,0.02)", display: "flex", justifyContent: "space-between", alignItems: "start"
  }}>
    <div>
      <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }}>{title}</p>
      <h2 style={{ margin: "10px 0", fontSize: "1.8rem", fontWeight: 900, color: "#1E293B", letterSpacing: -1 }}>{value}</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 800, color: trend >= 0 ? "#10B981" : "#EF4444" }}>
          {trend >= 0 ? "+" : ""}{trend}%
        </span>
        <span style={{ fontSize: "0.75rem", color: "#94A3B8", fontWeight: 600 }}>depuis hier</span>
      </div>
    </div>
    <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}10`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {icon}
    </div>
  </div>
);

export default function AuditDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await axios.get(`${API}/m1/audit/overview`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error("Erreur Audit Overview", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchOverview();
  }, [token]);

  if (loading) return <div style={{ padding: "4rem", textAlign: "center" }}>Initialisation du centre de contrôle...</div>;

  return (
    <div style={{ padding: "2rem", background: "#F8FAFC", minHeight: "100vh" }}>
      
      {/* ── HEADER ── */}
      <header style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "end" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ padding: "6px 12px", background: "#0F172A", borderRadius: 8, color: "#fff", fontSize: "0.65rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: 1 }}>Régulateur Certifié</div>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748B" }}>Système de supervision national actif</span>
          </div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 950, color: "#0F172A", margin: 0, letterSpacing: -1.5 }}>Tableau de Bord BCRG</h1>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 700, color: "#94A3B8" }}>Dernière mise à jour : {new Date().toLocaleTimeString()}</p>
          <div style={{ marginTop: 5, color: "#006233", fontWeight: 900, fontSize: "0.9rem" }}>Banque Centrale de la République de Guinée</div>
        </div>
      </header>

      {/* ── KPIS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
        <StatCard title="Transactions Totales" value={data?.kpis.total_transactions.toLocaleString()} icon={<Activity color="#3B82F6" />} trend={12.4} color="#3B82F6" />
        <StatCard title="Volume de Flux (GNF)" value={data?.kpis.total_volume.toLocaleString()} icon={<BarChart3 color="#8B5CF6" />} trend={8.1} color="#8B5CF6" />
        <StatCard title="Institutions Sous Surveillance" value={data?.kpis.active_institutions} icon={<Building2 color="#10B981" />} trend={0} color="#10B981" />
        <StatCard title="Alertes AML Ouvertes" value={data?.kpis.open_alerts} icon={<AlertTriangle color="#EF4444" />} trend={-4.2} color="#EF4444" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        
        {/* ── CHART ── */}
        <div style={{ background: "#fff", borderRadius: 32, padding: "2rem", border: "1px solid #E2E8F0" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#1E293B", marginBottom: "2rem", display: "flex", alignItems: "center", gap: 10 }}>
            <TrendingUp size={20} /> Activité Transactionnelle (7j)
          </h3>
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.stats_daily}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F172A" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94A3B8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94A3B8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 800 }}
                />
                <Area type="monotone" dataKey="count" stroke="#0F172A" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── RECENT ALERTS ── */}
        <div style={{ background: "#fff", borderRadius: 32, padding: "2rem", border: "1px solid #E2E8F0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#1E293B", margin: 0 }}>Alertes Fraude</h3>
            <button style={{ background: "none", border: "none", color: "#3B82F6", fontWeight: 800, fontSize: "0.8rem", cursor: "pointer" }}>Tout voir</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {data?.recent_alerts.map((alert, i) => (
              <div key={i} style={{ padding: "1rem", background: "#F8FAFC", borderRadius: 16, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: alert.severity === 'HIGH' ? '#FEE2E2' : '#FEF3C7', display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertTriangle size={18} color={alert.severity === 'HIGH' ? '#EF4444' : '#F59E0B'} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 800, color: "#1E293B" }}>{alert.type}</p>
                  <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 600, color: "#64748B" }}>Client: {alert.client_id}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ padding: "4px 8px", background: "#fff", borderRadius: 8, fontSize: "0.6rem", fontWeight: 900, color: "#94A3B8" }}>
                    <Clock size={10} style={{ marginRight: 4 }} /> {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button style={{
            width: "100%", marginTop: "2rem", padding: "1rem", borderRadius: 16,
            background: "#F1F5F9", border: "none", color: "#0F172A", fontWeight: 900,
            fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10
          }}>
            Lancer un Audit Complet <ArrowRight size={18} />
          </button>
        </div>

      </div>

    </div>
  );
}
