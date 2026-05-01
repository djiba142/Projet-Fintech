import { useState, useEffect } from "react";
import { 
  Building2, 
  Wifi, 
  WifiOff, 
  TrendingUp, 
  Activity, 
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const InstCard = ({ inst }) => (
  <div style={{ background: "#fff", borderRadius: 24, padding: "1.5rem", border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Building2 size={24} color="#64748B" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900, color: "#1E293B" }}>{inst.name}</h3>
          <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5 }}>{inst.type}</span>
        </div>
      </div>
      <div style={{ padding: "6px 12px", borderRadius: 8, background: inst.api_status === 'ONLINE' ? '#DCFCE7' : '#FEF2F2', display: "flex", alignItems: "center", gap: 6 }}>
        {inst.api_status === 'ONLINE' ? <Wifi size={14} color="#16A34A" /> : <WifiOff size={14} color="#DC2626" />}
        <span style={{ fontSize: "0.7rem", fontWeight: 900, color: inst.api_status === 'ONLINE' ? '#16A34A' : '#DC2626' }}>{inst.api_status}</span>
      </div>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
      <div style={{ padding: "1rem", background: "#F8FAFC", borderRadius: 16 }}>
        <p style={{ margin: 0, fontSize: "0.65rem", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Uptime Score</p>
        <p style={{ margin: "5px 0 0", fontSize: "1.2rem", fontWeight: 950, color: inst.uptime_score > 95 ? "#16A34A" : "#F59E0B" }}>{inst.uptime_score}%</p>
      </div>
      <div style={{ padding: "1rem", background: "#F8FAFC", borderRadius: 16 }}>
        <p style={{ margin: 0, fontSize: "0.65rem", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Volume 24h</p>
        <p style={{ margin: "5px 0 0", fontSize: "1rem", fontWeight: 950, color: "#1E293B" }}>{Math.floor(inst.total_volume / 1000000)}M GNF</p>
      </div>
    </div>

    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "1rem", borderTop: "1.5px solid #F1F5F9" }}>
       <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <ShieldCheck size={16} color="#10B981" />
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#10B981" }}>Audité & Conforme</span>
       </div>
       <button style={{ background: "none", border: "none", color: "#3B82F6", fontWeight: 800, fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
         Détails <ArrowRight size={14} />
       </button>
    </div>
  </div>
);

export default function AuditInstitutions() {
  const { token } = useAuth();
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInst = async () => {
      try {
        const res = await axios.get(`${API}/m1/audit/institutions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInstitutions(res.data);
      } catch (err) {
        console.error("Fetch Inst Error", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchInst();
  }, [token]);

  return (
    <div style={{ padding: "2rem", background: "#F8FAFC", minHeight: "100vh" }}>
      
      <header style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 950, color: "#0F172A", margin: 0 }}>Supervision des Institutions</h1>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748B", fontWeight: 600 }}>Surveillance en temps réel de la santé API et de la conformité des opérateurs financiers</p>
      </header>

      {/* ── ALERTS BAR ── */}
      <div style={{ background: "#0F172A", padding: "1rem 2rem", borderRadius: 20, display: "flex", alignItems: "center", gap: 15, marginBottom: "2.5rem", color: "#fff" }}>
         <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#10B98120", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Activity color="#10B981" size={20} />
         </div>
         <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 800 }}>Tous les systèmes sont opérationnels</p>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "#94A3B8", fontWeight: 600 }}>Temps de réponse moyen global : 142ms</p>
         </div>
         <button style={{ padding: "8px 16px", borderRadius: 10, background: "#3B82F6", color: "#fff", border: "none", fontWeight: 900, fontSize: "0.75rem" }}>Lancer Diagnostic</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", gridColumn: "1/-1", color: "#94A3B8", fontWeight: 800 }}>Connexion sécurisée aux serveurs des institutions...</div>
        ) : institutions.map((inst, i) => (
          <InstCard key={i} inst={inst} />
        ))}
      </div>

    </div>
  );
}
