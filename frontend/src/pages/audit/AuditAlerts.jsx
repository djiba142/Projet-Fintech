import { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  ShieldAlert, 
  ArrowRight,
  Filter,
  Search,
  ExternalLink
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function AuditAlerts() {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchAlerts = async () => {
    try {
      const res = await axios.get(`${API}/m1/audit/alerts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(res.data);
    } catch (err) {
      console.error("Fetch Alerts Error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAlerts();
  }, [token]);

  const processAlert = async (id, status) => {
    try {
      const note = prompt("Veuillez saisir une note d'audit :");
      if (note === null) return;
      await axios.post(`${API}/m1/audit/alerts/process`, {
        alert_id: id,
        new_status: status,
        note
      }, { headers: { Authorization: `Bearer ${token}` } });
      fetchAlerts();
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    }
  };

  const filtered = alerts.filter(a => filter === "all" || a.status === filter);

  return (
    <div style={{ padding: "2rem", background: "#F8FAFC", minHeight: "100vh" }}>
      
      <header style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 950, color: "#0F172A", margin: 0 }}>Centre d'Alertes AML</h1>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748B", fontWeight: 600 }}>Détection automatique et gestion des activités suspectes (Anti-Blanchiment)</p>
      </header>

      {/* ── STATS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "2.5rem" }}>
        <div style={{ background: "#EF444410", padding: "1.5rem", borderRadius: 20, border: "1px solid #FEE2E2" }}>
          <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 800, color: "#DC2626", textTransform: "uppercase" }}>Urgentes (Ouvertes)</p>
          <h2 style={{ margin: "5px 0", fontSize: "1.5rem", fontWeight: 950, color: "#DC2626" }}>{alerts.filter(a => a.status === 'OPEN').length}</h2>
        </div>
        <div style={{ background: "#F59E0B10", padding: "1.5rem", borderRadius: 20, border: "1px solid #FEF3C7" }}>
          <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 800, color: "#B45309", textTransform: "uppercase" }}>En cours d'examen</p>
          <h2 style={{ margin: "5px 0", fontSize: "1.5rem", fontWeight: 950, color: "#B45309" }}>{alerts.filter(a => a.status === 'INVESTIGATING').length}</h2>
        </div>
        <div style={{ background: "#10B98110", padding: "1.5rem", borderRadius: 20, border: "1px solid #D1FAE5" }}>
          <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 800, color: "#059669", textTransform: "uppercase" }}>Traitées (Closes)</p>
          <h2 style={{ margin: "5px 0", fontSize: "1.5rem", fontWeight: 950, color: "#059669" }}>{alerts.filter(a => a.status === 'CLOSED').length}</h2>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 32, padding: "2rem", border: "1px solid #E2E8F0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
           <div style={{ display: "flex", gap: 10 }}>
              {["all", "OPEN", "INVESTIGATING", "CLOSED"].map(s => (
                <button 
                  key={s}
                  onClick={() => setFilter(s)}
                  style={{
                    padding: "8px 16px", borderRadius: 10, border: "none", fontSize: "0.75rem", fontWeight: 800,
                    background: filter === s ? "#0F172A" : "#F1F5F9",
                    color: filter === s ? "#fff" : "#64748B",
                    cursor: "pointer", transition: "0.2s"
                  }}
                >
                  {s === 'all' ? 'Toutes' : s}
                </button>
              ))}
           </div>
           <button style={{ background: "none", border: "1px solid #E2E8F0", padding: "8px 16px", borderRadius: 10, fontSize: "0.75rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
             <Filter size={14} /> Trier par sévérité
           </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "#94A3B8", fontWeight: 700 }}>Scan des réseaux en cours...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "#94A3B8", fontWeight: 700 }}>Aucune alerte à signaler.</div>
          ) : filtered.map((alert) => (
            <div key={alert.id} style={{
              padding: "1.5rem", background: "#F8FAFC", borderRadius: 20, border: "1.5px solid #F1F5F9",
              display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "1.5rem", alignItems: "start"
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: alert.severity === 'HIGH' ? '#FEE2E2' : '#FEF3C7', display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertTriangle color={alert.severity === 'HIGH' ? '#EF4444' : '#F59E0B'} />
              </div>
              
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                   <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 900, color: "#1E293B" }}>{alert.type}</h3>
                   <span style={{ fontSize: "0.6rem", fontWeight: 950, padding: "2px 8px", borderRadius: 6, background: "#0F172A", color: "#fff" }}>#{alert.tx_id ? alert.tx_id.slice(0, 8) : 'N/A'}</span>
                </div>
                <p style={{ margin: "5px 0", fontSize: "0.85rem", color: "#64748B", fontWeight: 600 }}>{alert.details}</p>
                <div style={{ display: "flex", gap: 15, marginTop: 12 }}>
                   <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.75rem", fontWeight: 700, color: "#94A3B8" }}>
                      <Clock size={14} /> {new Date(alert.created_at).toLocaleString()}
                   </div>
                   <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.75rem", fontWeight: 700, color: "#94A3B8" }}>
                      <ShieldAlert size={14} /> Client: {alert.client_id}
                   </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 140 }}>
                {alert.status === 'OPEN' && (
                  <button onClick={() => processAlert(alert.id, 'INVESTIGATING')} style={S.btnAction}>Examiner</button>
                )}
                {alert.status === 'INVESTIGATING' && (
                  <button onClick={() => processAlert(alert.id, 'CLOSED')} style={{ ...S.btnAction, background: "#10B981", color: "#fff" }}>Clôturer</button>
                )}
                {alert.status === 'CLOSED' && (
                  <div style={{ padding: "8px", background: "#D1FAE5", color: "#065F46", borderRadius: 10, textAlign: "center", fontSize: "0.7rem", fontWeight: 900 }}>Traitée</div>
                )}
                <button style={S.btnSecondary}><ExternalLink size={14} /> Voir Transaction</button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

const S = {
  btnAction: { width: "100%", padding: "10px", borderRadius: 10, border: "none", background: "#0F172A", color: "#fff", fontSize: "0.75rem", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 },
  btnSecondary: { width: "100%", padding: "10px", borderRadius: 10, border: "1px solid #E2E8F0", background: "#fff", color: "#64748B", fontSize: "0.75rem", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }
};
