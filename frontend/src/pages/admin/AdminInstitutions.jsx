import { useState, useEffect } from "react";
import { 
  Building2, 
  Activity, 
  Globe, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Search,
  ExternalLink,
  Plus
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function AdminInstitutions() {
  const { token } = useAuth();
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInst = async () => {
      try {
        const res = await axios.get(`${API}/m3/admin/institutions`, {
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
      
      <header style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 950, color: "#1E293B", margin: 0 }}>Gestion des Institutions</h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748B", fontWeight: 600 }}>Supervision des APIs Orange, MTN et des banques partenaires</p>
        </div>
        <button style={{ padding: "10px 20px", borderRadius: 12, background: "#1E293B", color: "#fff", border: "none", fontWeight: 900, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
           <Plus size={18} /> Ajouter une institution
        </button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
         {loading ? (
            <div style={{ padding: "4rem", textAlign: "center", color: "#94A3B8", fontWeight: 800 }}>Vérification de l'état des passerelles...</div>
         ) : institutions.map((inst, i) => (
           <div key={i} style={{ background: "#fff", borderRadius: 28, padding: "2rem", border: "1px solid #E2E8F0", boxShadow: "0 10px 30px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1.5rem" }}>
                 <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", color: "#1E293B" }}>
                       <Building2 size={22} />
                    </div>
                    <div>
                       <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900, color: "#1E293B" }}>{inst.name}</h3>
                       <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
                          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#10B981" }}>{inst.status}</span>
                       </div>
                    </div>
                 </div>
                 <button style={{ background: "none", border: "none", color: "#3B82F6", cursor: "pointer" }}>
                    <ExternalLink size={18} />
                 </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                 <div style={S.miniStat}>
                    <p style={S.statLab}>Uptime</p>
                    <p style={S.statVal}>{inst.uptime}</p>
                 </div>
                 <div style={S.miniStat}>
                    <p style={S.statLab}>Latence</p>
                    <p style={S.statVal}>{inst.latency}</p>
                 </div>
                 <div style={{ ...S.miniStat, gridColumn: "span 2" }}>
                    <p style={S.statLab}>Taux de succès API</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                       <div style={{ flex: 1, height: 6, background: "#F1F5F9", borderRadius: 10, overflow: "hidden" }}>
                          <div style={{ width: inst.success_rate, height: "100%", background: "#10B981" }} />
                       </div>
                       <span style={S.statVal}>{inst.success_rate}</span>
                    </div>
                 </div>
              </div>

              <button style={{ width: "100%", padding: "10px", borderRadius: 12, border: "1.5px solid #F1F5F9", background: "#fff", color: "#1E293B", fontSize: "0.8rem", fontWeight: 900, cursor: "pointer" }}>
                 Configurer l'API
              </button>
           </div>
         ))}
      </div>

    </div>
  );
}

const S = {
  miniStat: { background: "#F8FAFC", padding: "1rem", borderRadius: 16, border: "1px solid #F1F5F9" },
  statLab: { margin: 0, fontSize: "0.65rem", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase" },
  statVal: { margin: "4px 0 0", fontSize: "0.95rem", fontWeight: 900, color: "#1E293B" }
};
