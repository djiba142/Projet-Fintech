import { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  ShieldAlert, 
  Eye, 
  ArrowUpRight, 
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function AuditTransactions() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [opFilter, setOpFilter] = useState("all");
  const [minAmount, setMinAmount] = useState(0);

  useEffect(() => {
    const fetchTx = async () => {
      try {
        const params = {};
        if (opFilter !== "all") params.operator = opFilter;
        if (minAmount > 0) params.min_amount = minAmount;

        const res = await axios.get(`${API}/m1/audit/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
          params
        });
        setTransactions(res.data);
      } catch (err) {
        console.error("Audit TX Error", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchTx();
  }, [token, opFilter, minAmount]);

  const filtered = useMemo(() => {
    return transactions.filter(t => 
      t.receiver.toLowerCase().includes(search.toLowerCase()) ||
      t.client_id?.toLowerCase().includes(search.toLowerCase()) ||
      t.amount.toString().includes(search)
    );
  }, [transactions, search]);

  return (
    <div style={{ padding: "2rem", background: "#F8FAFC", minHeight: "100vh" }}>
      
      {/* ── HEADER ── */}
      <header style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 950, color: "#0F172A", margin: 0, letterSpacing: -1 }}>Surveillance des Flux</h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748B", fontWeight: 600 }}>Audit exhaustif de toutes les transactions du réseau national</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{ background: "#fff", border: "1px solid #E2E8F0", padding: "10px 20px", borderRadius: 12, fontSize: "0.85rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <Download size={18} /> Exporter (XLSX)
          </button>
          <button style={{ background: "#0F172A", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 12, fontSize: "0.85rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <Filter size={18} /> Filtres Avancés
          </button>
        </div>
      </header>

      {/* ── FILTERS ── */}
      <div style={{ background: "#fff", borderRadius: 24, padding: "1.5rem", border: "1px solid #E2E8F0", marginBottom: "2rem", display: "flex", gap: "1.5rem", alignItems: "center" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search size={18} style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
          <input 
            type="text" 
            placeholder="Rechercher par numéro, ID ou montant..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "12px 12px 12px 45px", borderRadius: 14, border: "2px solid #F1F5F9", background: "#F8FAFC", fontSize: "0.9rem", fontWeight: 600, outline: "none" }}
          />
        </div>
        <select 
          value={opFilter}
          onChange={(e) => setOpFilter(e.target.value)}
          style={{ padding: "12px", borderRadius: 14, border: "2px solid #F1F5F9", background: "#F8FAFC", fontWeight: 800, color: "#1E293B", outline: "none" }}
        >
          <option value="all">Tous les opérateurs</option>
          <option value="ORANGE">Orange Money</option>
          <option value="MTN">MTN MoMo</option>
        </select>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#64748B" }}>Seuil AML :</span>
          <input 
            type="number" 
            placeholder="Montant min" 
            onChange={(e) => setMinAmount(Number(e.target.value))}
            style={{ width: 120, padding: "12px", borderRadius: 14, border: "2px solid #F1F5F9", background: "#F8FAFC", fontWeight: 800, outline: "none" }}
          />
        </div>
      </div>

      {/* ── TABLE ── */}
      <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
              <th style={S.th}>ID & Date</th>
              <th style={S.th}>Client / Émetteur</th>
              <th style={S.th}>Destinataire</th>
              <th style={S.th}>Montant (GNF)</th>
              <th style={S.th}>Risque AML</th>
              <th style={S.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: "4rem", textAlign: "center", fontWeight: 800, color: "#94A3B8" }}>Chargement des données certifiées...</td></tr>
            ) : filtered.map((tx, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #F1F5F9" }}>
                <td style={S.td}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: "0.85rem" }}>{tx.id.slice(0, 8)}...</p>
                  <p style={{ margin: 0, fontSize: "0.7rem", color: "#94A3B8", fontWeight: 600 }}>{new Date(tx.date).toLocaleString()}</p>
                </td>
                <td style={S.td}>
                   <p style={{ margin: 0, fontWeight: 700, fontSize: "0.85rem" }}>{tx.client_id || "Anonyme"}</p>
                   <span style={{ fontSize: "0.65rem", padding: "2px 6px", background: tx.op === 'ORANGE' ? '#FFF7ED' : '#F0F9FF', color: tx.op === 'ORANGE' ? '#EA580C' : '#0EA5E9', borderRadius: 6, fontWeight: 900 }}>{tx.op}</span>
                </td>
                <td style={S.td}>
                   <p style={{ margin: 0, fontWeight: 700, fontSize: "0.85rem" }}>{tx.receiver}</p>
                </td>
                <td style={S.td}>
                   <p style={{ margin: 0, fontWeight: 950, fontSize: "1rem", color: tx.type === 'CREDIT' ? '#16A34A' : '#DC2626' }}>
                     {tx.type === 'CREDIT' ? '+' : '-'} {tx.amount.toLocaleString()}
                   </p>
                </td>
                <td style={S.td}>
                   <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: tx.risk_level === 'HIGH' ? '#EF4444' : tx.risk_level === 'MEDIUM' ? '#F59E0B' : '#10B981' }} />
                      <span style={{ fontSize: "0.75rem", fontWeight: 900, color: tx.risk_level === 'HIGH' ? '#EF4444' : tx.risk_level === 'MEDIUM' ? '#B45309' : '#10B981' }}>
                        {tx.risk_level} ({tx.fraud_score})
                      </span>
                   </div>
                </td>
                <td style={S.td}>
                   <div style={{ display: "flex", gap: 8 }}>
                     <button 
                        onClick={() => navigate(`/client-detail?id=${tx.client_id}`)}
                        style={S.iconBtn}
                      >
                        <Eye size={16} />
                      </button>
                     <button style={S.iconBtn}><ShieldAlert size={16} color="#DC2626" /></button>
                     <button style={S.iconBtn}><MoreHorizontal size={16} /></button>
                   </div>
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
  th: { padding: "1.2rem 1.5rem", textAlign: "left", fontSize: "0.7rem", fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1 },
  td: { padding: "1.2rem 1.5rem", color: "#1E293B" },
  iconBtn: { width: 34, height: 34, borderRadius: 10, border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748B" }
};
