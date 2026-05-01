import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  RefreshCw, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function TransactionsPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [opFilter, setOpFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const fetchTransactions = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API}/m1/transactions/${user.username}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data.transactions || []);
    } catch (err) {
      console.error("Erreur fetch transactions", err);
      setError("Impossible de charger l'historique.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [token]);

  const filtered = useMemo(() => {
    return data.filter(t => {
      const matchOp = opFilter === "all" || t.operator.toLowerCase() === opFilter;
      const matchType = typeFilter === "all" || t.type === typeFilter;
      const matchSearch = (t.receiver || t.desc || "").toLowerCase().includes(search.toLowerCase()) || 
                          (t.amount?.toString() || "").includes(search);
      return matchOp && matchType && matchSearch;
    });
  }, [data, opFilter, typeFilter, search]);

  const stats = useMemo(() => {
    const totalIn = filtered.filter(t => t.type === "CREDIT").reduce((acc, t) => acc + t.amount, 0);
    const totalOut = filtered.filter(t => t.type === "DEBIT").reduce((acc, t) => acc + t.amount, 0);
    return { totalIn, totalOut };
  }, [filtered]);

  return (
    <div className="transactions-content">

      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 950, color: "#1E293B", letterSpacing: "-1px", margin: 0 }}>Historique complet</h1>
        <p style={{ color: "#64748B", fontSize: "0.85rem", fontWeight: 600, margin: 0 }}>Consolidation Orange Money & MTN MoMo</p>
      </div>

      <div className="filters-card">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
          <div>
            <label className="filter-label">Filtrer par opérateur</label>
            <div className="op-filter-group">
              {["all", "orange", "mtn"].map(op => (
                <button key={op} onClick={() => setOpFilter(op)} className={`op-btn ${opFilter === op ? 'active' : ''}`}>
                  {op}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="filter-label">Recherche rapide</label>
            <div style={{ position: "relative" }}>
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Montant, bénéficiaire..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          <div style={{ display: "flex", alignItems: "flex-end" }}>
             <button onClick={fetchTransactions} className="refresh-btn">
                <RefreshCw size={16} className={loading ? "spin-animate" : ""} />
                Actualiser la liste
             </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loader-box">
          <RefreshCw size={32} className="spin-animate" color="#006233" />
        </div>
      ) : (
        <div className="tx-table-container">
          <table className="tx-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Détails & Opérateur</th>
                <th>Montant (GNF)</th>
                <th>État</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="tx-type-cell">
                      <div className={`tx-arrow-icon ${tx.type === "CREDIT" ? 'in' : 'out'}`}>
                        {tx.type === "CREDIT" ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                      </div>
                      <span className="tx-type-text">{tx.type === "CREDIT" ? "Entrant" : "Sortant"}</span>
                    </div>
                  </td>
                  <td>
                    <p className="tx-receiver">{tx.receiver || "N/A"}</p>
                    <p className="tx-meta-op">{tx.operator} • {new Date(tx.date).toLocaleDateString()}</p>
                  </td>
                  <td>
                    <span className={`tx-amount-val ${tx.type === "CREDIT" ? 'positive' : 'negative'}`}>
                      {tx.type === "CREDIT" ? "+" : "-"} {tx.amount.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span className={`tx-status-pill ${tx.status.toLowerCase()}`}>
                      {tx.status === "SUCCESS" ? "Validé" : "En cours"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state">
               <Clock size={40} color="#CBD5E1" />
               <p>Aucune transaction correspondante.</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        .transactions-content { width: 100%; }
        .filters-card { background: #fff; border-radius: 24px; padding: 1.8rem; border: 1.5px solid #F1F5F9; margin-bottom: 2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.02); }
        .filter-label { display: block; fontSize: 0.7rem; font-weight: 900; color: #94A3B8; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 1px; }
        .op-filter-group { display: flex; gap: 8px; background: #F8FAFC; padding: 4px; border-radius: 12px; border: 1px solid #F1F5F9; }
        .op-btn { flex: 1; padding: 8px; border: none; border-radius: 8px; font-size: 0.75rem; font-weight: 800; cursor: pointer; transition: 0.2s; text-transform: capitalize; color: #64748B; background: transparent; }
        .op-btn.active { background: #fff; color: #006233; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94A3B8; }
        .search-input { width: 100%; padding: 12px 12px 12px 42px; border-radius: 14px; border: 1.5px solid #F1F5F9; background: #F8FAFC; font-size: 0.9rem; font-weight: 600; outline: none; transition: 0.2s; }
        .search-input:focus { border-color: #006233; background: #fff; }
        .refresh-btn { background: #006233; color: #fff; border: none; padding: 0 1.5rem; height: 46px; border-radius: 14px; font-size: 0.8rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
        .refresh-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,98,51,0.2); }
        .tx-table-container { background: #fff; border-radius: 28px; border: 1.5px solid #F1F5F9; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.02); }
        .tx-table { width: 100%; border-collapse: collapse; }
        .tx-table th { background: #F8FAFC; padding: 1.2rem; text-align: left; font-size: 0.7rem; font-weight: 900; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1.5px solid #F1F5F9; }
        .tx-table td { padding: 1.4rem 1.2rem; border-bottom: 1px solid #F8FAFC; vertical-align: middle; }
        .tx-type-cell { display: flex; align-items: center; gap: 12px; }
        .tx-arrow-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .tx-arrow-icon.in { background: #DCFCE7; color: #10B981; }
        .tx-arrow-icon.out { background: #FEE2E2; color: #EF4444; }
        .tx-type-text { font-size: 0.9rem; font-weight: 800; color: #1E293B; }
        .tx-receiver { font-size: 0.95rem; font-weight: 850; color: #1E293B; margin: 0; }
        .tx-meta-op { font-size: 0.75rem; font-weight: 600; color: #94A3B8; margin: 2px 0 0; }
        .tx-amount-val { font-size: 1.1rem; font-weight: 900; }
        .tx-amount-val.positive { color: #10B981; }
        .tx-amount-val.negative { color: #1E293B; }
        .tx-status-pill { font-size: 0.7rem; font-weight: 900; padding: 6px 14px; border-radius: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .tx-status-pill.success { background: #ECFDF5; color: #059669; }
        .tx-status-pill.pending { background: #FFFBEB; color: #D97706; }
        .empty-state { padding: 5rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem; color: #94A3B8; font-weight: 700; }
        .loader-box { padding: 5rem; display: flex; justify-content: center; }
        .spin-animate { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
