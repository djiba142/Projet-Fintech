import { useState, useEffect } from "react";
import { 
  Search, 
  UserPlus, 
  Shield, 
  ShieldCheck, 
  UserX, 
  Mail, 
  Lock,
  Trash2,
  RefreshCw,
  Power,
  X,
  Phone,
  Building2,
  Briefcase,
  Eye,
  ShieldAlert,
  UserCircle2,
  UserCog
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const RoleBadge = ({ role }) => {
  const map = {
    "Client": { color: "#16A34A", bg: "#DCFCE7" },
    "Agent de Crédit": { color: "#2563EB", bg: "#DBEAFE" },
    "Analyste Risque": { color: "#7C3AED", bg: "#F3E8FF" },
    "Régulateur (BCRG)": { color: "#0F172A", bg: "#F1F5F9" },
    "Administrateur": { color: "#DC2626", bg: "#FEE2E2" }
  };
  const s = map[role] || map.Client;
  return (
    <span style={{ padding: "4px 10px", borderRadius: 8, background: s.bg, color: s.color, fontSize: "0.7rem", fontWeight: 900, textTransform: "uppercase" }}>
      {role}
    </span>
  );
};

const S = {
  th: { padding: "1.2rem 1.5rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1 },
  td: { padding: "1.2rem 1.5rem", color: "#1E293B" },
  iconBtn: { width: 34, height: 34, borderRadius: 10, border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748B" },
  // Modal Style - Identity/Human Theme (Clean & Professional)
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(6px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
  modalBox: { background: "#fff", width: "100%", maxWidth: 650, borderRadius: 32, padding: "3rem", boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.15)", position: "relative", maxHeight: "90vh", overflowY: "auto", border: "1px solid #E2E8F0" },
  input: { width: "100%", padding: "12px 14px", borderRadius: 14, border: "2px solid #F1F5F9", background: "#F8FAFC", fontSize: "0.9rem", fontWeight: 700, outline: "none", marginTop: 8, color: "#1E293B" },
  label: { fontSize: "0.7rem", fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1.2 }
};

export default function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    fullname: "",
    username: "",
    email: "",
    role: "Agent de Crédit",
    password: "",
    institution: "",
    department: "",
    access_level: "Junior",
    audit_level: "Standard"
  });

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/m3/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Fetch Users Error", err);
    } finally {
      setUsers(prev => prev.length > 0 ? prev : []); // Keep local if failed
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const handleToggle = async (username) => {
    try {
      await axios.post(`${API}/m3/admin/users/toggle/${username}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      alert("Erreur de modification");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/m3/admin/users`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Le profil de ${form.fullname} a été créé avec succès.`);
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur lors de la création");
    }
  };

  const filtered = users.filter(u => 
    u.fullname.toLowerCase().includes(search.toLowerCase()) || 
    u.username.includes(search)
  );

  return (
    <div style={{ padding: "2rem", background: "#F8FAFC", minHeight: "100vh" }}>
      
      <header style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 950, color: "#1E293B", margin: 0 }}>Gestion des Utilisateurs</h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748B", fontWeight: 600 }}>Contrôle des accès, rôles et permissions du réseau national</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ 
            padding: "10px 24px", borderRadius: 12, background: "#1E293B", color: "#fff", 
            border: "none", fontWeight: 900, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
            boxShadow: "0 10px 20px -5px rgba(30, 41, 59, 0.2)"
          }}
        >
          <UserPlus size={18} /> Nouvel Utilisateur
        </button>
      </header>

      {/* ── SEARCH ── */}
      <div style={{ background: "#fff", borderRadius: 24, padding: "1.2rem", border: "1px solid #E2E8F0", marginBottom: "2rem", display: "flex", gap: "1.5rem" }}>
         <div style={{ flex: 1, position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
            <input 
              type="text" 
              placeholder="Rechercher un profil par nom ou téléphone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "14px 14px 14px 50px", borderRadius: 16, border: "2px solid #F1F5F9", background: "#F8FAFC", fontSize: "0.95rem", fontWeight: 700, outline: "none" }}
            />
         </div>
      </div>

      {/* ── TABLE ── */}
      <div style={{ background: "#fff", borderRadius: 28, border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.02)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
              <th style={S.th}>Identité</th>
              <th style={S.th}>Rôle</th>
              <th style={S.th}>Affectation</th>
              <th style={S.th}>État</th>
              <th style={S.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: "4rem", textAlign: "center", fontWeight: 800, color: "#94A3B8" }}>Initialisation de l'annuaire institutionnel...</td></tr>
            ) : filtered.map((u, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                <td style={S.td}>
                   <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#475569", border: "1px solid #E2E8F0" }}>
                        {u.fullname.charAt(0)}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 900, fontSize: "0.9rem", color: "#1E293B" }}>{u.fullname}</p>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "#94A3B8", fontWeight: 700 }}>{u.username}</p>
                      </div>
                   </div>
                </td>
                <td style={S.td}><RoleBadge role={u.role} /></td>
                <td style={S.td}>
                   <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 800, color: "#475569" }}>
                      {u.institution || u.access_level || u.audit_level || "Standard"}
                   </p>
                   {u.department && <p style={{ margin: 0, fontSize: "0.7rem", color: "#94A3B8", fontWeight: 700 }}>{u.department}</p>}
                </td>
                <td style={S.td}>
                   <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: u.status === 'ACTIVE' || u.status === 'active' ? '#10B981' : '#94A3B8' }} />
                      <span style={{ fontSize: "0.8rem", fontWeight: 900, color: u.status === 'ACTIVE' || u.status === 'active' ? '#10B981' : '#64748B' }}>{u.status}</span>
                   </div>
                </td>
                <td style={S.td}>
                   <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => handleToggle(u.username)} style={S.iconBtn} title="Désactiver/Réactiver">
                        <Power size={16} color={u.status === 'ACTIVE' || u.status === 'active' ? '#DC2626' : '#10B981'} />
                      </button>
                      <button style={S.iconBtn} onClick={() => alert(`Détails complets de ${u.fullname}`)}><Eye size={16} /></button>
                      <button style={{ ...S.iconBtn, color: "#DC2626" }} onClick={() => alert("Action réservée au Super Admin")}><Trash2 size={16} /></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── CREATE USER MODAL (Identity Theme) ── */}
      {showModal && (
        <div style={S.modalOverlay}>
          <div style={S.modalBox}>
            <button onClick={() => setShowModal(false)} style={{ position: "absolute", top: 25, right: 25, background: "#F1F5F9", border: "none", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748B" }}>
               <X size={20} />
            </button>
            
            <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: "2.5rem" }}>
               <div style={{ width: 56, height: 56, borderRadius: 18, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB", border: "1px solid #DBEAFE" }}>
                  <UserCog size={32} />
               </div>
               <div>
                  <h2 style={{ fontSize: "1.7rem", fontWeight: 950, color: "#0F172A", margin: 0 }}>Nouvel Utilisateur</h2>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Gestion des accès institutionnels</p>
               </div>
            </div>

            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1.8rem" }}>
               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.8rem" }}>
                  <div>
                     <label style={S.label}>Identité Complète</label>
                     <div style={{ position: "relative" }}>
                        <UserCircle2 size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                        <input required style={{ ...S.input, paddingLeft: "42px" }} value={form.fullname} onChange={e => setForm({...form, fullname: e.target.value})} placeholder="Ex: Jean Dupont" />
                     </div>
                  </div>
                  <div>
                     <label style={S.label}>Téléphone Professionnel</label>
                     <div style={{ position: "relative" }}>
                        <Phone size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                        <input required style={{ ...S.input, paddingLeft: "42px" }} value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="6XX XXX XXX" />
                     </div>
                  </div>
               </div>

               <div>
                  <label style={S.label}>Email (Liaison Authentification)</label>
                  <div style={{ position: "relative" }}>
                     <Mail size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                     <input style={{ ...S.input, paddingLeft: "42px" }} value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="nom@institution.gn" />
                  </div>
               </div>

               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.8rem" }}>
                  <div>
                     <label style={S.label}>Rôle de l'Utilisateur</label>
                     <div style={{ position: "relative" }}>
                        <Shield size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                        <select style={{ ...S.input, paddingLeft: "42px" }} value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                           <option value="Agent de Crédit">Agent de Crédit</option>
                           <option value="Analyste Risque">Analyste Risque</option>
                           <option value="Régulateur (BCRG)">Régulateur (BCRG)</option>
                           <option value="Administrateur">Administrateur</option>
                        </select>
                     </div>
                  </div>
                  <div>
                     <label style={S.label}>Mot de passe Provisoire</label>
                     <div style={{ position: "relative" }}>
                        <Lock size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                        <input required type="password" style={{ ...S.input, paddingLeft: "42px" }} value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" />
                     </div>
                  </div>
               </div>

               {/* --- DYNAMIC SECTION --- */}
               {(form.role === "Agent de Crédit" || form.role === "Analyste Risque" || form.role === "Régulateur (BCRG)") && (
                 <div style={{ padding: "2rem", background: "#F8FAFC", borderRadius: 24, border: "1.5px solid #F1F5F9" }}>
                    <h4 style={{ margin: "0 0 1.5rem", fontSize: "0.75rem", fontWeight: 900, color: "#2563EB", textTransform: "uppercase", letterSpacing: 1 }}>Spécifications du Rôle</h4>
                    
                    {form.role === "Agent de Crédit" && (
                       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                          <div>
                             <label style={S.label}>Institution</label>
                             <input required style={{ ...S.input, background: "#fff" }} value={form.institution} onChange={e => setForm({...form, institution: e.target.value})} placeholder="Ex: Orange Money" />
                          </div>
                          <div>
                             <label style={S.label}>Département</label>
                             <input required style={{ ...S.input, background: "#fff" }} value={form.department} onChange={e => setForm({...form, department: e.target.value})} placeholder="Ex: Risque & Crédit" />
                          </div>
                       </div>
                    )}

                    {form.role === "Analyste Risque" && (
                       <div>
                          <label style={S.label}>Niveau de compétence</label>
                          <select style={{ ...S.input, background: "#fff" }} value={form.access_level} onChange={e => setForm({...form, access_level: e.target.value})}>
                             <option value="Junior">Junior Analyst</option>
                             <option value="Senior">Senior Analyst</option>
                             <option value="Expert">Risk Expert</option>
                          </select>
                       </div>
                    )}

                    {form.role === "Régulateur (BCRG)" && (
                       <div>
                          <label style={S.label}>Périmètre d'Audit</label>
                          <select style={{ ...S.input, background: "#fff" }} value={form.audit_level} onChange={e => setForm({...form, audit_level: e.target.value})}>
                             <option value="Standard">Audit Standard</option>
                             <option value="Supervision">Supervision Nationale</option>
                             <option value="Full Access">Audit Total (Master)</option>
                          </select>
                       </div>
                    )}
                 </div>
               )}

               <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "1.2rem", borderRadius: 20, background: "#FFFBEB", border: "1px solid #FEF3C7" }}>
                  <ShieldAlert size={22} color="#D97706" />
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#92400E", fontWeight: 700 }}>
                    Mesure de sécurité : L'utilisateur sera invité à renouveler ses accès dès la première connexion.
                  </p>
               </div>

               <button 
                 type="submit"
                 style={{ 
                   marginTop: "1rem", padding: "18px", borderRadius: 18, 
                   background: "#2563EB", color: "#fff", border: "none", 
                   fontWeight: 950, fontSize: "1rem", cursor: "pointer",
                   boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.4)"
                 }}
               >
                 Enregistrer le profil utilisateur
               </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
