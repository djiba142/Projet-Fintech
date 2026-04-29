import { useState, useEffect } from "react";
import MainLayout from "../components/MainLayout";
import axios from "axios";

const API = "http://localhost:8000/m3";

const MOCK_ALERTS = [
  { date: "12/05/2024", type: "Anomalie", desc: "Transaction > 5M GNF détectée — Client #4821", niveau: "warning" },
  { date: "11/05/2024", type: "Conformité", desc: "Rapport mensuel Mai généré automatiquement", niveau: "info" },
  { date: "10/05/2024", type: "Sécurité", desc: "3 tentatives de connexion échouées — IP 41.223.xx", niveau: "danger" },
  { date: "09/05/2024", type: "Conformité", desc: "Audit des endpoints API — Tous conformes", niveau: "success" },
];

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("logs"); // logs, alerts, reports

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${API}/admin/audit-logs`);
        setLogs(res.data);
      } catch (err) {
        console.error("Audit fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filtered = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.user_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: "4rem" }}>
        {/* Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
               <div style={{ width: 12, height: 12, background: "#4C1D95", borderRadius: "50%" }} />
               <h2 style={{ fontSize: "0.85rem", fontWeight: 900, color: "#4C1D95", textTransform: "uppercase", letterSpacing: 2 }}>Espace Régulateur — BCRG</h2>
            </div>
            <h1 style={{ fontSize: "2.4rem", fontWeight: 950, color: "#1E293B", letterSpacing: "-1px" }}>Surveillance & Audit</h1>
            <p style={{ color: "#64748B", fontSize: "1rem", fontWeight: 600, marginTop: "0.5rem" }}>Contrôle de conformité et intégrité du système financier</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
             <button style={{ padding: "0.8rem 1.5rem", background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, fontSize: "0.8rem", fontWeight: 800, color: "#4C1D95", cursor: "pointer" }}>Extraire Registre</button>
          </div>
        </header>

        {/* KPIs Section */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "3rem" }}>
          {[
            { label: "Transactions surveillées", val: "245 896", icon: "📊", theme: "#4C1D95" },
            { label: "Alertes détectées", val: "18", icon: "🔴", theme: "#EF4444" },
            { label: "Rapports générés", val: "36", icon: "📄", theme: "#1E293B" },
            { label: "Taux de conformité", val: "98,5%", icon: "✅", theme: "#10B981" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", padding: "1.8rem", borderRadius: 28, border: "1px solid #F1F5F9", boxShadow: "0 10px 30px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
                <span style={{ fontSize: "1.2rem" }}>{s.icon}</span>
                <p style={{ fontSize: "0.7rem", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1.5 }}>{s.label}</p>
              </div>
              <p style={{ fontSize: "2.2rem", fontWeight: 950, color: s.theme, letterSpacing: "-1.5px" }}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Audit Table Section */}
        <div style={{ background: "#fff", padding: "2.5rem", borderRadius: 32, border: "1px solid #F1F5F9", boxShadow: "0 10px 40px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
            <h3 style={{ fontSize: "0.8rem", fontWeight: 900, color: "#1E293B", textTransform: "uppercase", letterSpacing: 2 }}>Consultation journaux (Audit)</h3>
            
            {/* Filters (From Mockup) */}
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
               <div style={{ display: "flex", gap: "8px" }}>
                  <input type="date" style={{ padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: "0.75rem", fontWeight: 700 }} defaultValue="2024-05-01" />
                  <input type="date" style={{ padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: "0.75rem", fontWeight: 700 }} defaultValue="2024-05-12" />
               </div>
               <select style={{ padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: "0.75rem", fontWeight: 700 }}>
                  <option>Tous les événements</option>
                  <option>Transactions</option>
                  <option>Authentification</option>
                  <option>Erreurs</option>
               </select>
               <button style={{ padding: "8px 20px", background: "#4C1D95", color: "#fff", borderRadius: 10, fontSize: "0.75rem", fontWeight: 800, border: "none", cursor: "pointer" }}>Rechercher</button>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", textAlign: "left", borderCollapse: "separate", borderSpacing: "0 10px" }}>
              <thead>
                <tr style={{ fontSize: "0.7rem", fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1.5 }}>
                  <th style={{ padding: "10px 20px" }}>Date/Heure</th>
                  <th style={{ padding: "10px 20px" }}>Événement</th>
                  <th style={{ padding: "10px 20px" }}>Détails / Acteur</th>
                  <th style={{ padding: "10px 20px" }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>Extraction du registre...</td></tr>
                ) : logs.map((l, i) => (
                  <tr key={i} style={{ background: "#F8FAFC", borderRadius: 16 }}>
                    <td style={{ padding: "15px 20px", borderRadius: "16px 0 0 16px", fontSize: "0.85rem", fontWeight: 700, color: "#64748B" }}>{new Date(l.timestamp).toLocaleString()}</td>
                    <td style={{ padding: "15px 20px", fontSize: "0.85rem", fontWeight: 900, color: "#1E293B", textTransform: "uppercase" }}>{l.action}</td>
                    <td style={{ padding: "15px 20px", fontSize: "0.85rem", color: "#64748B", fontWeight: 600 }}>{l.user_id}</td>
                    <td style={{ padding: "15px 20px", borderRadius: "0 16px 16px 0" }}>
                       <span style={{ fontSize: "0.7rem", fontWeight: 900, color: l.result === "SUCCESS" ? "#10B981" : "#EF4444", background: "#fff", padding: "4px 12px", borderRadius: 8, border: "1px solid #E2E8F0" }}>{l.result}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compliance View (From Mockup Tab 10) */}
        <div style={{ marginTop: "3rem", display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "2rem" }}>
           <div style={{ background: "#4C1D95", padding: "2.5rem", borderRadius: 32, color: "#fff" }}>
              <p style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, opacity: 0.6, marginBottom: "1.5rem" }}>Vue d'ensemble conformité</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                 <div>
                    <p style={{ fontSize: "2rem", fontWeight: 950 }}>245 896</p>
                    <p style={{ fontSize: "0.85rem", opacity: 0.6, fontWeight: 600 }}>Transactions surveillées ce mois</p>
                 </div>
                 <div style={{ height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: 2 }}>
                    <div style={{ width: "98.5%", height: "100%", background: "#10B981", borderRadius: 2 }} />
                 </div>
                 <p style={{ fontSize: "0.85rem", fontWeight: 700 }}>Conformité réglementaire : <span style={{ color: "#10B981" }}>98.5%</span></p>
              </div>
           </div>
           
           <div style={{ background: "#fff", padding: "2.5rem", borderRadius: 32, border: "1px solid #F1F5F9", boxShadow: "0 10px 40px rgba(0,0,0,0.03)" }}>
              <h3 style={{ fontSize: "0.8rem", fontWeight: 900, color: "#1E293B", textTransform: "uppercase", letterSpacing: 2, marginBottom: "2rem" }}>Alertes Récentes</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                 {[
                   { msg: "Transaction atypique détectée (> 10M GNF)", type: "ANOMALIE", actor: "Client #892", date: "Il y a 10 min" },
                   { msg: "Tentative d'accès non autorisé", type: "SÉCURITÉ", actor: "IP: 41.223.12.5", date: "Il y a 2 heures" }
                 ].map((a, i) => (
                    <div key={i} style={{ padding: "1.2rem", background: "#FEF2F2", borderRadius: 20, border: "1px solid #FEE2E2" }}>
                       <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                          <span style={{ fontSize: "0.6rem", fontWeight: 900, color: "#EF4444", background: "#fff", padding: "2px 8px", borderRadius: 6 }}>{a.type}</span>
                          <span style={{ fontSize: "0.7rem", color: "#94A3B8", fontWeight: 600 }}>{a.date}</span>
                       </div>
                       <p style={{ fontSize: "0.9rem", fontWeight: 800, color: "#991B1B" }}>{a.msg}</p>
                       <p style={{ fontSize: "0.75rem", color: "#EF4444", fontWeight: 600, marginTop: "4px" }}>Acteur : {a.actor}</p>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </MainLayout>
  );
}
