import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Plus, UserCircle, CheckCircle, Clock } from "lucide-react";
import MainLayout from "../components/MainLayout";
import axios from "axios";

const API = "http://localhost:8000";

export default function AgentDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [data, setData] = useState({ dossiers: [], clients_count: 0, pending_count: 0, approved_count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("kandjou_token");
        const res = await axios.get(`${API}/m1/institutions/overview`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error("Erreur fetch overview", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: "Clients totaux", val: data.clients_count, icon: <UserCircle size={24} />, color: "#1E293B" },
    { label: "En attente", val: data.pending_count, icon: <Clock size={24} />, color: "#F59E0B" },
    { label: "Approuvés", val: data.approved_count, icon: <CheckCircle size={24} />, color: "#10B981" },
    { label: "Taux d'approbation", val: data.dossiers.length ? Math.round((data.approved_count / data.dossiers.length) * 100) + "%" : "0%", icon: <CheckCircle size={24} />, color: "#006233" },
  ];

  const filtered = data.dossiers.filter(d => 
    d.client_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: "4rem" }}>
        {/* Header */}
        <header style={{ marginBottom: "3rem" }}>
           <h1 style={{ fontSize: "2.4rem", fontWeight: 950, color: "#1E293B", letterSpacing: "-1px" }}>Tableau de bord conseiller</h1>
           <p style={{ color: "#64748B", fontSize: "1rem", fontWeight: 600, marginTop: "0.5rem" }}>Portail Institution Financière — Analyse & Crédit</p>
        </header>

        {/* Stats Section */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "3rem" }}>
           {stats.map((s, i) => (
             <div key={i} style={{ background: "#fff", padding: "1.8rem", borderRadius: 28, border: "1px solid #F1F5F9", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.02)" }}>
                <div style={{ color: s.color, marginBottom: "12px", display: "flex", justifyContent: "center" }}>{s.icon}</div>
                <p style={{ fontSize: "0.7rem", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: "8px" }}>{s.label}</p>
                <p style={{ fontSize: "2rem", fontWeight: 950, color: "#1E293B" }}>{s.val}</p>
             </div>
           ))}
        </div>

        {/* Main Content Card */}
        <div style={{ background: "#fff", padding: "2.5rem", borderRadius: 32, border: "1px solid #F1F5F9", boxShadow: "0 10px 40px rgba(0,0,0,0.03)" }}>
           <div style={{ display: "flex", gap: "1rem", marginBottom: "2.5rem" }}>
              <div style={{ flex: 1, position: "relative" }}>
                 <input 
                   type="text" 
                   placeholder="Rechercher par identifiant client..." 
                   style={{ width: "100%", padding: "1.2rem 1.5rem", borderRadius: 16, border: "1px solid #E2E8F0", background: "#F8FAFC", outline: "none", fontSize: "0.9rem", fontWeight: 600 }}
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                 />
              </div>
              <button style={{ padding: "0 2rem", background: "#006233", color: "#fff", borderRadius: 16, border: "none", fontWeight: 800, cursor: "pointer" }}>Rechercher</button>
           </div>

           <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", textAlign: "left", borderCollapse: "separate", borderSpacing: "0 10px" }}>
                 <thead>
                    <tr style={{ fontSize: "0.7rem", fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1.5 }}>
                       <th style={{ padding: "10px 20px" }}>ID Client</th>
                       <th style={{ padding: "10px 20px" }}>Score</th>
                       <th style={{ padding: "10px 20px" }}>Montant</th>
                       <th style={{ padding: "10px 20px" }}>Date</th>
                       <th style={{ padding: "10px 20px" }}>Statut</th>
                    </tr>
                 </thead>
                 <tbody>
                    {loading ? (
                       <tr><td colSpan="5" style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>Chargement des dossiers...</td></tr>
                    ) : filtered.length === 0 ? (
                        <tr><td colSpan="5" style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>Aucun dossier trouvé.</td></tr>
                    ) : filtered.map((d, i) => (
                       <tr key={i} onClick={() => navigate(`/client-detail?id=${d.client_id}&dossier=${d.id}`)} style={{ background: "#F8FAFC", borderRadius: 16, cursor: "pointer", transition: "transform 0.2s" }}>
                          <td style={{ padding: "15px 20px", borderRadius: "16px 0 0 16px" }}>
                             <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ width: 36, height: 36, background: "#E8F3EE", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#006233" }}>{d.client_id.charAt(0)}</div>
                                <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#1E293B" }}>{d.client_id}</span>
                             </div>
                          </td>
                          <td style={{ padding: "15px 20px" }}>
                             <span style={{ fontSize: "0.9rem", fontWeight: 900, color: "#006233" }}>{d.score}/100</span>
                          </td>
                          <td style={{ padding: "15px 20px", fontSize: "0.85rem", fontWeight: 800, color: "#334155" }}>
                             {d.amount.toLocaleString()} GNF
                          </td>
                          <td style={{ padding: "15px 20px", fontSize: "0.8rem", color: "#64748B" }}>
                             {new Date(d.created_at).toLocaleDateString()}
                          </td>
                          <td style={{ padding: "15px 20px", borderRadius: "0 16px 16px 0" }}>
                             <span style={{ 
                               fontSize: "0.65rem", 
                               fontWeight: 950, 
                               color: d.status === "APPROVED" ? "#10B981" : d.status === "REJECTED" ? "#EF4444" : "#F59E0B", 
                               background: "#fff", 
                               padding: "4px 10px", 
                               borderRadius: 8, 
                               border: "1px solid #E2E8F0", 
                               textTransform: "uppercase" 
                             }}>{d.status === "APPROVED" ? "Approuvé" : d.status === "REJECTED" ? "Refusé" : "En attente"}</span>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           <div style={{ marginTop: "3rem", display: "flex", justifyContent: "center" }}>
              <button style={{ display: "flex", alignItems: "center", gap: "12px", padding: "1.2rem 2.5rem", background: "#006233", color: "#fff", border: "none", borderRadius: 20, fontWeight: 900, fontSize: "0.95rem", cursor: "pointer", boxShadow: "0 15px 30px rgba(0,98,51,0.2)" }}>
                 <Plus size={22} /> Nouveau dossier crédit
              </button>
           </div>
        </div>
      </div>
    </MainLayout>
  );
}
