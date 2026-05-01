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
  CreditCard,
  History,
  Activity,
  User,
  Calendar
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const S = {
  th: { padding: "1.2rem 1.5rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1.2 },
  td: { padding: "1.2rem 1.5rem", color: "#1E293B", borderBottom: "1px solid #F1F5F9" },
  status: (s) => ({
    padding: "6px 12px", borderRadius: 10, fontSize: "0.7rem", fontWeight: 900, textTransform: "uppercase",
    background: s === 'SUCCESS' || s === 'COMPLETED' ? '#DCFCE7' : '#FEE2E2',
    color: s === 'SUCCESS' || s === 'COMPLETED' ? '#16A34A' : '#DC2626',
    display: "flex", alignItems: "center", gap: 6, width: "fit-content"
  })
};

export default function AdminTransactions() {
  const { token } = useAuth();
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchTxs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/m3/admin/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTxs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch All Txs Error", err);
      setTxs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchTxs();
  }, [token]);

  const filtered = txs.filter(t => 
    (t.username || "").toLowerCase().includes(search.toLowerCase()) || 
    (t.type || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.tx_id || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "2rem", background: "#F8FAFC", minHeight: "100vh" }}>
      
      <header style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
             <div style={{ padding: 8, background: "#1E293B", borderRadius: 10, color: "#fff" }}>
                <History size={20} />
             </div>
             <h1 style={{ fontSize: "1.8rem", fontWeight: 950, color: "#1E293B", margin: 0 }}>Grand Livre des Transactions</h1>
          </div>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748B", fontWeight: 600 }}>Surveillance globale des flux financiers de tout le réseau Kandjou</p>
        </div>
        <button 
          onClick={() => alert("Génération de l'archive CSV...")}
          style={{ padding: "12px 24px", borderRadius: 12, background: "#fff", border: "1.5px solid #E2E8F0", fontWeight: 900, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}
        >
           <Download size={18} /> Exporter le Registre
        </button>
      </header>

      <div style={{ background: "#fff", borderRadius: 28, padding: "1.5rem", border: "1px solid #E2E8F0", marginBottom: "2rem", display: "flex", gap: "1.2rem", boxShadow: "0 10px 30px -15px rgba(0,0,0,0.05)" }}>
         <div style={{ flex: 1, position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
            <input 
              type="text" 
              placeholder="Rechercher par identifiant, utilisateur ou type d'opération..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "14px 14px 14px 52px", borderRadius: 16, border: "2px solid #F1F5F9", background: "#F8FAFC", fontSize: "0.95rem", fontWeight: 700, outline: "none" }}
            />
         </div>
         <button style={{ padding: "0 20px", borderRadius: 14, background: "#F1F5F9", border: "none", color: "#475569", fontWeight: 800, cursor: "pointer" }}>
            <Filter size={18} />
         </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 32, border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 20px 40px -20px rgba(0,0,0,0.05)" }}>
         <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
               <thead>
                  <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                     <th style={S.th}>Référence & Client</th>
                     <th style={S.th}>Opération</th>
                     <th style={S.th}>Montant (GNF)</th>
                     <th style={S.th}>Statut</th>
                     <th style={S.th}>Horodatage</th>
                     <th style={S.th}>Actions</th>
                  </tr>
               </thead>
               <tbody>
                  {loading ? (
                     <tr><td colSpan={6} style={{ padding: "6rem", textAlign: "center", color: "#94A3B8", fontWeight: 800 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 15 }}>
                           <Activity className="animate-pulse" size={40} color="#CBD5E1" />
                           Extraction sécurisée du registre central...
                        </div>
                     </td></tr>
                  ) : filtered.length === 0 ? (
                     <tr><td colSpan={6} style={{ padding: "4rem", textAlign: "center", color: "#94A3B8", fontWeight: 700 }}>Aucune transaction trouvée pour cette recherche.</td></tr>
                  ) : filtered.map((tx, i) => (
                     <tr key={i} style={{ transition: "0.2s" }} className="hover-row">
                        <td style={S.td}>
                           <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B" }}>
                                 <CreditCard size={18} />
                              </div>
                              <div>
                                 <p style={{ margin: 0, fontWeight: 900, fontSize: "0.85rem", color: "#1E293B" }}>{tx.tx_id || `TXN-${i}`}</p>
                                 <p style={{ margin: 0, fontSize: "0.75rem", color: "#94A3B8", fontWeight: 700 }}>{tx.username || "Inconnu"}</p>
                              </div>
                           </div>
                        </td>
                        <td style={S.td}>
                           <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: "0.7rem", fontWeight: 950, color: "#475569", background: "#F1F5F9", padding: "5px 10px", borderRadius: 8, letterSpacing: 0.5 }}>
                                 {tx.type || "N/A"}
                              </span>
                           </div>
                        </td>
                        <td style={S.td}>
                           <span style={{ fontWeight: 950, fontSize: "0.95rem", color: (tx.amount || 0) < 0 ? "#EF4444" : "#10B981" }}>
                              {(tx.amount || 0) > 0 ? "+" : ""}{(tx.amount || 0).toLocaleString()} GNF
                           </span>
                        </td>
                        <td style={S.td}>
                           <div style={S.status(tx.status || 'SUCCESS')}>
                              { (tx.status === 'SUCCESS' || tx.status === 'COMPLETED') ? <CheckCircle2 size={14} /> : <XCircle size={14} /> }
                              {tx.status || 'SUCCESS'}
                           </div>
                        </td>
                        <td style={S.td}>
                           <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748B" }}>
                              <Calendar size={14} />
                              <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                                 {tx.date ? new Date(tx.date).toLocaleDateString() : '---'}
                              </span>
                              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94A3B8" }}>
                                 {tx.date ? new Date(tx.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}
                              </span>
                           </div>
                        </td>
                        <td style={S.td}>
                           <button 
                             onClick={() => alert(`Détails de la transaction ${tx.tx_id}`)}
                             style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" }}
                             onMouseOver={e => e.currentTarget.style.background = "#F8FAFC"}
                             onMouseOut={e => e.currentTarget.style.background = "#fff"}
                           >
                              <MoreVertical size={16} color="#64748B" />
                           </button>
                        </td>
                   </tr>
                ))}
               </tbody>
            </table>
         </div>
      </div>

    </div>
  );
}
