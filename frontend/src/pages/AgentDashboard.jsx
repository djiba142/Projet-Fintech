import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Search, 
  Users, 
  BarChart3, 
  ChevronRight, 
  UserCheck, 
  TrendingUp, 
  FileText,
  AlertCircle,
  Filter,
  Eye,
  Activity,
  ArrowUpRight,
  UserPlus,
  CheckCircle,
  Briefcase,
  ShieldCheck,
  Download,
  Clock,
  CheckCircle2,
  Printer,
  QrCode,
  Layout,
  Wallet,
  Home,
  Layers
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import TransactionsChart from "../components/charts/TransactionsChart";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function AgentDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentView = searchParams.get("view") || "accueil";
  const { user, token } = useAuth();
  
  const [data, setData] = useState({ 
    clients: [], 
    clients_count: 0, 
    pending_count: 0, 
    approved_count: 0, 
    avg_score: 0,
    dossiers: [] 
  });
  const [analytics, setAnalytics] = useState({ labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil"], in: [45, 52, 48, 70, 65, 80, 95], out: [20, 30, 25, 40, 35, 50, 45] });
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [resOverview, resDossiers] = await Promise.all([
        axios.get(`${API}/m1/institutions/overview`, { headers }),
        axios.get(`${API}/m1/institutions/dossiers`, { headers })
      ]);
      setData({
        ...resOverview.data,
        dossiers: resDossiers.data.dossiers || []
      });
    } catch (err) {
      console.error("Erreur fetch overview", err);
      setError("Échec de la synchronisation des données.");
    } finally {
      setLoading(false);
      setSwitching(false);
    }
  };

  useEffect(() => {
    setSwitching(true);
    fetchData();
  }, [token, currentView]);

  const filteredClients = useMemo(() => {
    return (data.clients || []).filter(c => 
      c.fullname.toLowerCase().includes(search.toLowerCase()) || 
      c.username.includes(search)
    );
  }, [data.clients, search]);

  const filteredDossiers = useMemo(() => {
    return (data.dossiers || []).filter(d => 
      d.client_id.toLowerCase().includes(search.toLowerCase()) ||
      (d.status && d.status.toLowerCase().includes(search.toLowerCase()))
    );
  }, [data.dossiers, search]);

  if (loading && !data.clients.length && !error) return (
    <div style={{ height: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Activity className="spin" size={32} color="#006233" />
      <p style={{ marginTop: "1rem", fontWeight: 800, color: "#1E293B" }}>Chargement du portail...</p>
    </div>
  );

  return (
    <div className="agent-dashboard">
        
        {/* ── HEADER ── */}
        <div className="dashboard-header-pro no-print">
           <div className="header-info">
             <div className="badge-agent">SESSION : {user?.fullname?.toUpperCase() || "AGENT"}</div>
             <h1 className="main-title" style={{ fontSize: "2.4rem" }}>
                {currentView === 'accueil' ? 'Tableau de Bord' : 
                 currentView === 'dossiers' ? 'Instructions Crédit' : 
                 currentView === 'clients' ? 'Gestion Portefeuille' : 
                 'Analyses Risques'}
             </h1>
             <p className="sub-title">
                {currentView === 'accueil' ? 'Vue d\'ensemble de l\'activité institutionnelle.' : 
                 'Gestion et suivi des demandes de financement.'}
             </p>
           </div>
           <div className="header-actions">
             <button className="export-btn" onClick={() => window.print()}><Printer size={18} /> Rapport</button>
             <button className="add-client-btn" onClick={() => navigate("/register")}><UserPlus size={18} /> Nouveau</button>
           </div>
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span style={{ flex: 1 }}>{error}</span>
            <button onClick={fetchData}>Actualiser</button>
          </div>
        )}

        {/* ── VUE ACCUEIL (DASHBOARD) ── */}
        {currentView === 'accueil' && (
          <div className="dashboard-layout-accueil">
             <div className="stats-grid">
                <div className="stat-card" onClick={() => navigate("/agent?view=dossiers")}>
                    <div className="stat-icon dossiers"><Briefcase size={24} /></div>
                    <div className="stat-info"><p>Dossiers</p><h3>{data.dossiers?.length || 0}</h3></div>
                </div>
                <div className="stat-card" onClick={() => navigate("/agent?view=clients")}>
                    <div className="stat-icon clients"><Users size={24} /></div>
                    <div className="stat-info"><p>Clients</p><h3>{data.clients_count || 0}</h3></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon score"><BarChart3 size={24} /></div>
                    <div className="stat-info"><p>Score Moyen</p><h3>{data.avg_score || 0}</h3></div>
                </div>
             </div>

             <div className="accueil-main-grid">
                <div className="chart-section table-section">
                   <div className="card-header"><Activity size={22} color="#006233" /> <h3 style={{ fontSize: "1.2rem", fontWeight: 950 }}>Performance des Flux</h3></div>
                   <div style={{ height: 280, marginTop: "1rem" }}><TransactionsChart data={analytics} type="line" /></div>
                </div>
                <div className="recent-section table-section">
                   <div className="card-header"><Clock size={22} color="#006233" /> <h3 style={{ fontSize: "1.2rem", fontWeight: 950 }}>Derniers Dossiers</h3></div>
                   <div className="mini-list">
                      {data.dossiers.slice(0, 5).map(d => (
                        <div key={d.id} className="mini-item">
                           <div className="mini-info">
                              <p className="mini-name">{d.client_id}</p>
                              <p className="mini-meta">#LN-{d.id} • {new Date(d.created_at).toLocaleDateString()}</p>
                           </div>
                           <span className={`status-pill ${d.status === 'APPROVED' ? 'safe' : 'risk'}`} style={{ fontSize: '0.6rem' }}>{d.status}</span>
                        </div>
                      ))}
                      {data.dossiers.length === 0 && <p className="empty-text">Aucune activité.</p>}
                   </div>
                   <button className="view-all-btn" onClick={() => navigate("/agent?view=dossiers")}>Tout voir <ChevronRight size={14} /></button>
                </div>
             </div>
          </div>
        )}

        {/* ── VUE DOSSIERS ── */}
        {currentView === 'dossiers' && (
          <div className="table-section">
            <div className="table-header">
               <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <FileText size={28} color="#006233" /> 
                  <h3 style={{ fontSize: "1.5rem", fontWeight: 950, color: "#1E293B" }}>Instructions Crédit</h3>
               </div>
               <div className="search-box" style={{ width: 400 }}>
                  <Search size={18} color="#94A3B8" />
                  <input type="text" placeholder="Rechercher un dossier..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ fontSize: "1rem" }} />
               </div>
            </div>
            <div className="custom-table-container">
              <table className="pro-table">
                <thead>
                  <tr style={{ height: 60 }}>
                    <th style={{ fontSize: "0.8rem" }}>ID Dossier</th><th style={{ fontSize: "0.8rem" }}>Client</th><th style={{ fontSize: "0.8rem" }}>Montant (GNF)</th><th style={{ fontSize: "0.8rem" }}>Score IA</th><th style={{ fontSize: "0.8rem" }}>Statut</th><th style={{ textAlign: "right", fontSize: "0.8rem" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDossiers.map(d => (
                    <tr key={d.id}>
                      <td className="mono" style={{ fontSize: "0.9rem" }}>#LN-{d.id}</td>
                      <td className="name" style={{ fontSize: "1rem" }}>{d.client_id}</td>
                      <td className="amount" style={{ fontSize: "1.1rem" }}>{d.amount.toLocaleString()}</td>
                      <td><span className="score-badge" style={{ color: d.score > 70 ? '#10B981' : '#F97316', fontSize: "1.1rem" }}>{d.score}</span></td>
                      <td><span className={`status-pill ${d.status === 'APPROVED' ? 'safe' : 'risk'}`} style={{ fontSize: "0.8rem", padding: "8px 16px" }}>{d.status}</span></td>
                      <td style={{ textAlign: "right" }}>
                        <button className="action-btn approve" style={{ width: 44, height: 44 }} onClick={() => alert("Instruction validée")}><CheckCircle2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                  {filteredDossiers.length === 0 && <tr><td colSpan="6" className="empty-cell">Aucun dossier trouvé.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── VUE CLIENTS ── */}
        {currentView === 'clients' && (
          <div className="table-section">
            <div className="table-header">
               <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Users size={28} color="#006233" /> 
                  <h3 style={{ fontSize: "1.5rem", fontWeight: 950, color: "#1E293B" }}>Gestion Portefeuille</h3>
               </div>
               <div className="search-box" style={{ width: 400 }}>
                  <Search size={18} color="#94A3B8" />
                  <input type="text" placeholder="Rechercher un client..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ fontSize: "1rem" }} />
               </div>
            </div>
            <div className="custom-table-container">
              <table className="pro-table">
                <thead>
                  <tr style={{ height: 60 }}>
                    <th style={{ fontSize: "0.8rem" }}>Client</th><th style={{ fontSize: "0.8rem" }}>MSISDN</th><th style={{ fontSize: "0.8rem" }}>Score Moyen</th><th style={{ fontSize: "0.8rem" }}>Évaluation</th><th style={{ textAlign: "right", fontSize: "0.8rem" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map(c => (
                    <tr key={c.username}>
                      <td><div className="client-cell"><div className="avatar" style={{ width: 36, height: 36 }}>{c.fullname[0]}</div><div><p className="name" style={{ fontSize: "1rem" }}>{c.fullname}</p><p className="role-meta">Particulier</p></div></div></td>
                      <td className="mono" style={{ fontSize: "0.9rem" }}>{c.username}</td>
                      <td><div className="score-container"><div className="score-bar-bg" style={{ width: 100, height: 8 }}><div className="score-bar-fill" style={{ width: `${c.last_score || 0}%`, background: (c.last_score || 0) > 70 ? '#10B981' : '#F97316' }}></div></div><span className="score-val" style={{ fontSize: "1rem" }}>{c.last_score || 0}</span></div></td>
                      <td><span className={`status-pill ${(c.last_score || 0) > 50 ? 'safe' : 'risk'}`} style={{ fontSize: "0.8rem", padding: "8px 16px" }}>{(c.last_score || 0) > 50 ? 'FAIBLE' : 'HAUT'}</span></td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                          <button className="action-btn" style={{ width: 44, height: 44 }} onClick={() => navigate(`/client-detail?u=${c.username}`)}><FileText size={18} /></button>
                          <button className="action-btn approve" style={{ width: 44, height: 44 }}><CheckCircle size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredClients.length === 0 && <tr><td colSpan="5" className="empty-cell">Aucun client trouvé.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── VUE ANALYSES ── */}
        {currentView === 'analyses' && (
          <div className="table-section">
             <div className="card-header"><BarChart3 size={28} color="#006233" /> <h3 style={{ fontSize: "1.5rem", fontWeight: 950 }}>Analyses Risques</h3></div>
             <div className="charts-grid-pro" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "2rem" }}>
                <div className="table-section"><h4 className="chart-title">Demandes Mensuelles</h4><TransactionsChart data={analytics} type="line" /></div>
                <div className="table-section"><h4 className="chart-title">Répartition Opérateurs</h4><TransactionsChart data={{ labels: ["Orange", "MTN"], in: [65, 42], out: [30, 15] }} type="bar" /></div>
             </div>
          </div>
        )}

      <style>{`
        .agent-dashboard { padding: 1.5rem 3rem; max-width: 1600px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; background: #F8FAFC; min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif; }
        .dashboard-header-pro { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 0.5rem; }
        .badge-agent { display: inline-block; padding: 5px 12px; background: #DCFCE7; color: #166534; font-size: 0.7rem; font-weight: 900; border-radius: 8px; margin-bottom: 8px; letter-spacing: 1px; }
        .main-title { font-weight: 950; color: #1E293B; letter-spacing: -2px; margin: 0; line-height: 1; }
        .sub-title { color: #334155; font-weight: 700; font-size: 0.95rem; margin-top: 8px; }
        .header-actions { display: flex; gap: 12px; }
        .export-btn, .add-client-btn { padding: 12px 24px; border-radius: 16px; font-weight: 800; display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.9rem; }
        .export-btn { background: #fff; color: #1E293B; border: 1.5px solid #E2E8F0; }
        .add-client-btn { background: #006233; color: #fff; border: none; }

        .dashboard-layout-accueil { display: flex; flex-direction: column; gap: 1.5rem; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .stat-card { background: #fff; border-radius: 28px; padding: 2rem; display: flex; align-items: center; gap: 1.5rem; border: 1.5px solid #E2E8F0; cursor: pointer; }
        .stat-icon { width: 56px; height: 56px; border-radius: 18px; display: flex; align-items: center; justify-content: center; }
        .stat-icon.dossiers { background: #EFF6FF; color: #1D4ED8; }
        .stat-icon.clients { background: #F0FDF4; color: #166534; }
        .stat-icon.score { background: #FFF7ED; color: #C2410C; }
        .stat-info p { font-size: 0.75rem; font-weight: 900; color: #334155; text-transform: uppercase; margin: 0; }
        .stat-info h3 { font-size: 2.2rem; font-weight: 950; color: #1E293B; margin: 0; letter-spacing: -1px; }

        .accueil-main-grid { display: grid; grid-template-columns: 1fr 400px; gap: 1.5rem; }
        .table-section { background: #fff; border-radius: 32px; padding: 2.5rem; border: 1.5px solid #E2E8F0; }
        .card-header { display: flex; align-items: center; gap: 15px; margin-bottom: 1rem; }

        .mini-list { display: flex; flex-direction: column; gap: 12px; margin-top: 1.5rem; }
        .mini-item { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1.5px solid #F1F5F9; }
        .mini-name { font-weight: 900; font-size: 0.95rem; color: #1E293B; margin: 0; }
        .mini-meta { font-size: 0.75rem; color: #334155; margin: 4px 0 0 0; font-weight: 700; }
        .view-all-btn { width: 100%; margin-top: 1.5rem; background: #F8FAFC; border: none; padding: 14px; border-radius: 16px; font-size: 0.85rem; font-weight: 800; color: #006233; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }

        .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .search-box { display: flex; align-items: center; gap: 12px; background: #F8FAFC; border: 1.5px solid #E2E8F0; padding: 12px 20px; border-radius: 18px; }
        .search-box input { background: none; border: none; outline: none; font-weight: 800; color: #1E293B; width: 100%; }

        .pro-table { width: 100%; border-collapse: separate; border-spacing: 0 8px; }
        .pro-table th { text-align: left; padding: 0 20px 10px 20px; font-weight: 900; color: #1E293B; text-transform: uppercase; letter-spacing: 1.5px; }
        .pro-table td { padding: 22px 20px; background: #fff; border-top: 1.5px solid #F1F5F9; border-bottom: 1.5px solid #F1F5F9; }
        .pro-table td:first-child { border-left: 1.5px solid #F1F5F9; border-radius: 24px 0 0 24px; }
        .pro-table td:last-child { border-right: 1.5px solid #F1F5F9; border-radius: 0 24px 24px 0; }

        .name { font-weight: 950; color: #1E293B; }
        .mono { font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #1E293B; }
        .amount { font-weight: 950; color: #1E293B; }
        .score-badge { font-weight: 950; }
        .status-pill { padding: 10px 20px; border-radius: 14px; font-size: 0.75rem; font-weight: 900; letter-spacing: 1px; }
        .status-pill.safe { background: #DCFCE7; color: #166534; }
        .status-pill.risk { background: #FEE2E2; color: #991B1B; }

        .action-btn { border-radius: 14px; border: none; background: #F8FAFC; color: #1E293B; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .action-btn:hover { background: #1E293B; color: #fff; transform: scale(1.1); }

        .avatar { background: #006233; color: #fff; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 900; }
        .client-cell { display: flex; align-items: center; gap: 15px; }
        .role-meta { font-size: 0.75rem; color: #1E293B; font-weight: 900; margin: 0; opacity: 0.8; }
        .score-container { display: flex; align-items: center; gap: 12px; }
        .score-bar-bg { background: #F1F5F9; border-radius: 10px; overflow: hidden; }
        .score-bar-fill { height: 100%; border-radius: 10px; }
        .score-val { font-weight: 950; color: #1E293B; }

        .error-banner { background: #FEF2F2; color: #991B1B; padding: 1.5rem; border-radius: 20px; border: 1.5px solid #FEE2E2; display: flex; align-items: center; gap: 15px; font-size: 1rem; font-weight: 900; }
        .error-banner button { background: #991B1B; color: #fff; border: none; padding: 8px 20px; border-radius: 12px; cursor: pointer; font-weight: 900; }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .empty-cell { text-align: center; padding: 4rem !important; color: #94A3B8; font-weight: 900; font-size: 1.1rem; }
        .empty-text { text-align: center; padding: 2rem; color: #94A3B8; font-size: 0.9rem; font-weight: 800; }
      `}</style>
    </div>
  );
}
