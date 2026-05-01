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
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 20px" }}>

      <header style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem", paddingTop: "2rem" }}>
        <button onClick={() => navigate("/dashboard")} style={{
          width: 40, height: 40, background: "#fff", border: "1px solid #E2E8F0",
          borderRadius: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <ArrowLeft size={18} color="#64748B" />
        </button>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#1E293B", letterSpacing: "-1px", margin: 0 }}>Historique des transactions</h1>
          <p style={{ color: "#64748B", fontSize: "0.85rem", fontWeight: 600, margin: 0 }}>Gérez et analysez vos flux Orange et MTN</p>
        </div>

        <button onClick={fetchTransactions} style={{
          marginLeft: "auto", background: "#fff", border: "1px solid #E2E8F0", padding: "0.6rem 1rem",
          borderRadius: 12, fontSize: "0.75rem", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8
        }}>
          <RefreshCw size={14} className={loading ? "spin-animate" : ""} />
          Actualiser
        </button>
      </header>

      <div style={{
        background: "#fff", borderRadius: 24, padding: "2rem",
        marginBottom: "2.5rem", border: "1px solid #E2E8F0",
        boxShadow: "0 10px 25px rgba(0,0,0,0.03)"
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", marginBottom: 8 }}>Opérateur</label>
            <div style={{ display: "flex", gap: 6 }}>
              {["all", "orange", "mtn"].map(op => (
                <button key={op} onClick={() => setOpFilter(op)} style={{
                  flex: 1, padding: "8px", borderRadius: 10, fontSize: "0.7rem", fontWeight: 800,
                  textTransform: "capitalize", cursor: "pointer", border: "1px solid",
                  background: opFilter === op ? "#006233" : "#fff",
                  color: opFilter === op ? "#fff" : "#64748B",
                  borderColor: opFilter === op ? "#006233" : "#E2E8F0"
                }}>{op}</button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", marginBottom: 8 }}>Recherche</label>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
              <input 
                type="text" 
                placeholder="N°, montant..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%", padding: "10px 10px 10px 35px", borderRadius: 12, border: "1.5px solid #F1F5F9",
                  background: "#F8FAFC", fontSize: "0.85rem", fontWeight: 600, outline: "none"
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <RefreshCw size={30} className="spin-animate" color="#006233" />
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #E2E8F0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.65rem", fontWeight: 900, color: "#94A3B8", textTransform: "uppercase" }}>Type</th>
                <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.65rem", fontWeight: 900, color: "#94A3B8", textTransform: "uppercase" }}>Destinataire</th>
                <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.65rem", fontWeight: 900, color: "#94A3B8", textTransform: "uppercase" }}>Montant</th>
                <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.65rem", fontWeight: 900, color: "#94A3B8", textTransform: "uppercase" }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ 
                        width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                        background: tx.type === "CREDIT" ? "#F0FDF4" : "#FEF2F2"
                      }}>
                        {tx.type === "CREDIT" ? <ArrowDownLeft size={16} color="#15803D" /> : <ArrowUpRight size={16} color="#B91C1C" />}
                      </div>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1E293B" }}>{tx.type === "CREDIT" ? "Reçu" : "Envoyé"}</span>
                    </div>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1E293B", margin: 0 }}>{tx.receiver}</p>
                    <p style={{ fontSize: "0.65rem", fontWeight: 600, color: "#94A3B8", margin: 0, textTransform: "capitalize" }}>{tx.operator}</p>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{ fontSize: "0.9rem", fontWeight: 900, color: tx.type === "CREDIT" ? "#15803D" : "#B91C1C" }}>
                      {tx.type === "CREDIT" ? "+" : "-"} {tx.amount.toLocaleString()} GNF
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{
                      fontSize: "0.65rem", fontWeight: 900, padding: "4px 10px", borderRadius: 20,
                      background: tx.status === "SUCCESS" ? "#F0FDF4" : "#FFFBEB",
                      color: tx.status === "SUCCESS" ? "#15803D" : "#B45309"
                    }}>{tx.status === "SUCCESS" ? "Complété" : "En attente"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <footer style={{ marginTop: "2.5rem", textAlign: "center", paddingBottom: "2rem" }}>
        <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#CBD5E1", textTransform: "uppercase", letterSpacing: 2 }}>
          Historique consolidé • Données certifiées Orange & MTN
        </p>
      </footer>

      <style>{`
        .spin-animate { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
