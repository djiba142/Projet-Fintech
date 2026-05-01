import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Filter, 
  ChevronRight, 
  ShieldAlert, 
  UserCheck, 
  UserX, 
  Activity,
  ArrowUpRight,
  Download,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function RiskClients() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get(`${API}/m1/risk/clients`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClients(res.data);
      } catch (err) {
        console.error("Risk Clients Error", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchClients();
  }, [token]);

  const filtered = useMemo(() => {
    return clients.filter(c => {
      const matchSearch = c.fullname.toLowerCase().includes(search.toLowerCase()) || c.username.includes(search);
      const matchRisk = riskFilter === "all" || c.risk_level === riskFilter;
      return matchSearch && matchRisk;
    });
  }, [clients, search, riskFilter]);

  const riskBadge = (level) => {
    const map = {
      "HIGH": { color: "#EF4444", bg: "#FEE2E2", label: "Risque Élevé" },
      "MEDIUM": { color: "#F59E0B", bg: "#FEF3C7", label: "Risque Modéré" },
      "LOW": { color: "#10B981", bg: "#D1FAE5", label: "Risque Faible" }
    };
    const s = map[level] || map.LOW;
    return (
      <div style={{ padding: "4px 10px", borderRadius: 8, background: s.bg, color: s.color, fontSize: "0.7rem", fontWeight: 900, textTransform: "uppercase" }}>
        {s.label}
      </div>
    );
  };

  return (
    <div style={{ padding: "2rem", background: "#F1F5F9", minHeight: "100vh" }}>
      
      <header style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 950, color: "#1E293B", margin: 0 }}>Répertoire Clients & Risques</h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748B", fontWeight: 600 }}>Classification intelligente des profils emprunteurs</p>
        </div>
        <button style={{ padding: "10px 20px", borderRadius: 14, background: "#fff", border: "1px solid #E2E8F0", fontWeight: 800, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <Download size={18} /> Exporter la liste
        </button>
      </header>

      {/* ── FILTERS ── */}
      <div style={{ background: "#fff", borderRadius: 24, padding: "1.2rem", border: "1px solid #E2E8F0", marginBottom: "2rem", display: "flex", gap: "1.2rem", alignItems: "center" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search size={18} style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
          <input 
            type="text" 
            placeholder="Rechercher par nom ou numéro..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "12px 12px 12px 45px", borderRadius: 14, border: "2px solid #F1F5F9", background: "#F8FAFC", fontSize: "0.9rem", fontWeight: 600, outline: "none" }}
          />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
           {["all", "HIGH", "MEDIUM", "LOW"].map(r => (
             <button 
               key={r}
               onClick={() => setRiskFilter(r)}
               style={{
                 padding: "10px 16px", borderRadius: 12, border: "none", fontSize: "0.75rem", fontWeight: 800,
                 background: riskFilter === r ? "#1E293B" : "#F1F5F9",
                 color: riskFilter === r ? "#fff" : "#64748B",
                 cursor: "pointer"
               }}
             >
               {r === 'all' ? 'Tous' : r === 'HIGH' ? 'Danger' : r}
             </button>
           ))}
        </div>
      </div>

      {/* ── LIST ── */}
      <div style={{ background: "#fff", borderRadius: 28, border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
              <th style={S.th}>Client</th>
              <th style={S.th}>Score IA</th>
              <th style={S.th}>Niveau Risque</th>
              <th style={S.th}>Statut Crédit</th>
              <th style={S.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: "4rem", textAlign: "center", fontWeight: 800, color: "#94A3B8" }}>Analyse des profils en cours...</td></tr>
            ) : filtered.map((c, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #F1F5F9", transition: "0.2s" }} className="client-row">
                <td style={S.td}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#1E293B" }}>
                      {c.fullname.charAt(0)}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: "0.9rem" }}>{c.fullname}</p>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "#94A3B8", fontWeight: 600 }}>{c.username}</p>
                    </div>
                  </div>
                </td>
                <td style={S.td}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "1rem", fontWeight: 950, color: "#1E293B" }}>{c.score}</span>
                    <div style={{ width: 60, height: 6, background: "#F1F5F9", borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ width: `${c.score}%`, height: "100%", background: c.score >= 70 ? "#10B981" : c.score >= 40 ? "#F59E0B" : "#EF4444" }} />
                    </div>
                  </div>
                </td>
                <td style={S.td}>
                  {riskBadge(c.risk_level)}
                </td>
                <td style={S.td}>
                   <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", fontWeight: 800, color: c.credit_status === 'ELIGIBLE' ? '#16A34A' : '#64748B' }}>
                      {c.credit_status === 'ELIGIBLE' ? <UserCheck size={16} /> : <UserX size={16} />}
                      {c.credit_status}
                   </div>
                </td>
                <td style={S.td}>
                  <button 
                    onClick={() => navigate(`/risk-analysis?id=${c.username}`)}
                    style={{ padding: "8px 16px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "#fff", color: "#1E293B", fontSize: "0.75rem", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                  >
                    Analyser <ArrowUpRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

const S = {
  th: { padding: "1.2rem 1.5rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1 },
  td: { padding: "1.2rem 1.5rem", color: "#1E293B" }
};
