import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History,
  Users,
  Star,
  Settings2,
  ChevronRight,
  Loader2,
  Wallet,
  Smartphone
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import TransferModal from "../components/TransferModal";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function TransferPage() {
  const { user, token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balances, setBalances] = useState({ orange: 0, mtn: 0 });
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Balances
      const balRes = await axios.get(`${API}/m1/aggregate/${user.username}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBalances({
        orange: balRes.data.consolidation.orange_balance,
        mtn: balRes.data.consolidation.mtn_balance
      });

      // Fetch Recent Transactions
      const txRes = await axios.get(`${API}/m1/transactions/${user.username}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(txRes.data.transactions.slice(0, 8));

      // Fetch Favorites
      const favRes = await axios.get(`${API}/m1/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(favRes.data.favorites);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFavorite = async () => {
    const name = prompt("Nom du contact :");
    const num = prompt("Numéro (ex: 622112233) :");
    const op = prompt("Opérateur (ORANGE/MTN) :")?.toUpperCase();
    
    if (name && num && op) {
      try {
        await axios.post(`${API}/m1/favorites`, { name, msisdn: num, operator: op }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
      } catch (e) { alert("Erreur lors de l'ajout"); }
    }
  };

  const getOperatorLogo = (op) => {
    return window.location.origin + (op.toUpperCase() === "ORANGE" ? "/orange.png" : "/mtn.png");
  };

  return (
    <div className="transfer-page-container">
      {/* Header Section */}
      <div className="page-header">
        <div className="title-group">
          <h1>Transferts</h1>
          <p>Envoyez de l'argent instantanément vers Orange ou MTN.</p>
        </div>
        <button className="new-transfer-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Nouveau Transfert
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="transfer-grid">
        
        {/* Left Column: Balances & Favs */}
        <div className="left-col">
          <div className="balance-cards">
            <div className="card-mini orange">
              <div className="card-head">
                <img src={window.location.origin + "/orange.png"} alt="OM" />
                <span>Orange Money</span>
              </div>
              <div className="card-body">
                <h3>{balances.orange.toLocaleString()} <span>GNF</span></h3>
              </div>
            </div>
            <div className="card-mini mtn">
              <div className="card-head">
                <img src={window.location.origin + "/mtn.png"} alt="MoMo" />
                <span>MTN MoMo</span>
              </div>
              <div className="card-body">
                <h3>{balances.mtn.toLocaleString()} <span>GNF</span></h3>
              </div>
            </div>
          </div>

          <div className="fav-section">
            <div className="section-head">
              <h3>Favoris</h3>
              <button className="text-btn">Gérer</button>
            </div>
            <div className="fav-grid">
              {favorites.map((f, i) => (
                <div key={i} className="fav-item" onClick={() => setIsModalOpen(true)}>
                  <div className="avatar">
                    <Users size={20} />
                    <img src={getOperatorLogo(f.operator)} className="op-mini" alt="op" />
                  </div>
                  <span>{f.name}</span>
                </div>
              ))}
              <div className="fav-item add" onClick={handleAddFavorite}>
                <div className="avatar">
                  <Plus size={20} />
                </div>
                <span>Ajouter</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: History */}
        <div className="right-col">
          <div className="history-card">
            <div className="section-head">
              <h3>Historique des transferts</h3>
              <div className="search-box">
                <Search size={16} />
                <input type="text" placeholder="Rechercher..." />
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <Loader2 className="spin" size={32} color="#006233" />
                <p>Chargement des transactions...</p>
              </div>
            ) : (
              <div className="tx-list">
                {transactions.length > 0 ? transactions.map((tx, i) => (
                  <div key={i} className="tx-item">
                    <div className="tx-icon">
                      {tx.type === "CREDIT" ? <ArrowDownLeft color="#10B981" /> : <ArrowUpRight color="#EF4444" />}
                    </div>
                    <div className="tx-info">
                      <h4>{tx.desc}</h4>
                      <p>{new Date(tx.date).toLocaleDateString()} • {tx.op}</p>
                    </div>
                    <div className="tx-amount">
                      <span className={tx.type === "CREDIT" ? "positive" : "negative"}>
                        {tx.type === "CREDIT" ? "+" : "-"}{tx.amount.toLocaleString()} GNF
                      </span>
                      <p>{tx.status}</p>
                    </div>
                  </div>
                )) : (
                  <div className="empty-state">
                    <History size={40} />
                    <p>Aucun transfert récent.</p>
                  </div>
                )}
              </div>
            )}
            
            <button className="view-all-btn">
              Voir tout l'historique <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* The Transfer Modal */}
      <TransferModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        user={user}
        token={token}
        balances={balances}
        onRefresh={fetchData}
      />

      <style>{`
        .transfer-page-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
        
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
        .page-header h1 { font-size: 2.2rem; font-weight: 950; color: #1E293B; margin: 0; letter-spacing: -1px; }
        .page-header p { color: #64748B; font-weight: 600; margin-top: 5px; }
        
        .new-transfer-btn { background: #006233; color: #fff; border: none; padding: 0.8rem 1.5rem; border-radius: 14px; font-weight: 800; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.3s; box-shadow: 0 10px 20px rgba(0,98,51,0.2); }
        .new-transfer-btn:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(0,98,51,0.3); }

        .transfer-grid { display: grid; grid-template-columns: 350px 1fr; gap: 2rem; }
        
        .balance-cards { display: grid; grid-template-columns: 1fr; gap: 1rem; margin-bottom: 2rem; }
        .card-mini { padding: 1.5rem; border-radius: 24px; border: 1.5px solid #F1F5F9; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
        .card-mini.orange { border-left: 6px solid #F37021; }
        .card-mini.mtn { border-left: 6px solid #FFCC00; }
        .card-head { display: flex; align-items: center; gap: 10px; margin-bottom: 1rem; }
        .card-head img { height: 24px; border-radius: 6px; }
        .card-head span { font-size: 0.8rem; font-weight: 800; color: #64748B; }
        .card-body h3 { font-size: 1.5rem; font-weight: 950; color: #1E293B; margin: 0; }
        .card-body h3 span { font-size: 0.8rem; opacity: 0.4; margin-left: 5px; }

        .fav-section { background: #fff; border-radius: 24px; padding: 1.5rem; border: 1.5px solid #F1F5F9; }
        .section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .section-head h3 { font-size: 1rem; font-weight: 900; color: #1E293B; margin: 0; }
        .text-btn { background: none; border: none; color: #006233; font-weight: 800; font-size: 0.85rem; cursor: pointer; }
        
        .fav-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
        .fav-item { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; }
        .fav-item:hover { transform: translateY(-5px); }
        .avatar { width: 50px; height: 50px; background: #F1F5F9; border-radius: 18px; display: flex; align-items: center; justify-content: center; position: relative; color: #64748B; }
        .op-mini { position: absolute; bottom: -4px; right: -4px; width: 20px; height: 20px; border-radius: 5px; border: 2px solid #fff; }
        .fav-item span { font-size: 0.75rem; font-weight: 800; color: #1E293B; }
        .fav-item.add .avatar { border: 2.5px dashed #CBD5E1; background: none; color: #94A3B8; }

        .history-card { background: #fff; border-radius: 32px; padding: 2rem; border: 1.5px solid #F1F5F9; box-shadow: 0 10px 30px rgba(0,0,0,0.02); height: 100%; display: flex; flex-direction: column; }
        .search-box { display: flex; align-items: center; gap: 10px; background: #F8FAFC; padding: 0.6rem 1rem; border-radius: 12px; border: 1.5px solid #F1F5F9; }
        .search-box input { border: none; background: none; outline: none; font-size: 0.85rem; font-weight: 600; color: #1E293B; width: 150px; }
        
        .tx-list { flex: 1; margin-top: 1rem; }
        .tx-item { display: flex; align-items: center; gap: 1rem; padding: 1.2rem; border-bottom: 1.5px solid #F8FAFC; transition: 0.2s; cursor: pointer; border-radius: 16px; }
        .tx-item:hover { background: #F8FAFC; }
        .tx-icon { width: 44px; height: 44px; background: #F8FAFC; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
        .tx-info { flex: 1; }
        .tx-info h4 { font-size: 0.95rem; font-weight: 800; color: #1E293B; margin: 0 0 4px; }
        .tx-info p { font-size: 0.75rem; color: #94A3B8; font-weight: 600; margin: 0; }
        .tx-amount { text-align: right; }
        .tx-amount span { display: block; font-size: 1rem; font-weight: 900; }
        .tx-amount .positive { color: #10B981; }
        .tx-amount .negative { color: #1E293B; }
        .tx-amount p { font-size: 0.65rem; font-weight: 900; color: #94A3B8; text-transform: uppercase; margin-top: 2px; }

        .view-all-btn { width: 100%; margin-top: 2rem; padding: 1rem; border-radius: 16px; border: 1.5px solid #F1F5F9; background: #fff; color: #64748B; font-weight: 800; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; }
        .view-all-btn:hover { background: #F8FAFC; color: #1E293B; border-color: #E2E8F0; }

        .loading-state, .empty-state { padding: 4rem 0; text-align: center; color: #94A3B8; }
        .loading-state p, .empty-state p { margin-top: 1rem; font-weight: 600; font-size: 0.9rem; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        @media (max-width: 900px) {
          .transfer-grid { grid-template-columns: 1fr; }
          .left-col { order: 2; }
          .right-col { order: 1; }
        }
      `}</style>
    </div>
  );
}
