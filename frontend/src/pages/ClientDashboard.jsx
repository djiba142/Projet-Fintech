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
  Target,
  ArrowDownToLine,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import useTransactionsSocket from "../hooks/useTransactionsSocket";
import axios from "axios";
import logoKandjou from "../assets/logo_kandjou.png";
import WithdrawModal from "../components/WithdrawModal";

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
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

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

  const simulateDeposit = async () => {
    try {
      const op = Math.random() > 0.5 ? "ORANGE" : "MTN";
      const msisdn = op === "ORANGE" ? data.msisdn_orange : data.msisdn_mtn;
      if (!msisdn) return alert("Aucun compte lié pour cet opérateur");

      await axios.post(`${API}/m1/deposit`, {
        operator: op,
        msisdn: msisdn,
        amount: 500000,
        agent_id: "AGENT_DEMO",
        client_id: user.username
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg(`Félicitations ! Un dépôt de 500 000 GNF a été crédité sur votre compte ${op}.`);
      setTimeout(() => setSuccessMsg(""), 5000);
      // Le WebSocket déclenchera le refresh automatiquement grâce au useEffect
    } catch (err) {
      alert("Erreur simulation dépôt");
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, token]);

  // Écouteur pour rafraîchissement automatique des soldes au succès d'une transaction live
  useEffect(() => {
    const successCount = liveTransactions.filter(tx => tx.status === "SUCCESS").length;
    if (successCount > 0) {
      console.log(`🔄 ${successCount} transaction(s) réussie(s) détectée(s), rafraîchissement...`);
      fetchData();
    }
  }, [liveTransactions.length]); // Déclenché uniquement quand le nombre de tx change

  if (loading) return (
    <div className="flex-center" style={{ minHeight: "40vh" }}>
      <RefreshCcw className="spin" size={40} color="#006233" />
      <p style={{ marginTop: "1rem", fontWeight: 700, color: "#64748B" }}>Synchronisation sécurisée...</p>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } } .flex-center { display: flex; flex-direction: column; align-items: center; justify-content: center; }`}</style>
    </div>
  );

  return (
    <div className="dashboard-content">
        
        {/* Titre de Section Dynamique */}
        <div style={{ marginBottom: "2rem" }}>
          <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#64748B", margin: 0 }}>Ravi de vous revoir,</p>
          <h1 style={{ fontSize: "2rem", fontWeight: 950, color: "#1E293B", letterSpacing: "-1px", margin: 0 }}>
            {user?.fullname || "Client"}
          </h1>
        </div>

        {successMsg && (
          <div style={{ background: "#DCFCE7", border: "1.5px solid #10B981", borderRadius: 20, padding: "1.2rem", marginBottom: "2rem", display: "flex", alignItems: "center", gap: 12, animation: "slideIn 0.3s ease-out" }}>
             <CheckCircle2 color="#10B981" size={24} />
             <p style={{ margin: 0, color: "#065F46", fontWeight: 800, fontSize: "0.9rem" }}>{successMsg}</p>
             <style>{`@keyframes slideIn { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
          </div>
        )}

        <div className="dashboard-grid">
           
           {/* ── GAUCHE : SOLDES & ANALYTICS ── */}
           <div className="grid-left">
              {/* CARTE SOLDE */}
              <div className="main-balance-card">
                  <div className="card-top">
                    <p className="balance-label">Solde Total Consolidé</p>
                    <div className="operator-badges">
                        <img src={window.location.origin + "/orange.png"} alt="OM" />
                        <img src={window.location.origin + "/mtn.png"} alt="MoMo" />
                    </div>
                  </div>
                  <div className="balance-amount" style={{ margin: "1rem 0" }}>
                    <h2 className="amount-val" style={{ fontSize: "2.8rem" }}>{(data?.consolidation?.total_balance || 0).toLocaleString()} <span className="currency">GNF</span></h2>
                  </div>
                  <div className="card-actions">
                    <button className="action-btn" onClick={() => navigate("/transfers")}><Plus size={20} /> Envoyer</button>
                    <button className="action-btn" onClick={() => setShowWithdraw(true)} style={{ background: "#F59E0B" }}><ArrowDownToLine size={20} /> Retirer</button>
                    <button className="action-btn secondary" onClick={simulateDeposit} title="Simuler un dépôt de 500k pour test"><RefreshCcw size={18} /> Dépôt Simu</button>
                  </div>
                  <div className="bg-pattern"></div>
              </div>

              {/* ANALYTICS CHART */}
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

           <WithdrawModal 
            isOpen={showWithdraw} 
            onClose={() => setShowWithdraw(false)}
            user={user}
            token={token}
            balances={{
              orange: data?.consolidation?.orange_balance || 0,
              mtn: data?.consolidation?.mtn_balance || 0
            }}
            onRefresh={fetchData}
           />

           {/* ── DROITE : SCORE & TRANSACTIONS ── */}
           <div className="grid-right">
              
              {/* SCORE CARTE */}
              <div className="score-card">
                <div className="card-header">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Target size={18} color="#006233" />
                    <h3>Score Kandjou</h3>
                  </div>
                </div>
                <div className="score-content">
                  <ScoreChart score={analytics.score || 0} />
                  <div className="score-info">
                    <p className="score-status" style={{ color: (analytics.score || 0) > 70 ? "#10B981" : "#F59E0B" }}>
                      {(analytics.score || 0) > 70 ? "Excellent" : (analytics.score || 0) > 40 ? "Moyen" : "Faible"}
                    </p>
                    <p className="score-desc">Calculé sur la base de vos transactions Orange et MTN.</p>
                  </div>
                </div>
              </div>

              {/* FLUX LIVE */}
                <div className="live-transactions-section">
                  <div className="section-title">
                    <Zap size={16} color="#F59E0B" fill="#F59E0B" />
                    <span>En direct</span>
                  </div>
                  <div className="live-list">
                    {liveTransactions.slice(0, 3).map(tx => (
                      <div key={tx.tx_id || Math.random()} className={`live-item ${tx.status.toLowerCase()}`}>
                        <div className="live-left">
                          <img src={tx.operator === 'ORANGE' ? window.location.origin + '/orange.png' : window.location.origin + '/mtn.png'} alt="Op" />
                          <div className="live-text">
                            <p className="live-title">{tx.type === 'WITHDRAW' ? 'Retrait' : 'Vers'} {tx.recipient}</p>
                            <p className="live-msg">{tx.message}</p>
                          </div>
                        </div>
                        <div className="live-right">
                          <p className="live-amt">{tx.amount.toLocaleString()} GNF</p>
                          <div className="status-pill">
                             {tx.status === 'PROCESSING' && <Loader2 className="spin" size={10} />}
                             <span>{tx.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

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
                        if (filtered.length === 0) return <p className="empty-tx">Aucune transaction.</p>;
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
        .dashboard-content { width: 100%; display: flex; flex-direction: column; gap: 1rem; }
        .dashboard-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 2rem; }
        .grid-left, .grid-right { display: flex; flex-direction: column; gap: 2rem; }
        .main-balance-card { background: #006233; border-radius: 28px; padding: 2rem; color: #fff; position: relative; overflow: hidden; box-shadow: 0 20px 40px rgba(0,98,51,0.2); }
        .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .balance-label { font-size: 0.9rem; font-weight: 700; opacity: 0.8; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
        .operator-badges { display: flex; gap: 10px; }
        .operator-badges img { height: 24px; border-radius: 6px; border: 1.5px solid rgba(255,255,255,0.2); }
        .amount-val { font-size: 3rem; font-weight: 950; margin: 0; letter-spacing: -2px; }
        .currency { font-size: 1.4rem; opacity: 0.6; font-weight: 700; margin-left: 8px; }
        .card-actions { display: flex; gap: 12px; margin-top: 2.5rem; position: relative; z-index: 2; }
        .action-btn { flex: 1; padding: 1.1rem; border-radius: 20px; border: none; background: rgba(255,255,255,0.2); color: #fff; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: 0.2s; backdrop-filter: blur(10px); }
        .action-btn:hover { background: rgba(255,255,255,0.3); transform: translateY(-3px); }
        .action-btn.secondary { background: transparent; border: 1.5px solid rgba(255,255,255,0.3); }
        .bg-pattern { position: absolute; top: -40%; right: -10%; width: 350px; height: 350px; background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%); border-radius: 50%; }
        .chart-card, .score-card, .recent-tx-card { background: #fff; border-radius: 32px; padding: 2rem; border: 1.5px solid #F1F5F9; box-shadow: 0 10px 30px rgba(0,0,0,0.02); }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.8rem; }
        .card-header h3 { font-size: 0.85rem; font-weight: 900; color: #475569; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
        .chart-tabs { display: flex; background: #F8FAFC; padding: 4px; border-radius: 14px; border: 1px solid #F1F5F9; }
        .chart-tabs button { padding: 6px 16px; border: none; background: none; font-size: 0.75rem; font-weight: 800; color: #94A3B8; cursor: pointer; border-radius: 10px; transition: 0.2s; }
        .chart-tabs button.active { background: #fff; color: #006233; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .chart-wrapper { height: 280px; }
        .score-content { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
        .score-info { text-align: center; }
        .score-status { font-size: 1.3rem; font-weight: 900; margin: 0; }
        .score-desc { font-size: 0.8rem; color: #94A3B8; font-weight: 600; margin-top: 6px; line-height: 1.4; }
        .section-title { display: flex; alignItems: center; gap: 8px; margin-bottom: 1.2rem; font-size: 0.75rem; font-weight: 900; text-transform: uppercase; color: #F59E0B; letter-spacing: 1px; }
        .live-list { display: flex; flex-direction: column; gap: 1rem; }
        .live-item { background: #fff; padding: 1.2rem; border-radius: 24px; border: 1.5px solid #F1F5F9; display: flex; justify-content: space-between; align-items: center; transition: 0.3s; }
        .live-left { display: flex; align-items: center; gap: 14px; }
        .live-left img { height: 28px; border-radius: 8px; }
        .live-title { font-size: 0.9rem; font-weight: 800; color: #1E293B; margin: 0; }
        .live-msg { font-size: 0.75rem; color: #94A3B8; font-weight: 600; margin: 0; }
        .live-right { text-align: right; }
        .live-amt { font-size: 1rem; font-weight: 900; margin: 0; }
        .live-status { font-size: 0.65rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
        .live-item.success { border-color: #10B98144; background: #F0FDF4; }
        .live-item.success .live-status { color: #10B981; }
        .view-all { font-size: 0.75rem; font-weight: 800; color: #006233; background: #ECFDF5; border: none; padding: 8px 16px; border-radius: 12px; cursor: pointer; transition: 0.2s; }
        .view-all:hover { background: #D1FAE5; }
        .tx-filters { display: flex; gap: 8px; margin-bottom: 2rem; }
        .filter-chip { padding: 8px 18px; border-radius: 12px; border: 1.5px solid #F1F5F9; background: #fff; font-size: 0.75rem; font-weight: 800; color: #64748B; cursor: pointer; transition: 0.2s; }
        .filter-chip.active { background: #006233; color: #fff; border-color: #006233; box-shadow: 0 4px 12px rgba(0,98,51,0.2); }
        .tx-list { display: flex; flex-direction: column; gap: 1.4rem; }
        .tx-row { display: flex; align-items: center; gap: 1.2rem; }
        .tx-icon { width: 42px; height: 42px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
        .tx-icon.credit { background: #DCFCE7; color: #10B981; }
        .tx-icon.debit { background: #FEE2E2; color: #EF4444; }
        .tx-details { flex: 1; }
        .tx-title { font-size: 0.9rem; font-weight: 800; color: #1E293B; margin: 0; }
        .tx-meta { font-size: 0.75rem; font-weight: 600; color: #94A3B8; margin: 0; }
        .tx-val { font-size: 1rem; font-weight: 900; }
        .tx-val.credit { color: #10B981; }
        .tx-val.debit { color: #1E293B; }
        .empty-tx { text-align: center; color: #94A3B8; padding: 2rem; font-weight: 600; font-size: 0.9rem; }
        @media (max-width: 1024px) { .dashboard-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
