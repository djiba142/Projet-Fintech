import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  BarChart3, 
  AlertOctagon, 
  Building2, 
  History, 
  FileCheck, 
  Settings2, 
  LogOut, 
  Search, 
  Download, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  RefreshCcw,
  ArrowRightLeft,
  FileText,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function AuditPage() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [institutions, setInstitutions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (token) fetchRegulatorData();
  }, [token]);

  const fetchRegulatorData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [ovRes, instRes, logRes, txRes] = await Promise.all([
        axios.get(`${API}/m3/audit/overview`, { headers }),
        axios.get(`${API}/m3/audit/institutions`, { headers }),
        axios.get(`${API}/m3/audit/logs`, { headers }),
        axios.get(`${API}/m3/audit/transactions`, { headers })
      ]);
      setData(ovRes.data);
      setInstitutions(instRes.data);
      setLogs(logRes.data);
      setTransactions(txRes.data);
    } catch (err) {
      console.error("Erreur fetch audit", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const generateReport = async () => {
    try {
      const res = await axios.post(`${API}/m3/audit/report/generate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.message);
    } catch (err) { alert("Erreur génération rapport"); }
  };

  const resolveAlert = async (id) => {
    try {
      await axios.post(`${API}/m3/audit/resolve-alert`, { alert_id: id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRegulatorData();
    } catch (err) { alert("Erreur traitement alerte"); }
  };

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <RefreshCcw size={40} className="spin" color="#4C1D95" />
      <p style={{ marginTop: "1rem", fontWeight: 700, color: "#64748B" }}>Accès au registre national sécurisé...</p>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!data) return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <AlertOctagon size={48} color="#EF4444" style={{ marginBottom: "1rem" }} />
      <h2 style={{ color: "#1E293B" }}>Erreur de connexion au registre</h2>
      <p style={{ color: "#64748B" }}>Impossible de récupérer les données de supervision pour le moment.</p>
      <button onClick={fetchRegulatorData} className="btn-primary" style={{ marginTop: "1rem" }}>Réessayer</button>
    </div>
  );

  return (
    <>
      <div className="regulator-container">
        
        {/* Titre de Section */}
        <div style={{ marginBottom: "2rem" }}>
           <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#F1F5F9", color: "#64748B", padding: "4px 10px", borderRadius: 8, fontSize: "0.65rem", fontWeight: 900, marginBottom: 8 }}>
             <ShieldCheck size={12} /> PORTAIL RÉGULATEUR — BCRG
           </div>
           <h1 style={{ fontSize: "1.5rem", fontWeight: 950, color: "#1E293B", margin: 0, letterSpacing: "-1px" }}>Supervision & Conformité Nationale</h1>
        </div>

        {/* ── TABS NAVIGATION ── */}
        <nav className="reg-tabs">
          {[
            { id: "overview", label: "Dashboard Global", icon: <BarChart3 size={18} /> },
            { id: "transactions", label: "Surveillance Flux", icon: <ArrowRightLeft size={18} /> },
            { id: "anomalies", label: "Détection Anomalies", icon: <AlertOctagon size={18} /> },
            { id: "institutions", label: "Institutions Financières", icon: <Building2 size={18} /> },
            { id: "logs", label: "Traçabilité (Logs)", icon: <History size={18} /> },
            { id: "reports", label: "Rapports & Audit", icon: <FileCheck size={18} /> },
            { id: "settings", label: "Règles BCRG", icon: <Settings2 size={18} /> },
          ].map(tab => (
            <button 
              key={tab.id} 
              className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        {/* ── CONTENT AREA ── */}
        <div className="reg-content">

          {/* 3.2 TABLEAU DE BORD GLOBAL */}
          {activeTab === "overview" && (
            <div className="overview-section">
              <div className="stats-grid">
                {[
                  { label: "Transactions Totales", val: data?.stats?.total_transactions?.toLocaleString() || "0", icon: <ArrowRightLeft />, color: "#4C1D95" },
                  { label: "Volume Financier", val: data?.stats?.total_volume || "0 GNF", icon: <BarChart3 />, color: "#10B981" },
                  { label: "Utilisateurs Actifs", val: data?.stats?.active_users || 0, icon: <ShieldCheck />, color: "#3B82F6" },
                  { label: "Institutions Connectées", val: data?.stats?.connected_institutions || 0, icon: <Building2 />, color: "#F59E0B" },
                ].map((s, i) => (
                  <div key={i} className="reg-stat-card">
                    <div className="s-icon" style={{ background: `${s.color}15`, color: s.color }}>{s.icon}</div>
                    <div className="s-info">
                      <p className="s-label">{s.label}</p>
                      <p className="s-value">{s.val}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="two-col-grid">
                 <div className="reg-card">
                   <h3><AlertTriangle size={20} color="#EF4444" /> Alertes de Conformité Récentes</h3>
                   <div className="alert-list">
                      {data?.recent_alerts?.map(a => (
                        <div key={a.id} className="alert-row">
                          <div className="alert-info">
                            <span className="alert-tag">{a.type}</span>
                            <p className="alert-desc">{a.desc}</p>
                            <p className="alert-meta">{a.target} • {a.time}</p>
                          </div>
                          <button onClick={() => resolveAlert(a.id)} className="btn-resolve">Traiter</button>
                        </div>
                      ))}
                   </div>
                 </div>
                 <div className="reg-card bcrg-theme">
                    <h3>État de Conformité Nationale</h3>
                    <div className="compliance-circle">
                       <svg viewBox="0 0 36 36" className="circular-chart">
                         <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                         <path className="circle" strokeDasharray="98.5, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                         <text x="18" y="20.35" className="percentage">98.5%</text>
                       </svg>
                    </div>
                    <p className="compliance-text">Le système financier GN-Connect respecte les directives BCRG-2024-001.</p>
                 </div>
              </div>
            </div>
          )}

          {/* 3.3 SURVEILLANCE DES TRANSACTIONS */}
          {activeTab === "transactions" && (
            <div className="tx-section">
              <div className="section-header">
                <div className="search-bar">
                  <Search size={18} />
                  <input type="text" placeholder="Rechercher une transaction par ID ou Client..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="actions">
                  <button className="btn-secondary"><Filter size={16} /> Filtrer</button>
                  <button className="btn-primary" onClick={generateReport}><Download size={16} /> Exporter Global</button>
                </div>
              </div>
              <div className="reg-table-card">
                <table className="reg-table">
                  <thead>
                    <tr>
                      <th>ID Transaction</th>
                      <th>Acteur Principal</th>
                      <th>Type</th>
                      <th>Montant</th>
                      <th>Horodatage</th>
                      <th>Risque</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(transactions || []).map((tx, i) => (
                      <tr key={i}>
                        <td className="mono">{tx.tx_id}</td>
                        <td className="bold">{tx.client_id}</td>
                        <td>{tx.type}</td>
                        <td className="bold">{tx.amount.toLocaleString()} GNF</td>
                        <td className="mono">{new Date(tx.created_at).toLocaleString()}</td>
                        <td>
                          <span className={`pill ${tx.risk_level === 'HIGH' ? 'error' : 'success'}`}>
                            {tx.risk_level || 'LOW'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(!transactions || transactions.length === 0) && (
                      <tr><td colSpan="6" style={{ textAlign: "center", padding: "3rem", color: "#94A3B8" }}>Aucune transaction suspecte dans le registre.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3.5 SURVEILLANCE DES INSTITUTIONS */}
          {activeTab === "institutions" && (
            <div className="institutions-section">
              <div className="inst-grid">
                {institutions.map(inst => (
                  <div key={inst.id} className="inst-card">
                    <div className="inst-header">
                      <Building2 size={24} color="#4C1D95" />
                      <div>
                        <h3>{inst.name}</h3>
                        <p className="inst-id">ID: {inst.id}</p>
                      </div>
                    </div>
                    <div className="inst-metrics">
                      <div className="metric">
                        <span>Statut</span>
                        <strong className={inst.status === 'CONFORME' ? 'green' : 'orange'}>{inst.status}</strong>
                      </div>
                      <div className="metric">
                        <span>Risque</span>
                        <strong>{inst.risk}</strong>
                      </div>
                      <div className="metric">
                        <span>Dernier Audit</span>
                        <strong>{inst.last_audit}</strong>
                      </div>
                    </div>
                    <div className="inst-actions">
                      <button className="btn-outline">Voir détails</button>
                      <button className="btn-fill">Lancer Audit</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3.6 LOGS & TRAÇABILITÉ */}
          {activeTab === "logs" && (
            <div className="logs-section">
               <div className="reg-table-card">
                 <table className="reg-table">
                   <thead>
                     <tr>
                       <th>Heure</th>
                       <th>Événement</th>
                       <th>Acteur</th>
                       <th>Cible</th>
                       <th>Résultat</th>
                     </tr>
                   </thead>
                   <tbody>
                     {logs.map((l, i) => (
                       <tr key={i}>
                         <td className="mono">{new Date(l.timestamp).toLocaleTimeString()}</td>
                         <td className="bold">{l.action}</td>
                         <td>{l.user_id}</td>
                         <td>{l.target || "-"}</td>
                         <td><span className={`pill ${l.result === 'SUCCESS' ? 'success' : 'error'}`}>{l.result}</span></td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {/* 3.7 RAPPORTS RÉGLEMENTAIRES */}
          {activeTab === "reports" && (
            <div className="reports-section">
               <div className="report-grid">
                  <div className="report-card">
                    <FileText size={40} color="#4C1D95" />
                    <h3>Rapport Mensuel de Conformité</h3>
                    <p>Résumé complet de l'activité financière et des anomalies détectées pour le mois en cours.</p>
                    <button className="btn-primary" onClick={generateReport}>Générer le rapport</button>
                  </div>
                  <div className="report-card">
                    <ShieldCheck size={40} color="#10B981" />
                    <h3>Rapport d'Audit des Institutions</h3>
                    <p>Analyse de risque agrégée pour toutes les microfinances connectées au réseau.</p>
                    <button className="btn-primary" onClick={generateReport}>Générer l'audit</button>
                  </div>
               </div>
            </div>
          )}

          {/* 3.8 PARAMÈTRES RÉGLEMENTAIRES */}
          {activeTab === "settings" && (
            <div className="settings-section">
              <div className="settings-grid">
                 <div className="reg-card">
                   <h3>Seuils de Surveillance</h3>
                   <div className="form-group">
                      <label>Limite Transactionnelle Suspecte (GNF)</label>
                      <input type="text" defaultValue="10 000 000" />
                   </div>
                   <div className="form-group">
                      <label>Délai de notification d'anomalie (sec)</label>
                      <input type="number" defaultValue="5" />
                   </div>
                   <button className="btn-save">Mettre à jour les règles</button>
                 </div>
                 <div className="reg-card">
                   <h3>Configuration Audit</h3>
                   <div className="form-group">
                      <label>Fréquence Audit Automatique (jours)</label>
                      <input type="number" defaultValue="30" />
                   </div>
                   <button className="btn-save">Enregistrer</button>
                 </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <style>{`
        .regulator-container { maxWidth: 1400px; margin: 0 auto; padding: 2rem 1rem; }
        .regulator-header { display: flex; justifyContent: space-between; alignItems: center; marginBottom: 3rem; }
        .bcrg-badge { display: inline-flex; alignItems: center; gap: 6px; background: #EDE9FE; color: #4C1D95; padding: 6px 12px; borderRadius: 8px; fontSize: 0.7rem; fontWeight: 900; letterSpacing: 1px; marginBottom: 12px; }
        .main-title { fontSize: 2.2rem; fontWeight: 950; color: #1E293B; letterSpacing: -1.5px; margin: 0; }
        .subtitle { color: #64748B; fontWeight: 600; marginTop: 4px; }
        .reg-name { color: #4C1D95; }

        .btn-logout { display: flex; alignItems: center; gap: 8px; padding: 0.8rem 1.4rem; borderRadius: 14px; border: 1.5px solid #FEE2E2; background: #fff; color: #EF4444; fontWeight: 800; cursor: pointer; transition: 0.2s; }
        
        .reg-tabs { display: flex; gap: 10px; marginBottom: 2.5rem; overflowX: auto; paddingBottom: 10px; }
        .tab-item { display: flex; alignItems: center; gap: 8px; padding: 0.8rem 1.5rem; borderRadius: 14px; border: none; background: #F1F5F9; color: #64748B; fontWeight: 800; cursor: pointer; whiteSpace: nowrap; transition: 0.2s; }
        .tab-item.active { background: #4C1D95; color: #fff; }

        .stats-grid { display: grid; gridTemplateColumns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; marginBottom: 2.5rem; }
        .reg-stat-card { background: #fff; padding: 1.8rem; borderRadius: 28px; border: 1px solid #F1F5F9; display: flex; alignItems: center; gap: 20px; boxShadow: 0 10px 30px rgba(0,0,0,0.02); }
        .s-icon { width: 56px; height: 56px; borderRadius: 18px; display: flex; alignItems: center; justifyContent: center; fontSize: 1.4rem; }
        .s-label { fontSize: 0.75rem; fontWeight: 900; color: #94A3B8; textTransform: uppercase; letterSpacing: 1px; margin: 0; }
        .s-value { fontSize: 1.8rem; fontWeight: 950; color: #1E293B; margin: 0; letterSpacing: -1px; }

        .two-col-grid { display: grid; gridTemplateColumns: 1.6fr 1fr; gap: 2rem; }
        .reg-card { background: #fff; padding: 2.5rem; borderRadius: 36px; border: 1px solid #F1F5F9; boxShadow: 0 10px 40px rgba(0,0,0,0.02); }
        .reg-card.bcrg-theme { background: #4C1D95; color: #fff; display: flex; flexDirection: column; alignItems: center; textAlign: center; }
        .reg-card h3 { fontSize: 1.1rem; fontWeight: 900; margin-bottom: 2rem; display: flex; alignItems: center; gap: 10px; }

        .alert-list { display: flex; flexDirection: column; gap: 1.2rem; }
        .alert-row { display: flex; justifyContent: space-between; alignItems: center; padding: 1.2rem; background: #FEF2F2; borderRadius: 20px; border: 1px solid #FEE2E2; }
        .alert-tag { background: #fff; color: #EF4444; padding: 4px 10px; borderRadius: 6px; fontSize: 0.65rem; fontWeight: 900; marginBottom: 8px; display: inline-block; }
        .alert-desc { fontSize: 0.9rem; fontWeight: 800; color: #991B1B; margin: 0; }
        .alert-meta { fontSize: 0.75rem; color: #EF4444; fontWeight: 600; marginTop: 4px; margin: 0; }
        .btn-resolve { padding: 8px 16px; borderRadius: 10px; border: none; background: #fff; color: #EF4444; fontWeight: 800; fontSize: 0.75rem; cursor: pointer; border: 1px solid #FEE2E2; }

        .compliance-circle { width: 150px; margin: 2rem 0; }
        .circular-chart { display: block; margin: 10px auto; maxWidth: 100%; maxHeight: 250px; }
        .circle-bg { fill: none; stroke: rgba(255,255,255,0.1); strokeWidth: 2.8; }
        .circle { fill: none; stroke: #10B981; strokeWidth: 2.8; strokeLinecap: round; transition: stroke-dasharray 1s ease 0s; }
        .percentage { fill: #fff; fontFamily: sans-serif; fontSize: 0.5rem; textAnchor: middle; fontWeight: 950; }
        .compliance-text { fontSize: 0.9rem; fontWeight: 600; opacity: 0.8; }

        .section-header { display: flex; justifyContent: space-between; alignItems: center; marginBottom: 2rem; }
        .search-bar { flex: 1; maxWidth: 450px; position: relative; }
        .search-bar svg { position: absolute; left: 1.2rem; top: 1rem; color: #94A3B8; }
        .search-bar input { width: 100%; padding: 0.9rem 1rem 0.9rem 3.2rem; borderRadius: 16px; border: 2px solid #F1F5F9; outline: none; fontWeight: 600; }
        .actions { display: flex; gap: 12px; }
        .btn-primary { display: flex; alignItems: center; gap: 8px; padding: 0.9rem 1.8rem; borderRadius: 16px; border: none; background: #4C1D95; color: #fff; fontWeight: 800; cursor: pointer; transition: 0.2s; }
        .btn-secondary { display: flex; alignItems: center; gap: 8px; padding: 0.9rem 1.8rem; borderRadius: 16px; border: 2px solid #F1F5F9; background: #fff; color: #64748B; fontWeight: 800; cursor: pointer; }

        .reg-table-card { background: #fff; borderRadius: 36px; border: 1px solid #F1F5F9; overflow: hidden; }
        .reg-table { width: 100%; borderCollapse: collapse; }
        .reg-table th { background: #F8FAFC; padding: 1.2rem 1.5rem; textAlign: left; fontSize: 0.75rem; fontWeight: 900; color: #94A3B8; textTransform: uppercase; letterSpacing: 1.5px; }
        .reg-table td { padding: 1.2rem 1.5rem; borderBottom: 1px solid #F8FAFC; fontSize: 0.95rem; }
        .bold { fontWeight: 800; color: #1E293B; }
        .mono { fontFamily: monospace; fontSize: 0.85rem; color: #64748B; }
        .pill { padding: 4px 12px; borderRadius: 10px; fontSize: 0.7rem; fontWeight: 900; textTransform: uppercase; }
        .pill.success { background: #DCFCE7; color: #166534; }
        .pill.error { background: #FEF2F2; color: #991B1B; }

        .inst-grid { display: grid; gridTemplateColumns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; }
        .inst-card { background: #fff; padding: 2rem; borderRadius: 32px; border: 1px solid #F1F5F9; boxShadow: 0 10px 30px rgba(0,0,0,0.02); }
        .inst-header { display: flex; alignItems: center; gap: 15px; marginBottom: 1.5rem; }
        .inst-header h3 { fontSize: 1.1rem; fontWeight: 900; color: #1E293B; margin: 0; }
        .inst-id { fontSize: 0.8rem; color: #94A3B8; fontWeight: 700; margin: 0; }
        .inst-metrics { display: flex; flexDirection: column; gap: 10px; marginBottom: 2rem; }
        .metric { display: flex; justifyContent: space-between; fontSize: 0.9rem; }
        .metric span { color: #64748B; fontWeight: 600; }
        .metric strong.green { color: #10B981; }
        .metric strong.orange { color: #F59E0B; }
        .inst-actions { display: grid; gridTemplateColumns: 1fr 1fr; gap: 10px; }
        .btn-outline { padding: 0.8rem; borderRadius: 12px; border: 2px solid #F1F5F9; background: #fff; fontWeight: 800; cursor: pointer; }
        .btn-fill { padding: 0.8rem; borderRadius: 12px; border: none; background: #1E293B; color: #fff; fontWeight: 800; cursor: pointer; }

        .report-grid { display: grid; gridTemplateColumns: 1fr 1fr; gap: 2rem; }
        .report-card { background: #fff; padding: 3rem; borderRadius: 40px; border: 1px solid #F1F5F9; textAlign: center; display: flex; flexDirection: column; alignItems: center; gap: 1rem; }
        .report-card h3 { fontSize: 1.2rem; fontWeight: 950; color: #1E293B; margin: 0; }
        .report-card p { color: #64748B; fontSize: 0.95rem; fontWeight: 600; lineHeight: 1.5; }

        .form-group { marginBottom: 1.5rem; textAlign: left; }
        .form-group label { display: block; fontSize: 0.85rem; fontWeight: 700; color: #64748B; marginBottom: 8px; }
        .form-group input { width: 100%; padding: 1rem; borderRadius: 14px; border: 2px solid #F1F5F9; outline: none; fontWeight: 700; fontSize: 1.1rem; color: #4C1D95; }
        .btn-save { width: 100%; padding: 1rem; borderRadius: 14px; border: none; background: #1E293B; color: #fff; fontWeight: 800; cursor: pointer; }

        @media (max-width: 1000px) {
          .two-col-grid { gridTemplateColumns: 1fr; }
          .report-grid { gridTemplateColumns: 1fr; }
        }
      `}</style>
    </>
  );
}
