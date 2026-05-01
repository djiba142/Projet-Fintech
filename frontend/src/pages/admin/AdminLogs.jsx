import { useState, useEffect } from "react";
import { 
  Terminal, 
  Search, 
  Calendar, 
  Download, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  User,
  Filter
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function AdminLogs() {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${API}/m3/admin/logs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLogs(res.data);
      } catch (err) {
        console.error("Fetch Logs Error", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchLogs();
  }, [token]);

  const filtered = logs.filter(l => 
    l.username.toLowerCase().includes(search.toLowerCase()) || 
    l.event_type.toLowerCase().includes(search.toLowerCase()) ||
    l.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "2rem", background: "#F8FAFC", minHeight: "100vh" }}>
      
      <header style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 950, color: "#1E293B", margin: 0 }}>Journaux d'Audit (Logs)</h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748B", fontWeight: 600 }}>Tracaibilité complète des actions administratives et événements système</p>
        </div>
        <button style={{ 
          padding: "10px 20px", borderRadius: 12, background: "#fff", border: "1px solid #E2E8F0", 
          fontWeight: 800, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" 
        }}>
          <Download size={18} /> Exporter les Logs
        </button>
      </header>

      {/* ── SEARCH & FILTERS ── */}
      <div style={{ background: "#fff", borderRadius: 24, padding: "1.2rem", border: "1px solid #E2E8F0", marginBottom: "2rem", display: "flex", gap: "1.2rem" }}>
         <div style={{ flex: 1, position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
            <input 
              type="text" 
              placeholder="Rechercher un événement, un utilisateur ou une IP..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "12px 12px 12px 45px", borderRadius: 14, border: "2px solid #F1F5F9", background: "#F8FAFC", fontSize: "0.9rem", fontWeight: 600, outline: "none" }}
            />
         </div>
         <button style={{ padding: "0 20px", borderRadius: 14, border: "1px solid #E2E8F0", background: "#fff", color: "#64748B", fontWeight: 800, fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 8 }}>
            <Filter size={16} /> Filtre Date
         </button>
      </div>

      {/* ── LOGS STREAM ── */}
      <div style={{ background: "#0F172A", borderRadius: 28, padding: "1.5rem", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "4rem", color: "#334155", fontWeight: 800 }}>Initialisation du flux sécurisé...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem", color: "#334155", fontWeight: 800 }}>Aucun log correspondant.</div>
          ) : filtered.map((log, i) => (
            <div key={i} style={{ 
              display: "grid", gridTemplateColumns: "180px 140px 1fr 120px", gap: "1.5rem", 
              padding: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", 
              fontFamily: "'Fira Code', monospace", fontSize: "0.8rem", alignItems: "center"
            }}>
              <div style={{ color: "#94A3B8", fontWeight: 500 }}>
                 <Clock size={12} style={{ marginRight: 6 }} /> {new Date(log.timestamp).toLocaleString()}
              </div>
              <div style={{ fontWeight: 900, color: log.result === 'SUCCESS' ? '#10B981' : '#EF4444' }}>
                 [{log.event_type}]
              </div>
              <div style={{ color: "#fff", opacity: 0.9 }}>
                 <User size={12} style={{ marginRight: 6, opacity: 0.5 }} />
                 <span style={{ fontWeight: 800, color: "#3B82F6", marginRight: 10 }}>{log.username}</span>
                 {log.details}
              </div>
              <div style={{ textAlign: "right", color: "#64748B", fontWeight: 600 }}>
                 {log.ip || "127.0.0.1"}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
