import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Activity,
  Wallet,
  TrendingDown,
  Info,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const FactorRow = ({ factor }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #F1F5F9" }}>
    <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#475569" }}>{factor.label}</span>
    <div style={{ 
      padding: "4px 10px", borderRadius: 8, fontSize: "0.7rem", fontWeight: 900,
      background: factor.impact === 'POSITIVE' ? '#DCFCE7' : factor.impact === 'NEGATIVE' ? '#FEF2F2' : '#F1F5F9',
      color: factor.impact === 'POSITIVE' ? '#16A34A' : factor.impact === 'NEGATIVE' ? '#DC2626' : '#64748B'
    }}>
      {factor.impact}
    </div>
  </div>
);

export default function RiskAnalysis() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const clientId = searchParams.get("id");
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await axios.get(`${API}/m1/risk/analysis/${clientId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error("Risk Analysis Error", err);
      } finally {
        setLoading(false);
      }
    };
    if (token && clientId) fetchAnalysis();
  }, [token, clientId]);

  if (loading) return <div style={{ padding: "5rem", textAlign: "center", fontWeight: 900, color: "#3B82F6" }}>Scan profond du profil financier en cours...</div>;

  const scoreColor = data.score >= 70 ? "#10B981" : data.score >= 40 ? "#F59E0B" : "#EF4444";

  return (
    <div style={{ padding: "2rem", background: "#F1F5F9", minHeight: "100vh" }}>
      
      <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", color: "#64748B", fontWeight: 800, cursor: "pointer", marginBottom: "1.5rem" }}>
        <ArrowLeft size={18} /> Retour au répertoire
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "2rem", alignItems: "start" }}>
        
        {/* ── LEFT COLUMN ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* Main Info Card */}
          <div style={{ background: "#fff", borderRadius: 32, padding: "2.5rem", border: "1px solid #E2E8F0" }}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "2.5rem" }}>
                <div>
                   <h1 style={{ fontSize: "2rem", fontWeight: 950, color: "#1E293B", margin: 0 }}>Analyse Expert : {data.username}</h1>
                   <p style={{ margin: 5, fontSize: "0.9rem", color: "#64748B", fontWeight: 600 }}>Dernière évaluation générée à l'instant</p>
                </div>
                <div style={{ textAlign: "right" }}>
                   <div style={{ fontSize: "3rem", fontWeight: 950, color: scoreColor, lineHeight: 1 }}>{data.score}</div>
                   <span style={{ fontSize: "0.8rem", fontWeight: 900, color: scoreColor, textTransform: "uppercase" }}>Score de Solvabilité</span>
                </div>
             </div>

             <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem" }}>
                <div style={S.miniStat}>
                   <p style={S.miniLabel}>Revenus</p>
                   <p style={S.miniValue}>{data.metrics.income.toLocaleString()} GNF</p>
                </div>
                <div style={S.miniStat}>
                   <p style={S.miniLabel}>Dépenses</p>
                   <p style={S.miniValue}>{data.metrics.expense.toLocaleString()} GNF</p>
                </div>
                <div style={S.miniStat}>
                   <p style={S.miniLabel}>Activité</p>
                   <p style={S.miniValue}>{data.metrics.frequency} tx / mois</p>
                </div>
                <div style={S.miniStat}>
                   <p style={S.miniLabel}>Anomalies</p>
                   <p style={{ ...S.miniValue, color: data.metrics.anomalies > 0 ? "#DC2626" : "#10B981" }}>{data.metrics.anomalies}</p>
                </div>
             </div>
          </div>

          {/* Factors Card */}
          <div style={{ background: "#fff", borderRadius: 32, padding: "2.5rem", border: "1px solid #E2E8F0" }}>
             <h3 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#1E293B", marginBottom: "1.5rem" }}>Facteurs de Décision</h3>
             <div style={{ display: "flex", flexDirection: "column" }}>
                {data.factors.map((f, i) => <FactorRow key={i} factor={f} />)}
             </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN (DECISION) ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          <div style={{ background: "#1E293B", borderRadius: 32, padding: "2.5rem", color: "#fff", textAlign: "center" }}>
             <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                {data.recommendation === 'ACCEPTER' ? <CheckCircle2 size={40} color="#10B981" /> : <AlertTriangle size={40} color="#F59E0B" />}
             </div>
             <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", letterSpacing: 1.5 }}>Recommandation IA</p>
             <h2 style={{ margin: "10px 0 1.5rem", fontSize: "1.8rem", fontWeight: 950 }}>{data.recommendation}</h2>
             
             <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", fontWeight: 500, lineHeight: 1.6, marginBottom: "2rem" }}>
                {data.recommendation === 'ACCEPTER' 
                  ? "Le profil présente des garanties suffisantes pour un engagement financier standard."
                  : "Des doutes subsistent sur la régularité des entrées de fonds. Un audit manuel est préconisé."}
             </p>

             <button style={{ 
               width: "100%", padding: "1.1rem", borderRadius: 16, background: "#fff", color: "#1E293B", 
               border: "none", fontWeight: 900, fontSize: "0.9rem", cursor: "pointer", transition: "0.2s" 
             }}>
               Approuver le Dossier
             </button>
             <button style={{ 
               width: "100%", marginTop: "0.8rem", padding: "1.1rem", borderRadius: 16, background: "transparent", color: "#fff", 
               border: "1px solid rgba(255,255,255,0.2)", fontWeight: 900, fontSize: "0.9rem", cursor: "pointer" 
             }}>
               Rejeter la Demande
             </button>
          </div>

          <div style={{ background: "#fff", borderRadius: 32, padding: "2rem", border: "1px solid #E2E8F0" }}>
             <h3 style={{ fontSize: "1rem", fontWeight: 900, color: "#1E293B", marginBottom: "1.2rem", display: "flex", alignItems: "center", gap: 10 }}>
                <Info size={18} color="#3B82F6" /> Note de conformité
             </h3>
             <p style={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 600, lineHeight: 1.6 }}>
                Cette analyse est basée sur les flux Orange Money et MTN MoMo des 6 derniers mois. Elle ne constitue pas une garantie de remboursement.
             </p>
          </div>

        </div>

      </div>

    </div>
  );
}

const S = {
  miniStat: { background: "#F8FAFC", padding: "1.2rem", borderRadius: 20, border: "1px solid #F1F5F9" },
  miniLabel: { margin: 0, fontSize: "0.65rem", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase" },
  miniValue: { margin: "5px 0 0", fontSize: "1rem", fontWeight: 900, color: "#1E293B" }
};
