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
  X,
  ShieldCheck,
  Server,
  Database,
  Cpu,
  Link2,
  Lock
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const LOGOS = {
  "Orange Money": "/orange.png",
  "MTN MoMo": "/mtn.png",
  "Vista Bank": "https://img.icons8.com/color/96/bank.png", 
  "Ecobank": "https://img.icons8.com/color/96/bank.png"
};

const S = {
  miniStat: { background: "#F8FAFC", padding: "1rem", borderRadius: 16, border: "1px solid #F1F5F9" },
  statLab: { margin: 0, fontSize: "0.65rem", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase" },
  statVal: { margin: "4px 0 0", fontSize: "0.95rem", fontWeight: 900, color: "#1E293B" },
  // Modal Style - Infrastructure Theme
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
  modalBox: { background: "#1E293B", width: "100%", maxWidth: 550, borderRadius: 32, padding: "3rem", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", position: "relative", border: "1px solid rgba(255,255,255,0.1)" },
  input: { width: "100%", padding: "14px", borderRadius: 14, border: "2px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.05)", fontSize: "0.9rem", fontWeight: 700, outline: "none", marginTop: 8, color: "#fff" },
  label: { fontSize: "0.7rem", fontWeight: 900, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1.5 }
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
    alert(`Configuration de la passerelle "${form.name}" enregistrée dans le cluster.`);
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "2rem" }}>
         {loading ? (
            <div style={{ padding: "4rem", textAlign: "center", color: "#94A3B8", fontWeight: 800 }}>Vérification de l'état des passerelles...</div>
         ) : institutions.map((inst, i) => (
           <div key={i} style={{ background: "#fff", borderRadius: 28, padding: "2rem", border: "1px solid #E2E8F0", boxShadow: "0 10px 30px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1.5rem" }}>
                 <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "1px solid #E2E8F0" }}>
                       {LOGOS[inst.name] ? (
                         <img src={LOGOS[inst.name]} alt={inst.name} style={{ width: "70%", height: "70%", objectFit: "contain" }} />
                       ) : (
                         <Building2 size={24} color="#1E293B" />
                       )}
                    </div>
                    <div>
                       <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900, color: "#1E293B" }}>{inst.name}</h3>
                       <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: inst.status === 'ONLINE' || inst.status === 'ACTIVE' ? '#10B981' : '#F59E0B' }} />
                          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: inst.status === 'ONLINE' || inst.status === 'ACTIVE' ? '#10B981' : '#F59E0B' }}>{inst.status}</span>
                       </div>
                    </div>
                 </div>
                 <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => alert(`Logs de ${inst.name}`)} style={S.iconBtn}><Activity size={16} /></button>
                    <button onClick={() => alert(`Monitoring de ${inst.name}`)} style={S.iconBtn}><ExternalLink size={16} /></button>
                 </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                 <div style={S.miniStat}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
                       <Globe size={12} color="#94A3B8" />
                       <p style={S.statLab}>Uptime</p>
                    </div>
                    <p style={S.statVal}>{inst.uptime}</p>
                 </div>
                 <div style={S.miniStat}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
                       <Zap size={12} color="#94A3B8" />
                       <p style={S.statLab}>Latence</p>
                    </div>
                    <p style={S.statVal}>{inst.latency}</p>
                 </div>
                 <div style={{ ...S.miniStat, gridColumn: "span 2" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                       <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <ShieldCheck size={14} color="#10B981" />
                          <p style={S.statLab}>Taux de succès API</p>
                       </div>
                       <span style={S.statVal}>{inst.success_rate}</span>
                    </div>
                    <div style={{ width: "100%", height: 8, background: "#F1F5F9", borderRadius: 10, overflow: "hidden" }}>
                       <div style={{ width: inst.success_rate, height: "100%", background: "#10B981" }} />
                    </div>
                 </div>
              </div>

              <button 
                onClick={() => alert(`Configuration technique pour ${inst.name} activée.`)}
                style={{ width: "100%", padding: "12px", borderRadius: 14, border: "1.5px solid #F1F5F9", background: "#fff", color: "#1E293B", fontSize: "0.85rem", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                 <Settings size={18} /> Configurer l'API
              </button>
           </div>
         ))}
      </div>

      {/* ── ADD INSTITUTION MODAL (Infrastructure Theme) ── */}
      {showModal && (
        <div style={S.modalOverlay}>
          <div style={S.modalBox}>
            <button onClick={() => setShowModal(false)} style={{ position: "absolute", top: 25, right: 25, background: "rgba(255,255,255,0.05)", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
               <X size={20} />
            </button>
            
            <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: "2rem" }}>
               <div style={{ width: 50, height: 50, borderRadius: 16, background: "rgba(59, 130, 246, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3B82F6" }}>
                  <Server size={28} />
               </div>
               <div>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 950, color: "#fff", margin: 0 }}>Ajout Institution</h2>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Configuration de passerelle technique</p>
               </div>
            </div>
            
            <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "1.8rem" }}>
               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                  <div>
                     <label style={S.label}>Nom Partenaire</label>
                     <div style={{ position: "relative" }}>
                        <Building2 size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.2)" }} />
                        <input required style={{ ...S.input, paddingLeft: "42px" }} placeholder="Ex: Vista, Orange..." value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                     </div>
                  </div>
                  <div>
                     <label style={S.label}>Type Infrastructure</label>
                     <div style={{ position: "relative" }}>
                        <Cpu size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.2)" }} />
                        <select style={{ ...S.input, paddingLeft: "42px" }} value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                           <option value="BANK">Banque Commerciale</option>
                           <option value="TELCO">Opérateur Mobile Money</option>
                           <option value="FINTECH">Solution FinTech</option>
                        </select>
                     </div>
                  </div>
               </div>

               <div>
                  <label style={S.label}>Endpoint API de Connexion</label>
                  <div style={{ position: "relative" }}>
                     <Link2 size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.2)" }} />
                     <input required type="url" style={{ ...S.input, paddingLeft: "42px" }} placeholder="https://api.gateway.gn/v1" value={form.endpoint} onChange={e => setForm({...form, endpoint: e.target.value})} />
                  </div>
               </div>

               <div>
                  <label style={S.label}>Secret de Certification (API Key)</label>
                  <div style={{ position: "relative" }}>
                     <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.2)" }} />
                     <input required type="password" style={{ ...S.input, paddingLeft: "42px" }} placeholder="••••••••••••••••" value={form.apiKey} onChange={e => setForm({...form, apiKey: e.target.value})} />
                  </div>
               </div>
               
               <button 
                 type="submit"
                 style={{ 
                   marginTop: "1rem", padding: "16px", borderRadius: 16, 
                   background: "#3B82F6", color: "#fff", border: "none", 
                   fontWeight: 950, fontSize: "0.95rem", cursor: "pointer",
                   boxShadow: "0 10px 20px rgba(59, 130, 246, 0.3)"
                 }}
               >
                 Déployer la passerelle
               </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

const iconBtn = { width: 36, height: 36, borderRadius: 10, background: "#F8FAFC", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B", cursor: "pointer" };
