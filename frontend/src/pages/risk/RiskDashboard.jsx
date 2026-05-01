import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  TrendingUp, 
  AlertCircle, 
  Users, 
  Wallet, 
  PieChart as PieIcon,
  ArrowUpRight,
  ArrowDownRight,
  Target
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from "recharts";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const StatCard = ({ title, value, subValue, icon, color, trend }) => (
  <div style={{ background: "#fff", padding: "1.8rem", borderRadius: 28, border: "1px solid #E2E8F0", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
      <div style={{ width: 50, height: 50, borderRadius: 16, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </div>
      {trend && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, height: "fit-content", padding: "4px 10px", borderRadius: 10, background: trend > 0 ? "#DCFCE7" : "#FEF2F2" }}>
           {trend > 0 ? <ArrowUpRight size={14} color="#16A34A" /> : <ArrowDownRight size={14} color="#DC2626" />}
           <span style={{ fontSize: "0.75rem", fontWeight: 800, color: trend > 0 ? "#16A34A" : "#DC2626" }}>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
    <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.8 }}>{title}</p>
    <h2 style={{ margin: "5px 0", fontSize: "2rem", fontWeight: 950, color: "#1E293B", letterSpacing: -1.5 }}>{value}</h2>
    <p style={{ margin: 0, fontSize: "0.8rem", color: "#94A3B8", fontWeight: 600 }}>{subValue}</p>
  </div>
);

export default function RiskDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRisk = async () => {
      try {
        const res = await axios.get(`${API}/m1/risk/overview`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error("Risk Overview Error", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchRisk();
  }, [token]);

  if (loading) return <div style={{ padding: "4rem", textAlign: "center", fontWeight: 900, color: "#3B82F6" }}>Chargement de l'intelligence analytique...</div>;

  const COLORS = ['#EF4444', '#F59E0B', '#10B981'];

  return (
    <div style={{ padding: "2rem", background: "#F1F5F9", minHeight: "100vh" }}>
      
      <header style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 950, color: "#1E293B", margin: 0, letterSpacing: -1.5 }}>Dashboard Analyste Risque</h1>
          <p style={{ margin: "5px 0 0", fontSize: "0.95rem", color: "#64748B", fontWeight: 600 }}>Surveillance prédictive et évaluation de la solvabilité du réseau Kandjou</p>
        </div>
        <div style={{ padding: "10px 20px", background: "#fff", borderRadius: 16, border: "1.5px solid #E2E8F0", display: "flex", alignItems: "center", gap: 10 }}>
           <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10B981" }} />
           <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#1E293B" }}>Modèle de scoring v2.1 Actif</span>
        </div>
      </header>

      {/* ── KPIS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
        <StatCard title="Score Moyen" value={data?.kpis.avg_score} subValue="Santé globale du portefeuille" icon={<Target color="#3B82F6" />} color="#3B82F6" trend={2.4} />
        <StatCard title="Risque Élevé" value={`${data?.kpis.high_risk_percent}%`} subValue="Clients sous seuil de 40/100" icon={<AlertCircle color="#EF4444" />} color="#EF4444" trend={-1.2} />
        <StatCard title="Exposition Totale" value={`${(data?.kpis.total_exposure / 1000000).toFixed(1)}M`} subValue="GNF injectés dans le système" icon={<Wallet color="#10B981" />} color="#10B981" trend={5.8} />
        <StatCard title="Défauts de Paiement" value={data?.kpis.defaults} subValue="Enregistrés ce mois-ci" icon={<PieIcon color="#F59E0B" />} color="#F59E0B" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "2rem" }}>
        
        {/* ── DISTRIBUTION ── */}
        <div style={{ background: "#fff", borderRadius: 32, padding: "2.2rem", border: "1px solid #E2E8F0" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#1E293B", marginBottom: "2.5rem", display: "flex", alignItems: "center", gap: 10 }}>
            <Users size={22} color="#3B82F6" /> Distribution des Profils de Solvabilité
          </h3>
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.score_distribution} margin={{ bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#64748B'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#64748B'}} />
                <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 800 }} />
                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                  {data?.score_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── RISK MIX ── */}
        <div style={{ background: "#fff", borderRadius: 32, padding: "2.2rem", border: "1px solid #E2E8F0", textAlign: "center" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#1E293B", marginBottom: "2rem", textAlign: "left" }}>Répartition du Risque</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={data?.score_distribution} 
                  cx="50%" cy="50%" 
                  innerRadius={60} outerRadius={100} 
                  paddingAngle={8} dataKey="count"
                >
                  {data?.score_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginTop: "1rem" }}>
             {["Élevé", "Moyen", "Faible"].map((label, i) => (
               <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS[i] }} />
                  <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#64748B" }}>{label}</span>
               </div>
             ))}
          </div>
          <button style={{
            width: "100%", marginTop: "2.5rem", padding: "1.1rem", borderRadius: 18,
            background: "#1E293B", color: "#fff", border: "none", fontWeight: 900,
            fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10
          }}>
            Générer Rapport de Stabilité <TrendingUp size={18} />
          </button>
        </div>

      </div>

    </div>
  );
}
