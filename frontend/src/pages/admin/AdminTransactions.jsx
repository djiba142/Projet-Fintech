import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  CreditCard
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function AdminTransactions() {
  const { token } = useAuth();
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchTxs = async () => {
      try {
        const res = await axios.get(`${API}/m3/admin/transactions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTxs(res.data);
      } catch (err) {
        console.error("Fetch All Txs Error", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchTxs();
  }, [token]);

  const filtered = txs.filter(t => 
    t.username.toLowerCase().includes(search.toLowerCase()) || 
    t.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "2rem", background: "#F8FAFC", minHeight: "100vh" }}>
      
      <header style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 950, color: "#1E293B", margin: 0 }}>Grand Livre des Transactions</h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748B", fontWeight: 600 }}>Surveillance globale des flux financiers de tout le réseau</p>
        </div>
        <button style={{ padding: "10px 20px", borderRadius: 12, background: "#fff", border: "1px solid #E2E8F0", fontWeight: 800, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
           <Download size={18} /> Exporter (CSV/PDF)
        </button>
      </header>

      <div style={{ background: "#fff", borderRadius: 24, padding: "1.2rem", border: "1px solid #E2E8F0", marginBottom: "2rem", display: "flex", gap: "1.2rem" }}>
         <div style={{ flex: 1, position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
            <input 
              type="text" 
              placeholder="Rechercher par utilisateur, type ou montant..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "12px 12px 12px 45px", borderRadius: 14, border: "2px solid #F1F5F9", background: "#F8FAFC", fontSize: "0.9rem", fontWeight: 600, outline: "none" }}
            />
         </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 28, border: "1px solid #E2E8F0", overflow: "hidden" }}>
         <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
               <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                  <th style={S.th}>Utilisateur</th>
                  <th style={S.th}>Type</th>
                  <th style={S.th}>Montant</th>
                  <th style={S.th}>Statut</th>
                  <th style={S.th}>Date</th>
                  <th style={S.th}>Action</th>
               </tr>
            </thead>
            <tbody>
               {loading ? (
                  <tr><td colSpan={6} style={{ padding: "4rem", textAlign: "center", color: "#94A3B8", fontWeight: 800 }}>Extraction du registre central...</td></tr>
               ) : filtered.map((tx, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                     <td style={S.td}>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: "0.85rem" }}>{tx.username}</p>
                     </td>
                     <td style={S.td}>
                        <span style={{ fontSize: "0.7rem", fontWeight: 900, color: "#64748B", background: "#F1F5F9", padding: "4px 8px", borderRadius: 6 }}>{tx.type}</span>
                     </td>
                     <td style={S.td}>
                        <span style={{ fontWeight: 900, color: tx.amount < 0 ? "#EF4444" : "#10B981" }}>
                           {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()} GNF
                        </span>
                     </td>
                     <td style={S.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                           <CheckCircle2 size={16} color="#10B981" />
                           <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#10B981" }}>COMPLETED</span>
                        </div>
                     </td>
                     <td style={S.td}>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "#94A3B8", fontWeight: 600 }}>{new Date(tx.date).toLocaleString()}</p>
                     </td>
                     <td style={S.td}>
                        <button style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                           <MoreVertical size={16} color="#64748B" />
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
