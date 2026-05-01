import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, 
  User, 
  ArrowRightLeft, 
  FileText, 
  PieChart, 
  ChevronRight, 
  Plus, 
  RefreshCcw,
  TrendingUp,
  TrendingDown,
  LayoutDashboard,
  Wallet,
  Zap,
  Target
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import useTransactionsSocket from "../hooks/useTransactionsSocket";
import axios from "axios";

// Import des nouveaux composants Chart.js Pro
import TransactionsChart from "../components/charts/TransactionsChart";
import ScoreChart from "../components/charts/ScoreChart";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState({ labels: [], income: [], expense: [], score: 0 });
  const [filter, setFilter] = useState("7d");
  const [activeOp, setActiveOp] = useState("ALL");

  const liveTransactions = useTransactionsSocket(user?.username);

  const fetchData = async () => {
    if (!user?.username || !token) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [resData, resTx, resAnalytic] = await Promise.all([
        axios.get(`${API}/m1/aggregate/${user.username}`, { headers }),
        axios.get(`${API}/m1/transactions/${user.username}`, { headers }),
        axios.get(`${API}/m1/analytics/${user.username}`, { headers })
      ]);
      setData(resData.data);
      setTransactions(resTx.data.transactions.slice(0, 8));
      setAnalytics(resAnalytic.data);
    } catch (err) {
      console.error("Dashboard error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, token]);

  if (loading) return (
    <div className="flex-center" style={{ minHeight: "60vh" }}>
      <RefreshCcw className="spin" size={40} color="#006233" />
      <p style={{ marginTop: "1rem", fontWeight: 700, color: "#64748B" }}>Synchronisation sécurisée...</p>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } } .flex-center { display: flex; flex-direction: column; align-items: center; justify-content: center; }`}</style>
    </div>
  );

  return (
    <div className="dashboard-container">
        
        {/* ── HEADER ── */}
        <header className="dashboard-header">
          <div className="welcome-box">
             <p className="welcome-text">Bonjour,</p>
             <h1 className="user-name">{user?.fullname || "Client"}</h1>
          </div>
          <div className="header-actions">
            <button className="icon-btn"><Bell size={20} /></button>
            <div className="user-avatar">
              <User size={20} />
            </div>
          </div>
        </header>

        <div className="dashboard-grid">
           
           {/* ── GAUCHE : SOLDES & ANALYTICS ── */}
           <div className="grid-left">
              {/* CARTE SOLDE */}
              <div className="main-balance-card">
                  <div className="card-top">
                    <p className="balance-label">Patrimoine total agrégé</p>
                    <div className="operator-badges">
                        <img src="/orange.png" alt="OM" />
                        <img src="/mtn.png" alt="MoMo" />
                    </div>
                  </div>
                  <div className="balance-amount" style={{ margin: "1rem 0" }}>
                    <h2 className="amount-val" style={{ fontSize: "2.4rem" }}>{(data?.total_balance || 0).toLocaleString()} <span className="currency">GNF</span></h2>
                  </div>
                  <div className="card-actions">
                    <button className="action-btn" onClick={() => navigate("/transfers")}><Plus size={20} /> Nouveau transfert</button>
                    <button className="action-btn secondary" onClick={fetchData}><RefreshCcw size={18} /> Actualiser</button>
                  </div>
                  <div className="bg-pattern"></div>
              </div>

              {/* ANALYTICS CHART (PRO) */}
              <div className="chart-card">
                  <div className="card-header">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <PieChart size={18} color="#006233" />
                      <h3>Flux financiers</h3>
                    </div>
                    <div className="chart-tabs">
                        <button className={filter === '7d' ? 'active' : ''} onClick={() => setFilter('7d')}>7j</button>
                        <button className={filter === '30d' ? 'active' : ''} onClick={() => setFilter('30d')}>30j</button>
                    </div>
                  </div>
                  <div className="chart-wrapper">
                    <TransactionsChart 
                      data={{ labels: analytics.labels, in: analytics.income, out: analytics.expense }} 
                      type="bar" 
                    />
                  </div>
              </div>
           </div>

           {/* ── DROITE : SCORE & TRANSACTIONS ── */}
           <div className="grid-right">
              
              {/* KANDJOU SCORE (PRO) */}
              <div className="score-card">
                <div className="card-header">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Target size={18} color="#006233" />
                    <h3>Score Kandjou</h3>
                  </div>
                </div>
                <div className="score-content">
                  <ScoreChart score={analytics.score || 78} />
                  <div className="score-info">
                    <p className="score-status">Excellent</p>
                    <p className="score-desc">Votre éligibilité au crédit est optimale.</p>
                  </div>
                </div>
              </div>

              {/* FLUX LIVE */}
              {liveTransactions.length > 0 && (
                <div className="live-transactions-section">
                  <div className="section-title">
                    <Zap size={16} color="#F59E0B" fill="#F59E0B" />
                    <span>En direct</span>
                  </div>
                  <div className="live-list">
                    {liveTransactions.slice(0, 2).map(tx => (
                      <div key={tx.tx_id} className={`live-item ${tx.status.toLowerCase()}`}>
                        <div className="live-left">
                          <img src={tx.operator === 'ORANGE' ? '/orange.png' : '/mtn.png'} alt="Op" />
                          <div>
                            <p className="live-title">Vers {tx.recipient}</p>
                            <p className="live-msg">{tx.message}</p>
                          </div>
                        </div>
                        <div className="live-right">
                          <p className="live-amt">{tx.amount.toLocaleString()} GNF</p>
                          <span className="live-status">{tx.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DERNIÈRES TRANSACTIONS */}
              <div className="recent-tx-card">
                  <div className="card-header">
                    <h3>Historique</h3>
                    <button className="view-all" onClick={() => navigate("/transactions")}>Tout voir</button>
                  </div>
                  <div className="tx-filters">
                    <button className={`filter-chip ${activeOp === 'ALL' ? 'active' : ''}`} onClick={() => setActiveOp('ALL')}>Tous</button>
                    <button className={`filter-chip ${activeOp === 'ORANGE' ? 'active' : ''}`} onClick={() => setActiveOp('ORANGE')}>Orange</button>
                    <button className={`filter-chip ${activeOp === 'MTN' ? 'active' : ''}`} onClick={() => setActiveOp('MTN')}>MTN</button>
                  </div>
                  <div className="tx-list">
                    {(() => {
                        const filtered = transactions.filter(tx => activeOp === 'ALL' || tx.op === activeOp);
                        if (filtered.length === 0) return <p className="empty-tx">Aucune transaction trouvée.</p>;
                        return filtered.map(tx => (
                          <div key={tx.id} className="tx-row">
                            <div className={`tx-icon ${tx.type.toLowerCase()}`}>
                                {tx.type === 'CREDIT' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            </div>
                            <div className="tx-details">
                                <p className="tx-title">{tx.desc}</p>
                                <p className="tx-meta">{new Date(tx.date).toLocaleDateString()}</p>
                            </div>
                            <p className={`tx-val ${tx.type.toLowerCase()}`}>
                                {tx.type === 'CREDIT' ? '+' : '-'} {tx.amount.toLocaleString()}
                            </p>
                          </div>
                        ));
                      })()}
                  </div>
              </div>

           </div>
        </div>

      <style>{`
        .dashboard-container { padding: 2rem; max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem; background: #F8FAFC; min-height: 100vh; }
        
        .dashboard-header { display: flex; justify-content: space-between; align-items: center; }
        .welcome-text { font-size: 0.9rem; font-weight: 700; color: #64748B; margin: 0; }
        .user-name { font-size: 1.8rem; font-weight: 950; color: #1E293B; letter-spacing: -1px; margin: 0; }
        .header-actions { display: flex; gap: 1rem; align-items: center; }
        .icon-btn { width: 44px; height: 44px; border-radius: 14px; border: 1.5px solid #E2E8F0; background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748B; }
        .user-avatar { width: 44px; height: 44px; border-radius: 14px; background: #006233; color: #fff; display: flex; align-items: center; justify-content: center; }

        .dashboard-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 2rem; }
        
        .grid-left, .grid-right { display: flex; flex-direction: column; gap: 2rem; }

        .main-balance-card { background: #006233; border-radius: 24px; padding: 1.8rem; color: #fff; position: relative; overflow: hidden; box-shadow: 0 15px 35px rgba(0,98,51,0.15); }
        .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .balance-label { font-size: 0.85rem; font-weight: 700; opacity: 0.8; margin: 0; }
        .operator-badges { display: flex; gap: 8px; }
        .operator-badges img { height: 20px; border-radius: 4px; }
        .amount-val { font-size: 3rem; font-weight: 950; margin: 0; letter-spacing: -2px; }
        .currency { font-size: 1.2rem; opacity: 0.6; font-weight: 700; }
        .card-actions { display: flex; gap: 12px; margin-top: 2.5rem; position: relative; z-index: 2; }
        .action-btn { flex: 1; padding: 1.1rem; border-radius: 18px; border: none; background: rgba(255,255,255,0.2); color: #fff; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: 0.2s; backdrop-filter: blur(10px); }
        .action-btn:hover { background: rgba(255,255,255,0.3); transform: translateY(-2px); }
        .action-btn.secondary { background: transparent; border: 1.5px solid rgba(255,255,255,0.3); }
        .bg-pattern { position: absolute; top: -50%; right: -20%; width: 300px; height: 300px; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); border-radius: 50%; }

        .chart-card, .score-card, .recent-tx-card { background: #fff; border-radius: 32px; padding: 2rem; border: 1.5px solid #E2E8F0; box-shadow: 0 10px 30px rgba(0,0,0,0.02); }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .card-header h3 { font-size: 0.85rem; font-weight: 900; color: #1E293B; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
        
        .chart-tabs { display: flex; background: #F1F5F9; padding: 4px; border-radius: 12px; }
        .chart-tabs button { padding: 6px 14px; border: none; background: none; font-size: 0.7rem; font-weight: 800; color: #94A3B8; cursor: pointer; border-radius: 10px; transition: 0.2s; }
        .chart-tabs button.active { background: #fff; color: #1E293B; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .chart-wrapper { height: 280px; }

        .score-content { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
        .score-info { text-align: center; }
        .score-status { font-size: 1.2rem; font-weight: 900; color: #10B981; margin: 0; }
        .score-desc { font-size: 0.75rem; color: #64748B; font-weight: 600; margin-top: 4px; }

        .section-title { display: flex; alignItems: center; gap: 8px; margin-bottom: 1rem; font-size: 0.75rem; font-weight: 900; text-transform: uppercase; color: #F59E0B; letter-spacing: 1px; }
        .live-list { display: flex; flex-direction: column; gap: 0.8rem; }
        .live-item { background: #fff; padding: 1rem; border-radius: 20px; border: 1.5px solid #F1F5F9; display: flex; justify-content: space-between; align-items: center; transition: 0.3s; }
        .live-left { display: flex; align-items: center; gap: 12px; }
        .live-left img { height: 24px; border-radius: 6px; }
        .live-title { font-size: 0.85rem; font-weight: 800; color: #1E293B; margin: 0; }
        .live-msg { font-size: 0.7rem; color: #94A3B8; font-weight: 600; margin: 0; }
        .live-right { text-align: right; }
        .live-amt { font-size: 0.9rem; font-weight: 900; margin: 0; }
        .live-status { font-size: 0.6rem; font-weight: 900; text-transform: uppercase; }
        .live-item.success { border-color: #10B98133; background: #F0FDF4; }
        .live-item.success .live-status { color: #10B981; }

        .view-all { font-size: 0.7rem; font-weight: 800; color: #006233; background: #E6F0EB; border: none; padding: 6px 14px; border-radius: 99px; cursor: pointer; }
        .tx-filters { display: flex; gap: 8px; margin-bottom: 1.5rem; }
        .filter-chip { padding: 6px 16px; border-radius: 99px; border: 1.5px solid #F1F5F9; background: #fff; font-size: 0.7rem; font-weight: 800; color: #64748B; cursor: pointer; transition: 0.2s; }
        .filter-chip.active { background: #1E293B; color: #fff; border-color: #1E293B; }
        
        .tx-list { display: flex; flex-direction: column; gap: 1.2rem; }
        .tx-row { display: flex; align-items: center; gap: 1rem; }
        .tx-icon { width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .tx-icon.credit { background: #DCFCE7; color: #10B981; }
        .tx-icon.debit { background: #FEE2E2; color: #EF4444; }
        .tx-details { flex: 1; }
        .tx-title { font-size: 0.85rem; font-weight: 800; color: #1E293B; margin: 0; }
        .tx-meta { font-size: 0.7rem; font-weight: 600; color: #94A3B8; margin: 0; }
        .tx-val { font-size: 0.9rem; font-weight: 900; }
        .tx-val.credit { color: #10B981; }
        .tx-val.debit { color: #1E293B; }
        .empty-tx { text-align: center; color: #94A3B8; padding: 2rem; font-weight: 600; }

        @media (max-width: 1024px) {
           .dashboard-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
