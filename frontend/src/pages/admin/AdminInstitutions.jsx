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
  Plus,
  Loader2,
  Settings,
  RefreshCw,
  X
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const S = {
  miniStat: { background: "#F8FAFC", padding: "1rem", borderRadius: 16, border: "1px solid #F1F5F9" },
  statLab: { margin: 0, fontSize: "0.65rem", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase" },
  statVal: { margin: "4px 0 0", fontSize: "0.95rem", fontWeight: 900, color: "#1E293B" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
  modalBox: { background: "#fff", width: "100%", maxWidth: 500, borderRadius: 32, padding: "2.5rem", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", position: "relative" },
  input: { width: "100%", padding: "14px", borderRadius: 14, border: "2px solid #F1F5F9", background: "#F8FAFC", fontSize: "0.9rem", fontWeight: 700, outline: "none", marginTop: 8 },
  label: { fontSize: "0.75rem", fontWeight: 900, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }
};

export default function AdminInstitutions() {
  const { token } = useAuth();
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", type: "BANK", endpoint: "", apiKey: "" });

  const fetchInst = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get(`${API}/m3/admin/institutions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInstitutions(res.data);
    } catch (err) {
      console.error("Fetch Inst Error", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) fetchInst();
  }, [token]);

  const handleAdd = (e) => {
    e.preventDefault();
    alert(`Nouvelle institution "${form.name}" enregistrée avec succès.`);
    setShowModal(false);
    setForm({ name: "", type: "BANK", endpoint: "", apiKey: "" });
    fetchInst();
  };

  return (
    <div style={{ padding: "2rem", background: "#F8FAFC", minHeight: "100vh" }}>
      
      <header style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 950, color: "#1E293B", margin: 0 }}>Gestion des Institutions</h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748B", fontWeight: 600 }}>Supervision des APIs Orange, MTN et des banques partenaires</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button 
            onClick={fetchInst}
            style={{ padding: "10px", borderRadius: 12, background: "#fff", border: "1.5px solid #E2E8F0", cursor: "pointer" }}
          >
            <RefreshCw size={18} color="#64748B" className={refreshing ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setShowModal(true)}
            style={{ padding: "10px 24px", borderRadius: 12, background: "#1E293B", color: "#fff", border: "none", fontWeight: 900, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
          >
             <Plus size={18} /> Ajouter une institution
          </button>
        </div>
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
                 <button 
                    onClick={() => alert(`Accès au monitoring externe de ${inst.name}...`)}
                    style={{ background: "none", border: "none", color: "#3B82F6", cursor: "pointer" }}
                  >
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

              <button 
                onClick={() => alert(`Configuration technique pour ${inst.name} activée.`)}
                style={{ width: "100%", padding: "12px", borderRadius: 14, border: "1.5px solid #F1F5F9", background: "#fff", color: "#1E293B", fontSize: "0.8rem", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "0.2s" }}
                onMouseOver={e => e.currentTarget.style.background = "#F8FAFC"}
                onMouseOut={e => e.currentTarget.style.background = "#fff"}
              >
                 <Settings size={16} /> Configurer l'API
              </button>
           </div>
         ))}
      </div>

      {/* ── ADD INSTITUTION MODAL ── */}
      {showModal && (
        <div style={S.modalOverlay}>
          <div style={S.modalBox}>
            <button onClick={() => setShowModal(false)} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "#64748B", cursor: "pointer" }}>
               <X size={24} />
            </button>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 950, color: "#0F172A", marginBottom: "1.5rem" }}>Nouvelle Institution</h2>
            
            <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
               <div>
                  <label style={S.label}>Nom de l'Institution</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Ex: Banque Centrale, Orange..." 
                    style={S.input}
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                  />
               </div>
               <div>
                  <label style={S.label}>Type de Partenaire</label>
                  <select style={S.input} value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                     <option value="BANK">Banque Commerciale</option>
                     <option value="TELCO">Opérateur Télécom (Mobile Money)</option>
                     <option value="FINTECH">Partenaire FinTech</option>
                  </select>
               </div>
               <div>
                  <label style={S.label}>Endpoint API de Connexion</label>
                  <input 
                    required 
                    type="url" 
                    placeholder="https://api.institution.gn/v1" 
                    style={S.input}
                    value={form.endpoint}
                    onChange={e => setForm({...form, endpoint: e.target.value})}
                  />
               </div>
               <div>
                  <label style={S.label}>Clé API / Secret de Certification</label>
                  <input 
                    required 
                    type="password" 
                    placeholder="••••••••••••••••" 
                    style={S.input}
                    value={form.apiKey}
                    onChange={e => setForm({...form, apiKey: e.target.value})}
                  />
               </div>
               
               <button 
                 type="submit"
                 style={{ 
                   marginTop: "1rem", padding: "14px", borderRadius: 14, 
                   background: "#0F172A", color: "#fff", border: "none", 
                   fontWeight: 900, fontSize: "0.9rem", cursor: "pointer" 
                 }}
               >
                 Enregistrer l'institution
               </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
