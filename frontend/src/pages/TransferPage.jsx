import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  CheckCircle, 
  Smartphone, 
  Send, 
  Wallet, 
  Loader2, 
  AlertCircle, 
  ShieldCheck, 
  Lock,
  ArrowRightLeft,
  Info,
  ChevronRight
} from "lucide-react";
import axios from "axios";

import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function TransferPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  // 1: Form, 2: Confirmation, 3: Security PIN, 4: Success
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balances, setBalances] = useState({ orange: 0, mtn: 0 });

  // Form State
  const [operator, setOperator] = useState("ORANGE");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);
  const [liveStatus, setLiveStatus] = useState(null);


  useEffect(() => {
    fetchBalances();
  }, []);

  const fetchBalances = async () => {
    setBalanceLoading(true);
    try {
      const token = localStorage.getItem("kandjou_token");
      const res = await axios.get(`${API}/m1/aggregate/${user.username}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBalances({
        orange: res.data.consolidation.orange_balance,
        mtn: res.data.consolidation.mtn_balance
      });
    } catch (err) {
      console.error("Erreur solde:", err);
    } finally {
      setBalanceLoading(false);
    }
  };

  const validateForm = () => {
    // Regex pour numéros Guinéens (62x, 66x, 61x, 65x)
    const phoneRegex = /^(\+224|00224|224)?(611|621|622|623|624|625|626|627|628|629|661|662|664|666|669|654|655|656|657)[0-9]{6}$/;
    
    if (!phoneRegex.test(recipient.replace(/\s/g, ""))) {
      setError("Numéro de téléphone invalide (Format Guinéen requis)");
      return false;
    }
    const val = parseInt(amount);
    if (!val || val < 1000) {
      setError("Le montant minimum est de 1 000 GNF");
      return false;
    }
    const sourceBalance = operator === "ORANGE" ? balances.orange : balances.mtn;
    if (val > sourceBalance) {
      setError("Solde insuffisant sur le compte " + (operator === 'ORANGE' ? 'Orange Money' : 'MTN MoMo'));
      return false;
    }
    setError("");
    return true;
  };

  const handleNextToConfirm = () => {
    if (validateForm()) setStep(2);
  };

  const handleTransfer = async () => {
    if (pin.length < 4) {
      setError("Veuillez saisir votre code secret à 4 chiffres");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("kandjou_token");
      const res = await axios.post(`${API}/m1/transfer/v2`, {
        operator,
        to_msisdn: recipient.replace(/\s/g, ""),
        amount: parseInt(amount),
        note: note || "Transfert Kandjou"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const txId = res.data.tx_id;
      setStep(5); // Passer au suivi temps réel
      connectWebSocket(txId);
    } catch (err) {
      setError(err.response?.data?.detail || "Échec du transfert. Vérifiez votre code secret.");
      setLoading(false);
    }
  };

  const connectWebSocket = (txId) => {
    const wsUrl = API.replace("http", "ws") + "/m1/ws/transfer/" + txId;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLiveStatus(data);
      if (data.status === "SUCCESS") {
        setSuccessData({ ...data.details, transaction_id: txId });
        setTimeout(() => setStep(4), 1500);
      } else if (data.status === "FAILED") {
        setError(data.message);
        setStep(3);
        setLoading(false);
      }
    };

    ws.onclose = () => console.log("WS Closed");
    ws.onerror = (err) => console.error("WS Error", err);
  };

  const isInterop = (operator === "ORANGE" && (recipient.startsWith("66") || recipient.startsWith("65"))) || 
                    (operator === "MTN" && (recipient.startsWith("62") || recipient.startsWith("61")));

  return (
    <div className="transfer-page-wrapper">
        
        {/* ── HEADER & PROGRESS ── */}
        <header className="page-header">
           {step < 4 && (
             <button className="back-btn" onClick={() => step > 1 ? setStep(step - 1) : navigate("/dashboard")}>
               <ArrowLeft size={20} />
             </button>
           )}
           <div className="header-text">
              <h1>{step === 4 ? "Transfert Réussi" : "Envoyer de l'argent"}</h1>
              <p>{step === 4 ? "Fonds envoyés instantanément." : "Interopérabilité Orange & MTN incluse."}</p>
           </div>
        </header>

        {error && (
          <div className="error-alert">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* STEP 1: FORMULAIRE */}
        {step === 1 && (
          <div className="step-container">
             {/* Source Account Choice */}
             <div className="source-selector">
                <p className="section-label">Sélectionnez le compte source</p>
                <div className="op-grid">
                   <div className={`op-choice orange ${operator === 'ORANGE' ? 'active' : ''}`} onClick={() => setOperator("ORANGE")}>
                      <div className="op-check">{operator === 'ORANGE' && <CheckCircle size={14} />}</div>
                      <img src="/orange.png" alt="Orange" className="op-img" />
                      <div className="op-info">
                         <span className="op-title">Orange Money</span>
                         <span className="op-bal">{balances.orange.toLocaleString()} GNF</span>
                      </div>
                   </div>
                   <div className={`op-choice mtn ${operator === 'MTN' ? 'active' : ''}`} onClick={() => setOperator("MTN")}>
                      <div className="op-check">{operator === 'MTN' && <CheckCircle size={14} />}</div>
                      <img src="/mtn.png" alt="MTN" className="op-img" />
                      <div className="op-info">
                         <span className="op-title">MTN MoMo</span>
                         <span className="op-bal">{balances.mtn.toLocaleString()} GNF</span>
                      </div>
                   </div>
                </div>
             </div>

             <div className="form-card">
                <div className="input-group">
                   <label>Numéro du destinataire</label>
                   <div className="input-wrapper">
                      <Smartphone size={20} className="input-icon" />
                      <input 
                        type="text" 
                        placeholder="Ex: 622 12 34 56" 
                        value={recipient} 
                        onChange={e => setRecipient(e.target.value)}
                      />
                   </div>
                   {isInterop && (
                     <div className="interop-badge">
                        <ArrowRightLeft size={12} /> Interopérabilité active vers {operator === 'ORANGE' ? 'MTN' : 'Orange'}
                     </div>
                   )}
                </div>

                <div className="input-group">
                   <label>Montant (GNF)</label>
                   <div className="input-wrapper amount">
                      <Wallet size={20} className="input-icon" />
                      <input 
                        type="number" 
                        placeholder="0" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)}
                      />
                      <span className="currency">GNF</span>
                   </div>
                </div>

                <div className="input-group">
                   <label>Motif de l'envoi (Optionnel)</label>
                   <input 
                     type="text" 
                     className="plain-input"
                     placeholder="Ex: Cadeau, Loyer..." 
                     value={note} 
                     onChange={e => setNote(e.target.value)} 
                   />
                </div>
             </div>

             <button className="main-cta" onClick={handleNextToConfirm}>
                Continuer <ChevronRight size={18} />
             </button>
          </div>
        )}

        {/* STEP 2: CONFIRMATION */}
        {step === 2 && (
          <div className="step-container">
             <div className="confirm-card">
                <div className="confirm-header">
                   <div className="amount-display">
                      <p>Vous envoyez</p>
                      <h2>{parseInt(amount).toLocaleString()} <span>GNF</span></h2>
                   </div>
                </div>

                <div className="confirm-details">
                   <div className="detail-row">
                      <span>Destinataire</span>
                      <strong>{recipient}</strong>
                   </div>
                   <div className="detail-row">
                      <span>Réseau destinataire</span>
                      <strong className="operator-tag">{isInterop ? (operator === 'ORANGE' ? 'MTN MoMo' : 'Orange Money') : (operator === 'ORANGE' ? 'Orange Money' : 'MTN MoMo')}</strong>
                   </div>
                   <div className="detail-row">
                      <span>Frais de service</span>
                      <strong className="free">0 GNF (Gratuit)</strong>
                   </div>
                   <div className="detail-row">
                      <span>Source</span>
                      <strong>{operator === 'ORANGE' ? 'Orange Money' : 'MTN MoMo'}</strong>
                   </div>
                </div>

                <div className="interop-info-box">
                   <Info size={16} />
                   <p>Ce transfert utilise la passerelle Kandjou pour assurer l'interopérabilité entre opérateurs.</p>
                </div>
             </div>

             <button className="main-cta secure" onClick={() => setStep(3)}>
                <ShieldCheck size={18} /> Confirmer avec mon code secret
             </button>
          </div>
        )}

        {/* STEP 3: SECURITY PIN */}
        {step === 3 && (
          <div className="step-container">
             <div className="pin-card">
                <div className="lock-icon"><Lock size={32} /></div>
                <h3>Saisissez votre code PIN</h3>
                <p>Pour valider le transfert de {parseInt(amount).toLocaleString()} GNF</p>
                
                <div className="pin-input-wrapper">
                   <input 
                     type="password" 
                     maxLength="4" 
                     placeholder="••••" 
                     value={pin} 
                     onChange={e => setPin(e.target.value)}
                     autoFocus
                   />
                </div>
             </div>

             <button className="main-cta" onClick={handleTransfer} disabled={loading}>
                {loading ? <Loader2 className="spin" size={20} /> : "Valider définitivement"}
             </button>
          </div>
        )}
         {/* STEP 5: LIVE STATUS (WEBSOCKET) */}
         {step === 5 && (
           <div className="step-container">
              <div className="live-status-card">
                 <div className="live-header">
                    <div className="pulsating-dot"></div>
                    <h3>Suivi en temps réel</h3>
                 </div>
                 
                 <div className="progress-container">
                    <div className="progress-bar-bg">
                       <div className="progress-bar-fill" style={{ width: `${liveStatus?.progress || 10}%` }}></div>
                    </div>
                    <p className="progress-text">{liveStatus?.progress || 10}% complété</p>
                 </div>

                 <div className="status-timeline">
                    <div className={`timeline-item ${liveStatus?.progress >= 10 ? 'done' : ''}`}>
                       <div className="dot"></div>
                       <span>Initialisation</span>
                    </div>
                    <div className={`timeline-item ${liveStatus?.progress >= 30 ? 'done' : ''}`}>
                       <div className="dot"></div>
                       <span>Validation sécurité</span>
                    </div>
                    <div className={`timeline-item ${liveStatus?.progress >= 60 ? 'done' : ''}`}>
                       <div className="dot"></div>
                       <span>Traitement opérateur</span>
                    </div>
                    <div className={`timeline-item ${liveStatus?.progress >= 100 ? 'done' : ''}`}>
                       <div className="dot"></div>
                       <span>Finalisation</span>
                    </div>
                 </div>

                 <p className="live-message">{liveStatus?.message || "Connexion établie..."}</p>
              </div>
           </div>
         )}

        {/* STEP 4: SUCCESS */}
        {step === 4 && (
          <div className="step-container success-view">
             <div className="success-anim">
                <CheckCircle size={80} color="#10B981" />
             </div>
             <h2>Transfert Réussi !</h2>
             <p className="success-msg">Le montant de <strong>{parseInt(amount).toLocaleString()} GNF</strong> a été envoyé à <strong>{recipient}</strong>.</p>
             
             <div className="receipt-card">
                <div className="receipt-line"><span>ID Transaction</span> <strong>{successData?.transaction_id}</strong></div>
                <div className="receipt-line"><span>Statut</span> <strong className="status-success">TERMINÉ</strong></div>
                {successData?.interoperability && (
                  <div className="receipt-line interop"><span>Mode</span> <strong>INTEROPÉRABILITÉ ACTIVE</strong></div>
                )}
             </div>

             <div className="success-actions">
                <button className="btn-primary" onClick={() => navigate("/transactions")}>Voir mon historique</button>
                <button className="btn-secondary" onClick={() => navigate("/dashboard")}>Retour à l'accueil</button>
             </div>
          </div>
        )}

      <style>{`
        .transfer-page-wrapper { maxWidth: 550px; margin: 0 auto; padding-bottom: 4rem; }
        .page-header { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2.5rem; }
        .back-btn { width: 44px; height: 44px; border-radius: 14px; border: 1.5px solid #E2E8F0; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #64748B; }
        .header-text h1 { font-size: 1.8rem; font-weight: 950; color: #1E293B; margin: 0; letter-spacing: -1px; }
        .header-text p { font-size: 0.9rem; color: #64748B; font-weight: 600; margin: 0; }

        .error-alert { background: #FEF2F2; color: #991B1B; padding: 1rem; border-radius: 16px; margin-bottom: 2rem; display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 0.85rem; border: 1.5px solid #FEE2E2; }
        
        .section-label { font-size: 0.7rem; font-weight: 900; color: #94A3B8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 1rem; }
        .op-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }
        .op-choice { background: #fff; border-radius: 20px; padding: 1.2rem; cursor: pointer; border: 2.5px solid transparent; transition: 0.2s; position: relative; }
        .op-choice.orange.active { border-color: #F37021; background: #FFF7ED; }
        .op-choice.mtn.active { border-color: #FFCC00; background: #FEFCE8; }
        .op-check { position: absolute; top: 12px; right: 12px; color: #10B981; }
        .op-img { height: 28px; margin-bottom: 12px; border-radius: 6px; }
        .op-title { display: block; font-size: 0.75rem; font-weight: 800; color: #64748B; margin-bottom: 4px; }
        .op-bal { display: block; font-size: 1.1rem; font-weight: 950; color: #1E293B; }

        .form-card, .confirm-card, .pin-card { background: #fff; border-radius: 32px; padding: 2rem; border: 1.5px solid #F1F5F9; box-shadow: 0 10px 30px rgba(0,0,0,0.02); margin-bottom: 2rem; }
        .input-group { margin-bottom: 1.5rem; }
        .input-group:last-child { margin-bottom: 0; }
        .input-group label { display: block; font-size: 0.75rem; font-weight: 800; color: #64748B; margin-bottom: 8px; }
        .input-wrapper { position: relative; }
        .input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94A3B8; }
        .input-wrapper input { width: 100%; padding: 1rem 1rem 1rem 3.2rem; border-radius: 16px; border: 2.5px solid #F1F5F9; font-size: 1rem; font-weight: 700; transition: 0.2s; outline: none; background: #F8FAFC; }
        .input-wrapper input:focus { border-color: #006233; background: #fff; }
        .input-wrapper.amount input { font-size: 1.8rem; font-weight: 950; letter-spacing: -1px; }
        .currency { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-weight: 900; color: #94A3B8; font-size: 0.8rem; }
        .plain-input { width: 100%; padding: 1rem; border-radius: 16px; border: 2.5px solid #F1F5F9; font-size: 1rem; font-weight: 700; outline: none; background: #F8FAFC; }
        .interop-badge { display: inline-flex; align-items: center; gap: 6px; background: #EEF2FF; color: #4338CA; padding: 4px 10px; border-radius: 6px; font-size: 0.65rem; font-weight: 900; margin-top: 8px; text-transform: uppercase; }

        .main-cta { width: 100%; padding: 1.2rem; border-radius: 20px; border: none; background: #006233; color: #fff; font-size: 1.1rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s; box-shadow: 0 10px 25px rgba(0,98,51,0.2); }
        .main-cta:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(0,98,51,0.3); }
        .main-cta.secure { background: #1E293B; box-shadow: 0 10px 25px rgba(30,41,59,0.2); }

        .confirm-header { text-align: center; margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 1.5px solid #F1F5F9; }
        .amount-display p { font-size: 0.85rem; font-weight: 700; color: #64748B; margin-bottom: 4px; }
        .amount-display h2 { font-size: 3rem; font-weight: 950; color: #1E293B; margin: 0; letter-spacing: -2px; }
        .amount-display h2 span { font-size: 1rem; opacity: 0.5; }

        .detail-row { display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 0.95rem; }
        .detail-row span { color: #64748B; font-weight: 600; }
        .detail-row strong { color: #1E293B; font-weight: 800; }
        .operator-tag { color: #4338CA !important; }
        .free { color: #10B981 !important; }

        .interop-info-box { background: #F8FAFC; border-radius: 16px; padding: 1rem; display: flex; gap: 10px; align-items: flex-start; margin-top: 2rem; }
        .interop-info-box p { font-size: 0.75rem; color: #64748B; font-weight: 600; line-height: 1.5; margin: 0; }
        .interop-info-box svg { color: #3B82F6; flex-shrink: 0; }

        .pin-card { text-align: center; padding: 3rem 2rem; }
        .lock-icon { width: 64px; height: 64px; background: #F1F5F9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; color: #1E293B; }
        .pin-card h3 { font-size: 1.3rem; font-weight: 900; margin-bottom: 0.5rem; }
        .pin-card p { font-size: 0.9rem; color: #64748B; font-weight: 600; margin-bottom: 2rem; }
        .pin-input-wrapper input { width: 180px; text-align: center; font-size: 3rem; letter-spacing: 15px; border: none; border-bottom: 3px solid #E2E8F0; outline: none; font-weight: 950; color: #1E293B; }
        .pin-input-wrapper input:focus { border-color: #006233; }

        .success-view { text-align: center; padding: 3rem 1.5rem; background: #fff; border-radius: 40px; border: 1.5px solid #F1F5F9; box-shadow: 0 20px 60px rgba(0,0,0,0.05); }
        .success-anim { margin-bottom: 2rem; }
        .success-view h2 { font-size: 2.2rem; font-weight: 950; color: #1E293B; margin-bottom: 1rem; }
        .success-msg { color: #64748B; font-size: 1rem; margin-bottom: 2.5rem; }
        .receipt-card { background: #F8FAFC; border: 1.5px solid #F1F5F9; border-radius: 24px; padding: 1.5rem; margin-bottom: 2.5rem; }
        .receipt-line { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.85rem; }
        .receipt-line:last-child { margin-bottom: 0; }
        .receipt-line span { color: #94A3B8; font-weight: 700; }
        .receipt-line strong { color: #1E293B; font-weight: 800; }
        .status-success { color: #10B981; }
        .receipt-line.interop strong { color: #4338CA; }

        .live-status-card { background: #fff; border-radius: 32px; padding: 2.5rem; border: 1.5px solid #F1F5F9; box-shadow: 0 10px 30px rgba(0,0,0,0.02); text-align: center; }
        .live-header { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 2rem; }
        .pulsating-dot { width: 10px; height: 10px; background: #10B981; border-radius: 50%; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
        .live-header h3 { font-size: 1.1rem; font-weight: 800; color: #1E293B; margin: 0; }
        
        .progress-container { margin-bottom: 2.5rem; }
        .progress-bar-bg { height: 10px; background: #F1F5F9; border-radius: 99px; overflow: hidden; margin-bottom: 8px; }
        .progress-bar-fill { height: 100%; background: #006233; transition: width 0.5s ease; }
        .progress-text { font-size: 0.75rem; font-weight: 800; color: #94A3B8; }

        .status-timeline { display: flex; justify-content: space-between; position: relative; margin-bottom: 2.5rem; }
        .status-timeline::before { content: ''; position: absolute; top: 10px; left: 0; right: 0; height: 2px; background: #F1F5F9; z-index: 0; }
        .timeline-item { position: relative; z-index: 1; display: flex; flexDirection: column; align-items: center; gap: 8px; flex: 1; }
        .timeline-item .dot { width: 22px; height: 22px; background: #fff; border: 3px solid #E2E8F0; border-radius: 50%; transition: 0.3s; }
        .timeline-item.done .dot { background: #006233; border-color: #006233; box-shadow: 0 0 10px rgba(0,98,51,0.3); }
        .timeline-item span { font-size: 0.6rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; text-align: center; }
        .timeline-item.done span { color: #1E293B; }

        .live-message { font-size: 0.9rem; font-weight: 700; color: #006233; background: #ECFDF5; padding: 1rem; border-radius: 16px; margin: 0; }

        .success-actions { display: flex; flex-direction: column; gap: 1rem; }
        .btn-primary { padding: 1.2rem; border-radius: 18px; border: none; background: #1E293B; color: #fff; font-size: 1rem; font-weight: 800; cursor: pointer; transition: 0.2s; }
        .btn-secondary { padding: 1rem; border: none; background: none; color: #64748B; font-size: 0.9rem; font-weight: 800; cursor: pointer; }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        
        @media (max-width: 600px) {
           .transfer-page-wrapper { padding: 1rem; }
           .amount-display h2 { font-size: 2.4rem; }
        }
      `}</style>
      </div>
  );
}
