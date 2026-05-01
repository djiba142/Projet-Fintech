import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  ArrowLeft, 
  LogOut, 
  User, 
  Smartphone, 
  BarChart3, 
  Clock, 
  Download, 
  Printer, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  TrendingUp,
  History,
  ChevronRight,
  Filter,
  Activity,
  Eye
} from "lucide-react";
import MainLayout from "../components/MainLayout";
import axios from "axios";

const API = "http://localhost:8000";

export default function ClientDetailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get("id");
  const dossierId = searchParams.get("dossier");
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Decision Form States
  const [decision, setDecision] = useState({
    amount: "",
    duration: "12",
    observation: ""
  });

  useEffect(() => {
    if (clientId) {
      fetchData();
    }
  }, [clientId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("kandjou_token");
      const res = await axios.get(`${API}/m1/aggregate/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
      if (res.data) {
        setDecision(prev => ({ ...prev, amount: res.data.consolidation.total_balance / 2 }));
      }
    } catch (err) {
      console.error("Erreur fetch client detail", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("kandjou_token");
    localStorage.removeItem("kandjou_user");
    navigate("/login");
  };

  const handleProcessLoan = async (action) => {
    if (!dossierId) {
      alert("ID du dossier manquant. Analyse en mode consultation uniquement.");
      return;
    }
    setProcessing(true);
    try {
      const token = localStorage.getItem("kandjou_token");
      await axios.post(`${API}/m1/loan/process`, {
        dossier_id: parseInt(dossierId),
        action: action
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Décision "${action}" enregistrée avec succès.`);
      navigate("/agent");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement de la décision.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <MainLayout>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ width: 50, height: 50, border: "5px solid #F1F5F9", borderTopColor: "#006233", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ marginTop: "1.5rem", fontWeight: 700, color: "#64748B" }}>Analyse approfondie du dossier client...</p>
      </div>
    </MainLayout>
  );

  if (!data) return (
    <MainLayout>
      <div style={{ textAlign: "center", padding: "5rem" }}>
        <AlertCircle size={48} color="#EF4444" style={{ marginBottom: "1rem" }} />
        <h2 style={{ fontWeight: 800, color: "#1E293B" }}>Dossier introuvable</h2>
        <p style={{ color: "#64748B" }}>Impossible de charger les données de ce client.</p>
        <button onClick={() => navigate("/agent")} style={{ marginTop: "2rem", padding: "1rem 2rem", background: "#006233", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 800 }}>Retour à la liste</button>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="detail-container">
        
        {/* ── 2.1 HEADER ── */}
        <div className="detail-header">
          <div className="header-left">
            <button onClick={() => navigate("/agent")} className="btn-back">
              <ArrowLeft size={20} /> <span className="hide-mobile">Retour</span>
            </button>
            <div className="header-divider hide-mobile" />
            <div>
              <h1 className="client-name">Dossier : {data.kyc.fullname}</h1>
              <p className="client-id">{data.client_id}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={16} /> <span className="hide-mobile">Déconnexion</span>
          </button>
        </div>

        <div className="main-grid">
          
          {/* ── LEFT COLUMN ── */}
          <div className="left-col">
            
            {/* 2.2 INFOS CLIENT & 2.3 SCORE */}
            <div className="info-score-grid">
              {/* Infos Client Card */}
              <div className="glass-card">
                <div className="card-title">
                   <div className="title-icon green"><User size={20} /></div>
                   <h3>Profil Client</h3>
                </div>
                <div className="info-list">
                   <p>Nom : <span>{data.kyc.fullname}</span></p>
                   <p>Numéro : <span>{data.client_id}</span></p>
                   <p>Nationalité : <span>{data.kyc.nationality}</span></p>
                   <p>Pièce ID : <span>{data.kyc.id_card}</span></p>
                </div>
                <button onClick={() => navigate(`/profile-client/${data.client_id}`)} className="btn-secondary full-width">
                  Voir profil complet
                </button>
              </div>

              {/* Score Card */}
              <div className="score-card">
                <h3 className="score-label">Score de solvabilité</h3>
                <div className="score-value">
                   <span className="big-num">{data.credit_analysis.score}</span>
                   <span className="max-num">/ 100</span>
                </div>
                <div className={`score-badge ${data.credit_analysis.score >= 70 ? 'good' : 'warning'}`}>
                  Niveau : {data.credit_analysis.status}
                </div>
                <div className="score-actions">
                   <button onClick={() => navigate(`/score/${data.client_id}`)} className="btn-score">Détails score</button>
                   <button className="btn-score icon-btn"><Download size={14} /> Rapport</button>
                </div>
              </div>
            </div>

            {/* 2.4 COMPTES MOBILE MONEY */}
            <div className="glass-card">
              <h3 className="section-title">Comptes Mobile Money</h3>
              <div className="accounts-grid">
                 <div className="acc-box orange">
                    <div className="acc-header">
                       <div className="op-icon orange"><Smartphone size={24} /></div>
                       <span className="op-name">ORANGE</span>
                    </div>
                    <p className="bal-label">Solde actuel</p>
                    <p className="bal-value">{data.consolidation.orange_balance.toLocaleString()} <span>GNF</span></p>
                    <button onClick={() => navigate(`/transactions?operator=orange&id=${data.client_id}`)} className="btn-acc">Transactions Orange</button>
                 </div>
                 <div className="acc-box mtn">
                    <div className="acc-header">
                       <div className="op-icon mtn"><Smartphone size={24} /></div>
                       <span className="op-name">MTN</span>
                    </div>
                    <p className="bal-label">Solde actuel</p>
                    <p className="bal-value">{data.consolidation.mtn_balance.toLocaleString()} <span>GNF</span></p>
                    <button onClick={() => navigate(`/transactions?operator=mtn&id=${data.client_id}`)} className="btn-acc">Transactions MTN</button>
                 </div>
              </div>
            </div>
            
            {/* 2.5 HISTORIQUE DES TRANSACTIONS */}
            <div className="glass-card">
              <div className="card-header">
                 <h3 className="section-title">Historique des Transactions</h3>
                 <div className="header-actions">
                    <button className="btn-tool"><Filter size={14} /> <span className="hide-mobile">Filtrer</span></button>
                    <button className="btn-tool"><Download size={14} /> <span className="hide-mobile">Exporter</span></button>
                 </div>
              </div>
              <div className="table-responsive">
                 <table className="kandjou-table">
                    <thead>
                       <tr>
                          <th>DATE</th>
                          <th>DESCRIPTION</th>
                          <th className="text-right">MONTANT</th>
                       </tr>
                    </thead>
                    <tbody>
                       {(data.transactions || []).slice(0, 5).map((t, i) => (
                         <tr key={i}>
                            <td className="tx-date">{new Date(t.date).toLocaleDateString()}</td>
                            <td>
                               <div className="tx-desc">
                                  <div className={`tx-dot ${(t.op || 'orange').toLowerCase()}`} />
                                  <span>{t.desc}</span>
                               </div>
                            </td>
                            <td className={`tx-amt ${t.type === 'CREDIT' ? 'plus' : 'minus'}`}>
                               {t.type === 'CREDIT' ? '+' : '-'} {t.amount.toLocaleString()} GNF
                            </td>
                         </tr>
                       ))}
                       {(!data.transactions || data.transactions.length === 0) && (
                         <tr><td colSpan="3" style={{ textAlign: "center", padding: "2rem", color: "#94A3B8" }}>Aucune transaction trouvée.</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
              <button onClick={() => navigate(`/transactions?id=${data.client_id}`)} className="btn-view-all">
                Voir toutes les transactions <ChevronRight size={16} />
              </button>
            </div>

            {/* 2.6 ANALYSE FINANCIÈRE */}
            <div className="glass-card">
              <div className="card-header">
                 <h3 className="section-title">Analyse Financière</h3>
                 <button onClick={() => navigate(`/score/${data.client_id}`)} className="btn-analytics"><TrendingUp size={14} /> Voir graphique</button>
              </div>
              <div className="stats-grid">
                 {[
                   { label: "Revenus mensuels", val: `${(data.consolidation.revenu_mensuel || 0).toLocaleString()} GNF`, icon: <TrendingUp size={18} />, color: "#10B981" },
                   { label: "Dépenses", val: `${(data.consolidation.depense_mensuelle || 0).toLocaleString()} GNF`, icon: <Activity size={18} />, color: "#EF4444" },
                   { label: "Solde moyen", val: `${(data.consolidation.total_balance / 3).toLocaleString()} GNF`, icon: <BarChart3 size={18} />, color: "#3B82F6" },
                   { label: "Transactions", val: `${data.transactions?.length || 0} total`, icon: <History size={18} />, color: "#6366F1" },
                 ].map((stat, i) => (
                   <div key={i} className="stat-item">
                      <div className="stat-icon" style={{ color: stat.color }}>{stat.icon}</div>
                      <div>
                        <p className="stat-label">{stat.label}</p>
                        <p className="stat-val" style={{ fontSize: "0.85rem" }}>{stat.val}</p>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN (DÉCISION) ── */}
          <div className="right-col">
            
            {/* 2.7 DÉCISION DE CRÉDIT */}
            <div className="decision-card">
              <div className="decision-header">
                 <div className="header-icon"><CheckCircle size={20} /></div>
                 <h3>Décision de Crédit</h3>
              </div>
              
              <div className="decision-form">
                 <div className="form-group">
                    <label>Montant proposé (GNF)</label>
                    <input 
                      type="number" 
                      value={decision.amount}
                      onChange={e => setDecision({...decision, amount: e.target.value})}
                      className="input-money"
                    />
                 </div>

                 <div className="form-group">
                    <label>Durée (Mois)</label>
                    <select 
                      value={decision.duration}
                      onChange={e => setDecision({...decision, duration: e.target.value})}
                      className="select-kandjou"
                    >
                      <option value="6">6 Mois</option>
                      <option value="12">12 Mois</option>
                      <option value="24">24 Mois</option>
                    </select>
                 </div>

                 <div className="form-group">
                    <label>Observations</label>
                    <textarea 
                      placeholder="Commentaires sur le dossier..."
                      value={decision.observation}
                      onChange={e => setDecision({...decision, observation: e.target.value})}
                      className="textarea-kandjou"
                    />
                 </div>

                 <div className="action-stack">
                    <button 
                      onClick={() => handleProcessLoan("APPROVE")}
                      disabled={processing}
                      className="btn-approve"
                    >
                      Approuver le crédit
                    </button>
                    <div className="action-row">
                       <button onClick={() => handleProcessLoan("REJECT")} disabled={processing} className="btn-reject">Refuser</button>
                       <button onClick={() => handleProcessLoan("PENDING")} disabled={processing} className="btn-pending">Attente</button>
                    </div>
                 </div>
              </div>

              {/* 2.8 RAPPORT CLIENT */}
              <div className="report-actions">
                 <button className="btn-report"><Download size={14} /> Dossier</button>
                 <button onClick={() => window.print()} className="btn-report"><Printer size={14} /> Imprimer</button>
              </div>
            </div>

          </div>

        </div>

      </div>

      <style>{`
        .detail-container { maxWidth: 1300px; margin: 0 auto; padding: 0 1rem 5rem; }
        
        .detail-header { display: flex; justify-content: space-between; alignItems: center; margin: 2rem 0 3rem; }
        .header-left { display: flex; alignItems: center; gap: 1.5rem; }
        .header-divider { height: 24px; width: 1px; background: #E2E8F0; }
        .client-name { fontSize: 1.8rem; fontWeight: 950; color: #1E293B; letterSpacing: -1px; margin: 0; }
        .client-id { color: #64748B; fontWeight: 700; fontSize: 0.95rem; margin: 0; }
        
        .btn-back { display: flex; alignItems: center; gap: 8px; background: none; border: none; color: #64748B; fontWeight: 800; fontSize: 0.9rem; cursor: pointer; }
        .btn-logout { display: flex; alignItems: center; gap: 8px; padding: 0.7rem 1.2rem; borderRadius: 12px; border: 1.5px solid #FEE2E2; background: #fff; color: #EF4444; fontWeight: 800; fontSize: 0.85rem; cursor: pointer; transition: 0.2s; }
        .btn-logout:hover { background: #FEE2E2; }

        .main-grid { display: grid; gridTemplateColumns: 1fr 380px; gap: 2.5rem; }
        .left-col { display: flex; flexDirection: column; gap: 2.5rem; }
        .right-col { position: relative; }

        .info-score-grid { display: grid; gridTemplateColumns: 1.2fr 1fr; gap: 2rem; }
        
        .glass-card { background: #fff; padding: 2rem; borderRadius: 32px; border: 1px solid #F1F5F9; boxShadow: 0 10px 40px rgba(0,0,0,0.02); }
        .card-title { display: flex; alignItems: center; gap: 12px; marginBottom: 1.5rem; }
        .title-icon { width: 40px; height: 40px; borderRadius: 10px; display: flex; alignItems: center; justifyContent: center; }
        .title-icon.green { background: #F0FDF4; color: #10B981; }
        .card-title h3 { fontSize: 0.9rem; fontWeight: 900; color: #1E293B; textTransform: uppercase; letterSpacing: 1px; margin: 0; }

        .info-list { display: flex; flexDirection: column; gap: 10px; }
        .info-list p { fontSize: 0.95rem; fontWeight: 700; color: #475569; margin: 0; }
        .info-list p span { color: #1E293B; }

        .score-card { background: #1E293B; padding: 2.2rem; borderRadius: 32px; color: #fff; boxShadow: 0 20px 50px rgba(0,0,0,0.1); }
        .score-label { fontSize: 0.8rem; fontWeight: 900; textTransform: uppercase; letterSpacing: 2px; opacity: 0.6; marginBottom: 1rem; margin: 0; }
        .score-value { display: flex; alignItems: baseline; gap: 8px; marginBottom: 1rem; }
        .big-num { fontSize: 3.5rem; fontWeight: 950; }
        .max-num { fontSize: 1.2rem; fontWeight: 700; opacity: 0.4; }
        
        .score-badge { padding: 8px 15px; borderRadius: 10px; background: rgba(255,255,255,0.1); display: inline-block; fontSize: 0.85rem; fontWeight: 800; }
        .score-badge.good { color: #4ADE80; }
        .score-badge.warning { color: #FBBF24; }

        .score-actions { display: grid; gridTemplateColumns: 1fr 1fr; gap: 10px; marginTop: 2rem; }
        .btn-score { padding: 0.8rem; borderRadius: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; fontWeight: 700; fontSize: 0.8rem; cursor: pointer; transition: 0.2s; }
        .btn-score:hover { background: rgba(255,255,255,0.1); }
        .btn-score.icon-btn { display: flex; alignItems: center; justifyContent: center; gap: 6px; }

        .section-title { fontSize: 0.9rem; fontWeight: 900; color: #1E293B; textTransform: uppercase; letterSpacing: 1.5px; margin: 0; }
        .accounts-grid { display: grid; gridTemplateColumns: 1fr 1fr; gap: 2rem; marginTop: 1.5rem; }
        .acc-box { padding: 1.8rem; borderRadius: 24px; border: 1.5px solid #F1F5F9; }
        .acc-header { display: flex; justifyContent: space-between; alignItems: center; marginBottom: 1.5rem; }
        .op-icon { width: 44px; height: 44px; borderRadius: 12px; display: flex; alignItems: center; justifyContent: center; color: #fff; }
        .op-icon.orange { background: #F37021; }
        .op-icon.mtn { background: #FFCC00; color: #1E293B; }
        .op-name { fontSize: 0.7rem; fontWeight: 900; color: #94A3B8; letterSpacing: 1px; }
        .bal-label { fontSize: 0.8rem; fontWeight: 800; color: #64748B; marginBottom: 4px; margin: 0; }
        .bal-value { fontSize: 1.8rem; fontWeight: 950; color: #1E293B; margin: 0; }
        .bal-value span { fontSize: 0.9rem; color: #CBD5E1; }
        .btn-acc { marginTop: 1.5rem; width: 100%; padding: 0.75rem; borderRadius: 12px; border: 1.5px solid #E2E8F0; background: #fff; color: #475569; fontWeight: 800; fontSize: 0.8rem; cursor: pointer; transition: 0.2s; }
        .btn-acc:hover { background: #F8FAFC; border-color: #CBD5E1; }

        .card-header { display: flex; justifyContent: space-between; alignItems: center; marginBottom: 2rem; }
        .header-actions { display: flex; gap: 10px; }
        .btn-tool { padding: 8px 12px; borderRadius: 10px; border: 1.5px solid #F1F5F9; background: #fff; display: flex; alignItems: center; gap: 6px; fontSize: 0.75rem; fontWeight: 800; color: #64748B; cursor: pointer; }

        .table-responsive { overflowX: auto; margin: 0 -1rem; padding: 0 1rem; }
        .kandjou-table { width: 100%; borderCollapse: collapse; }
        .kandjou-table th { padding: 1rem; fontSize: 0.7rem; fontWeight: 900; color: #94A3B8; textAlign: left; borderBottom: 1.5px solid #F1F5F9; }
        .kandjou-table td { padding: 1.2rem 1rem; borderBottom: 1px solid #F1F5F9; }
        .text-right { textAlign: right; }
        .tx-date { fontSize: 0.85rem; fontWeight: 600; color: #94A3B8; }
        .tx-desc { display: flex; alignItems: center; gap: 8px; fontSize: 0.9rem; fontWeight: 800; color: #1E293B; }
        .tx-dot { width: 6px; height: 6px; borderRadius: 50%; }
        .tx-dot.orange { background: #F37021; }
        .tx-dot.mtn { background: #FFCC00; }
        .tx-amt { textAlign: right; fontSize: 0.95rem; fontWeight: 900; }
        .tx-amt.plus { color: #10B981; }
        .tx-amt.minus { color: #1E293B; }

        .btn-view-all { marginTop: 1.5rem; width: 100%; background: none; border: none; color: #006233; fontWeight: 800; fontSize: 0.85rem; cursor: pointer; display: flex; alignItems: center; justifyContent: center; gap: 6px; }

        .btn-analytics { display: flex; alignItems: center; gap: 6px; background: #F0FDF4; border: none; padding: 8px 15px; borderRadius: 10px; color: #166534; fontWeight: 800; fontSize: 0.8rem; cursor: pointer; }
        .stats-grid { display: grid; gridTemplateColumns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1.5rem; }
        .stat-item { background: #F8FAFC; padding: 1.5rem; borderRadius: 20px; border: 1px solid #F1F5F9; display: flex; gap: 15px; alignItems: center; }
        .stat-icon { background: #fff; width: 40px; height: 40px; borderRadius: 12px; display: flex; alignItems: center; justifyContent: center; boxShadow: 0 4px 10px rgba(0,0,0,0.03); }
        .stat-label { fontSize: 0.65rem; fontWeight: 900; color: #94A3B8; textTransform: uppercase; margin: 0; }
        .stat-val { fontSize: 1rem; fontWeight: 950; color: #1E293B; margin: 0; }

        .decision-card { background: #fff; padding: 2.5rem; borderRadius: 32px; border: 1px solid #F1F5F9; boxShadow: 0 20px 60px rgba(0,0,0,0.04); position: sticky; top: 2rem; }
        .decision-header { display: flex; alignItems: center; gap: 12px; marginBottom: 2rem; }
        .header-icon { width: 40px; height: 40px; borderRadius: 10px; background: #006233; display: flex; alignItems: center; justifyContent: center; color: #fff; }
        .decision-header h3 { fontSize: 1.1rem; fontWeight: 950; color: #1E293B; margin: 0; }
        .decision-form { display: flex; flexDirection: column; gap: 1.5rem; }
        .form-group label { display: block; fontSize: 0.75rem; fontWeight: 850; color: #64748B; textTransform: uppercase; marginBottom: 10px; }
        .input-money { width: 100%; padding: 1.1rem; borderRadius: 16px; border: 2px solid #F1F5F9; outline: none; fontWeight: 800; fontSize: 1.2rem; color: #006233; transition: 0.2s; }
        .input-money:focus { border-color: #006233; background: #F0FDF4; }
        .select-kandjou { width: 100%; padding: 1rem; borderRadius: 16px; border: 2px solid #F1F5F9; outline: none; fontWeight: 700; cursor: pointer; }
        .textarea-kandjou { width: 100%; height: 100px; padding: 1rem; borderRadius: 16px; border: 2px solid #F1F5F9; outline: none; fontWeight: 600; resize: none; }
        
        .action-stack { marginTop: 1rem; display: flex; flexDirection: column; gap: 12px; }
        .btn-approve { width: 100%; padding: 1.2rem; borderRadius: 18px; border: none; background: #006233; color: #fff; fontWeight: 900; fontSize: 1rem; cursor: pointer; boxShadow: 0 10px 25px rgba(0,98,51,0.2); transition: 0.2s; }
        .btn-approve:hover { transform: translateY(-2px); boxShadow: 0 15px 30px rgba(0,98,51,0.3); }
        .action-row { display: grid; gridTemplateColumns: 1fr 1fr; gap: 10px; }
        .btn-reject { padding: 1rem; borderRadius: 16px; border: 2px solid #FEE2E2; background: #fff; color: #EF4444; fontWeight: 800; fontSize: 0.85rem; cursor: pointer; transition: 0.2s; }
        .btn-reject:hover { background: #FEE2E2; }
        .btn-pending { padding: 1rem; borderRadius: 16px; border: 2px solid #F1F5F9; background: #fff; color: #64748B; fontWeight: 800; fontSize: 0.85rem; cursor: pointer; transition: 0.2s; }
        .btn-pending:hover { background: #F8FAFC; border-color: #CBD5E1; }

        .report-actions { marginTop: 2.5rem; paddingTop: 2rem; borderTop: 1.5px solid #F1F5F9; display: grid; gridTemplateColumns: 1fr 1fr; gap: 12px; }
        .btn-report { padding: 0.8rem; borderRadius: 12px; background: #F8FAFC; border: none; color: #475569; fontWeight: 800; fontSize: 0.75rem; display: flex; alignItems: center; justifyContent: center; gap: 6px; cursor: pointer; transition: 0.2s; }
        .btn-report:hover { background: #F1F5F9; color: #1E293B; }

        .btn-secondary { background: #fff; color: #006233; border: 2px solid #F1F5F9; padding: 0.8rem; borderRadius: 12px; fontWeight: 800; fontSize: 0.85rem; cursor: pointer; transition: 0.2s; }
        .btn-secondary:hover { background: #F0FDF4; border-color: #006233; }
        .full-width { width: 100%; }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* 📱 RESPONSIVE RULES */
        @media (max-width: 1100px) {
          .main-grid { gridTemplateColumns: 1fr; }
          .decision-card { position: static; marginTop: 2rem; }
        }
        @media (max-width: 768px) {
          .detail-header { flexDirection: column; alignItems: flex-start; gap: 1.5rem; }
          .btn-logout { width: 100%; justifyContent: center; }
          .info-score-grid { gridTemplateColumns: 1fr; }
          .accounts-grid { gridTemplateColumns: 1fr; }
          .hide-mobile { display: none; }
          .client-name { fontSize: 1.4rem; }
          .big-num { fontSize: 2.5rem; }
        }
      `}</style>
    </MainLayout>
  );
}
