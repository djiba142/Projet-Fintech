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
  ShieldAlert
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
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
  modalBox: { background: "#fff", width: "100%", maxWidth: 600, borderRadius: 32, padding: "2.5rem", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", position: "relative", maxHeight: "90vh", overflowY: "auto" },
  input: { width: "100%", padding: "12px 14px", borderRadius: 14, border: "2px solid #F1F5F9", background: "#F8FAFC", fontSize: "0.9rem", fontWeight: 700, outline: "none", marginTop: 8 },
  label: { fontSize: "0.75rem", fontWeight: 900, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }
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
      alert(`Utilisateur ${form.fullname} créé avec succès.`);
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
            padding: "10px 20px", borderRadius: 12, background: "#1E293B", color: "#fff", 
            border: "none", fontWeight: 900, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" 
          }}
        >
          <UserPlus size={18} /> Nouvel Utilisateur
        </button>
      </header>

      {/* ── SEARCH ── */}
      <div style={{ background: "#fff", borderRadius: 24, padding: "1.2rem", border: "1px solid #E2E8F0", marginBottom: "2rem", display: "flex", gap: "1.5rem" }}>
         <div style={{ flex: 1, position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
            <input 
              type="text" 
              placeholder="Rechercher par nom, téléphone ou rôle..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "12px 12px 12px 45px", borderRadius: 14, border: "2px solid #F1F5F9", background: "#F8FAFC", fontSize: "0.9rem", fontWeight: 600, outline: "none" }}
            />
         </div>
      </div>

      {/* ── TABLE ── */}
      <div style={{ background: "#fff", borderRadius: 28, border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
              <th style={S.th}>Profil</th>
              <th style={S.th}>Rôle</th>
              <th style={S.th}>Institution / Détails</th>
              <th style={S.th}>Statut</th>
              <th style={S.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: "4rem", textAlign: "center", fontWeight: 800, color: "#94A3B8" }}>Chargement de l'annuaire sécurisé...</td></tr>
            ) : filtered.map((u, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                <td style={S.td}>
                   <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#475569" }}>
                        {u.fullname.charAt(0)}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: "0.9rem" }}>{u.fullname}</p>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "#94A3B8", fontWeight: 600 }}>{u.username}</p>
                      </div>
                   </div>
                </td>
                <td style={S.td}><RoleBadge role={u.role} /></td>
                <td style={S.td}>
                   <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>
                      {u.institution || u.access_level || u.audit_level || "Standard"}
                   </p>
                   {u.department && <p style={{ margin: 0, fontSize: "0.65rem", color: "#94A3B8", fontWeight: 600 }}>{u.department}</p>}
                </td>
                <td style={S.td}>
                   <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: u.status === 'ACTIVE' || u.status === 'active' ? '#10B981' : '#94A3B8' }} />
                      <span style={{ fontSize: "0.8rem", fontWeight: 800, color: u.status === 'ACTIVE' || u.status === 'active' ? '#10B981' : '#64748B' }}>{u.status}</span>
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

      {/* ── CREATE USER MODAL ── */}
      {showModal && (
        <div style={S.modalOverlay}>
          <div style={S.modalBox}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "2rem" }}>
               <div>
                  <h2 style={{ fontSize: "1.6rem", fontWeight: 950, color: "#0F172A", margin: 0 }}>Nouvel Utilisateur</h2>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748B", fontWeight: 600 }}>Création de profil institutionnel sécurisé</p>
               </div>
               <button onClick={() => setShowModal(false)} style={{ background: "#F1F5F9", border: "none", borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748B" }}>
                  <X size={20} />
               </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                  <div>
                     <label style={S.label}>Nom Complet</label>
                     <input required style={S.input} value={form.fullname} onChange={e => setForm({...form, fullname: e.target.value})} placeholder="Jean Dupont" />
                  </div>
                  <div>
                     <label style={S.label}>Téléphone (Username)</label>
                     <div style={{ position: "relative" }}>
                        <Phone size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                        <input required style={{ ...S.input, paddingLeft: "42px" }} value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="6XX XXX XXX" />
                     </div>
                  </div>
               </div>

               <div>
                  <label style={S.label}>Email (Professionnel)</label>
                  <div style={{ position: "relative" }}>
                     <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                     <input style={{ ...S.input, paddingLeft: "42px" }} value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="nom@institution.gn" />
                  </div>
               </div>

               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                  <div>
                     <label style={S.label}>Rôle Système</label>
                     <select style={S.input} value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                        <option value="Agent de Crédit">Agent de Crédit</option>
                        <option value="Analyste Risque">Analyste Risque</option>
                        <option value="Régulateur (BCRG)">Régulateur (BCRG)</option>
                        <option value="Administrateur">Administrateur</option>
                     </select>
                  </div>
                  <div>
                     <label style={S.label}>Mot de passe temporaire</label>
                     <div style={{ position: "relative" }}>
                        <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                        <input required type="password" style={{ ...S.input, paddingLeft: "42px" }} value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" />
                     </div>
                  </div>
               </div>

               {/* --- DYNAMIC FIELDS --- */}
               {form.role === "Agent de Crédit" && (
                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", padding: "1.5rem", background: "#F1F5F9", borderRadius: 20 }}>
                    <div>
                       <label style={S.label}>Institution</label>
                       <div style={{ position: "relative" }}>
                          <Building2 size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                          <input required style={{ ...S.input, background: "#fff", paddingLeft: "42px" }} value={form.institution} onChange={e => setForm({...form, institution: e.target.value})} placeholder="Orange, Vista..." />
                       </div>
                    </div>
                    <div>
                       <label style={S.label}>Département</label>
                       <div style={{ position: "relative" }}>
                          <Briefcase size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                          <input required style={{ ...S.input, background: "#fff", paddingLeft: "42px" }} value={form.department} onChange={e => setForm({...form, department: e.target.value})} placeholder="Crédit, Risque..." />
                       </div>
                    </div>
                 </div>
               )}

               {form.role === "Analyste Risque" && (
                 <div style={{ padding: "1.5rem", background: "#F1F5F9", borderRadius: 20 }}>
                    <label style={S.label}>Niveau d'Accès</label>
                    <select style={{ ...S.input, background: "#fff" }} value={form.access_level} onChange={e => setForm({...form, access_level: e.target.value})}>
                       <option value="Junior">Junior Analyst</option>
                       <option value="Senior">Senior Analyst</option>
                       <option value="Expert">Risk Expert</option>
                    </select>
                 </div>
               )}

               {form.role === "Régulateur (BCRG)" && (
                 <div style={{ padding: "1.5rem", background: "#F1F5F9", borderRadius: 20 }}>
                    <label style={S.label}>Niveau d'Audit</label>
                    <select style={{ ...S.input, background: "#fff" }} value={form.audit_level} onChange={e => setForm({...form, audit_level: e.target.value})}>
                       <option value="Standard">Audit Standard</option>
                       <option value="Supervision">Supervision Nationale</option>
                       <option value="Full Access">Audit Total (Master)</option>
                    </select>
                 </div>
               )}

               <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "1rem", borderRadius: 16, background: "#FFFBEB", border: "1px solid #FEF3C7" }}>
                  <ShieldAlert size={20} color="#D97706" />
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#92400E", fontWeight: 700 }}>
                    L'utilisateur devra obligatoirement changer son mot de passe lors de sa première connexion.
                  </p>
               </div>

               <button 
                 type="submit"
                 style={{ 
                   marginTop: "1rem", padding: "16px", borderRadius: 16, 
                   background: "#0F172A", color: "#fff", border: "none", 
                   fontWeight: 900, fontSize: "1rem", cursor: "pointer",
                   boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.3)"
                 }}
               >
                 Créer le profil institutionnel
               </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
