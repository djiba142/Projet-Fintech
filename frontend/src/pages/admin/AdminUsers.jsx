import { useState, useEffect } from "react";
import { 
  Search, 
  UserPlus, 
  MoreVertical, 
  Shield, 
  ShieldCheck, 
  UserX, 
  Mail, 
  Lock,
  Trash2,
  RefreshCw,
  Power
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

export default function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
        <button style={{ 
          padding: "10px 20px", borderRadius: 12, background: "#1E293B", color: "#fff", 
          border: "none", fontWeight: 900, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" 
        }}>
          <UserPlus size={18} /> Nouvel Utilisateur
        </button>
      </header>

      {/* ── SEARCH ── */}
      <div style={{ background: "#fff", borderRadius: 24, padding: "1.2rem", border: "1px solid #E2E8F0", marginBottom: "2rem", display: "flex", gap: "1.5rem" }}>
         <div style={{ flex: 1, position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
            <input 
              type="text" 
              placeholder="Rechercher par nom, email ou rôle..." 
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
              <th style={S.th}>Statut</th>
              <th style={S.th}>Dernière Activité</th>
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
                   <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: u.status === 'ACTIVE' ? '#10B981' : '#94A3B8' }} />
                      <span style={{ fontSize: "0.8rem", fontWeight: 800, color: u.status === 'ACTIVE' ? '#10B981' : '#64748B' }}>{u.status}</span>
                   </div>
                </td>
                <td style={S.td}>
                   <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>Aujourd'hui, 14:22</p>
                </td>
                <td style={S.td}>
                   <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => handleToggle(u.username)} style={S.iconBtn} title="Désactiver/Réactiver">
                        <Power size={16} color={u.status === 'ACTIVE' ? '#DC2626' : '#10B981'} />
                      </button>
                      <button style={S.iconBtn}><Lock size={16} /></button>
                      <button style={{ ...S.iconBtn, color: "#DC2626" }}><Trash2 size={16} /></button>
                   </div>
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
  td: { padding: "1.2rem 1.5rem", color: "#1E293B" },
  iconBtn: { width: 34, height: 34, borderRadius: 10, border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748B" }
};
