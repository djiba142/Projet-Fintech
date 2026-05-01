import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Lock, 
  Check, 
  X, 
  Settings, 
  UserCheck, 
  ShieldAlert,
  Info,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const PermissionBadge = ({ perm }) => (
  <span style={{ padding: "4px 10px", borderRadius: 8, background: "#F1F5F9", color: "#475569", fontSize: "0.7rem", fontWeight: 800, border: "1px solid #E2E8F0" }}>
    {perm}
  </span>
);

export default function AdminRoles() {
  const { token } = useAuth();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axios.get(`${API}/m3/admin/roles`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRoles(res.data);
      } catch (err) {
        console.error("Fetch Roles Error", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchRoles();
  }, [token]);

  return (
    <div style={{ padding: "2rem", background: "#F8FAFC", minHeight: "100vh" }}>
      
      <header style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 950, color: "#1E293B", margin: 0 }}>Rôles & Permissions (RBAC)</h1>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748B", fontWeight: 600 }}>Définition des droits d'accès granulaires pour chaque acteur du système</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "2rem" }}>
        {loading ? (
          <div style={{ padding: "4rem", textAlign: "center", color: "#94A3B8", fontWeight: 800 }}>Chargement de la matrice de sécurité...</div>
        ) : roles.map((r, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 28, padding: "2rem", border: "1px solid #E2E8F0", boxShadow: "0 10px 30px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
               <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: "#1E293B", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                     <ShieldCheck size={22} />
                  </div>
                  <div>
                     <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900, color: "#1E293B" }}>{r.role}</h3>
                     <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748B", fontWeight: 600 }}>Contrôle d'accès actif</p>
                  </div>
               </div>
               <button style={{ padding: "8px 12px", borderRadius: 10, border: "1.5px solid #F1F5F9", background: "#fff", color: "#64748B", fontSize: "0.7rem", fontWeight: 800, cursor: "pointer" }}>
                  Modifier
               </button>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "2rem" }}>
               {r.permissions.map((p, idx) => <PermissionBadge key={idx} perm={p} />)}
            </div>

            <div style={{ background: "#F8FAFC", borderRadius: 16, padding: "1.2rem", border: "1px solid #F1F5F9" }}>
               <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#1E293B", fontWeight: 800, fontSize: "0.8rem", marginBottom: 8 }}>
                  <Info size={16} color="#3B82F6" /> Résumé des accès
               </div>
               <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748B", fontWeight: 500, lineHeight: 1.5 }}>
                  Ce rôle possède des droits de lecture et d'écriture sur les modules assignés. Toute modification est tracée dans les logs d'audit.
               </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
