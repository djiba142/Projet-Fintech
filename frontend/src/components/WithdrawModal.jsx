import React, { useState, useEffect } from "react";
import { 
  X, 
  Smartphone, 
  Wallet, 
  Lock, 
  ChevronRight, 
  ShieldCheck, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Building2,
  Copy,
  Plus
} from "lucide-react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function WithdrawModal({ isOpen, onClose, user, token, balances, onRefresh }) {
  const [step, setStep] = useState(1);
  const [operator, setOperator] = useState("ORANGE");
  const [amount, setAmount] = useState("");
  const [agentId, setAgentId] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [txId, setTxId] = useState(null);
  const [withdrawCode, setWithdrawCode] = useState(null);
  const [expiry, setExpiry] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  // WebSocket pour le suivi en temps réel
  const [liveStatus, setLiveStatus] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setAmount("");
      setAgentId("");
      setOtp("");
      setError("");
      setLiveStatus(null);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (step === 4 && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleInitiate = async () => {
    if (!amount || parseInt(amount) < 1000) return setError("Montant minimum : 1 000 GNF");
    if (!agentId) return setError("Veuillez saisir le code Agent");
    
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API}/m1/withdraw/initiate`, {
        operator,
        amount: parseInt(amount),
        agent_id: agentId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTxId(res.data.transaction_id);
      setStep(2); // Passer à l'OTP
      connectWS(res.data.transaction_id);
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors de l'initiation");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return setError("Code OTP requis (6 chiffres)");
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API}/m1/withdraw/otp-verify`, {
        tx_id: txId,
        otp_code: otp
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWithdrawCode(res.data.withdraw_code);
      setExpiry(res.data.expires_at);
      setStep(3); // Passage au suivi (qui affichera le code)
    } catch (err) {
      setError(err.response?.data?.detail || "OTP invalide");
    } finally {
      setLoading(false);
    }
  };

  const connectWS = (id) => {
    const wsUrl = API.replace("http", "ws") + "/m1/ws/transfer/" + id;
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setLiveStatus(data);
      if (data.status === "SUCCESS") {
        setStep(5); // Succès final
        onRefresh(); // Refresh balances in dashboard
      }
    };
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="withdraw-modal">
        <button className="close-btn" onClick={onClose}><X size={24} /></button>
        
        <div className="modal-header">
           <div className="icon-box"><Wallet size={24} color="#006233" /></div>
           <div>
              <h2>Retrait d'argent</h2>
              <p>Retirez vos fonds chez un agent agréé</p>
           </div>
        </div>

        {error && <div className="error-box"><AlertCircle size={18} /> {error}</div>}

        {/* STEP 1: FORMULAIRE */}
        {step === 1 && (
          <div className="step-content">
             <div className="op-selector">
                <div className={`op-item ${operator === 'ORANGE' ? 'active orange' : ''}`} onClick={() => setOperator("ORANGE")}>
                   <img src={window.location.origin + "/orange.png"} alt="OM" />
                   <span>Orange Money</span>
                </div>
                <div className={`op-item ${operator === 'MTN' ? 'active mtn' : ''}`} onClick={() => setOperator("MTN")}>
                   <img src={window.location.origin + "/mtn.png"} alt="MoMo" />
                   <span>MTN MoMo</span>
                </div>
             </div>

             <div className="input-group">
                <label>Montant à retirer (GNF)</label>
                <div className="field">
                   <Plus size={20} className="field-icon" />
                   <input type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
                </div>
                <p className="bal-hint">Disponible : <strong>{(operator === 'ORANGE' ? balances.orange : balances.mtn).toLocaleString()} GNF</strong></p>
             </div>

             <div className="input-group">
                <label>Code Agent (6 chiffres)</label>
                <div className="field">
                   <Building2 size={20} className="field-icon" />
                   <input type="text" placeholder="Ex: 123456" value={agentId} onChange={e => setAgentId(e.target.value)} />
                </div>
             </div>

             <button className="btn-main" onClick={handleInitiate} disabled={loading}>
                {loading ? <Loader2 className="spin" size={20} /> : <>Continuer <ChevronRight size={18} /></>}
             </button>
          </div>
        )}

        {/* STEP 2: OTP */}
        {step === 2 && (
          <div className="step-content centered">
             <div className="lock-box"><Lock size={40} color="#1E293B" /></div>
             <h3>Validation Sécurisée</h3>
             <p>Saisissez le code de confirmation envoyé par SMS au {operator === 'ORANGE' ? user.msisdn_orange : user.msisdn_mtn}</p>
             
             <div className="otp-wrapper">
                <input 
                  type="text" 
                  maxLength="6" 
                  placeholder="000000" 
                  value={otp} 
                  onChange={e => setOtp(e.target.value)} 
                  autoFocus
                />
             </div>
             <p className="otp-hint">Code de test : <strong>123456</strong></p>

             <button className="btn-main" onClick={handleVerifyOtp} disabled={loading}>
                {loading ? <Loader2 className="spin" size={20} /> : "Vérifier le code"}
             </button>
          </div>
        )}

        {/* STEP 3 & 4: CODE GÉNÉRÉ & ATTENTE AGENT */}
        {(step === 3 || step === 4) && (
          <div className="step-content centered">
             <div className="code-display">
                <p className="label">CODE DE RETRAIT</p>
                <h1 className="withdraw-code">{withdrawCode}</h1>
                <div className="expiry">
                   <Clock size={16} /> <span>Expire dans {formatTime(timeLeft)}</span>
                </div>
             </div>

             <div className="info-alert">
                <AlertCircle size={20} color="#3B82F6" />
                <p>Présentez ce code à l'agent <strong>#{agentId}</strong> pour recevoir vos espèces.</p>
             </div>

             <div className="live-status-bar">
                <div className="pulsating-dot"></div>
                <span>{liveStatus?.message || "Attente de validation par l'agent..."}</span>
             </div>
             
             <div className="progress-mini">
                <div className="fill" style={{ width: `${liveStatus?.progress || 50}%` }}></div>
             </div>
          </div>
        )}

        {/* STEP 5: SUCCÈS */}
        {step === 5 && (
          <div className="step-content centered">
             <div className="success-anim">
                <CheckCircle size={80} color="#10B981" />
             </div>
             <h2>Retrait Réussi !</h2>
             <p>Vous avez retiré <strong>{parseInt(amount).toLocaleString()} GNF</strong></p>
             
             <div className="receipt">
                <div className="r-line"><span>Agent</span> <strong>{agentId}</strong></div>
                <div className="r-line"><span>ID Transaction</span> <strong>{txId}</strong></div>
                <div className="r-line"><span>Nouveau Solde</span> <strong style={{color: '#006233'}}>{liveStatus?.details?.new_balance?.toLocaleString() || '---'} GNF</strong></div>
                <div className="r-line"><span>Statut</span> <strong style={{color: '#10B981'}}>TERMINÉ</strong></div>
             </div>

             <button className="btn-main" onClick={onClose}>Fermer</button>
          </div>
        )}

      </div>

      <style>{`
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .withdraw-modal { background: #fff; width: 100%; max-width: 480px; border-radius: 40px; padding: 2.5rem; position: relative; box-shadow: 0 30px 60px rgba(0,0,0,0.15); animation: slideUp 0.3s ease-out; }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        .close-btn { position: absolute; top: 1.5rem; right: 1.5rem; border: none; background: #F8FAFC; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; color: #64748B; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .close-btn:hover { background: #F1F5F9; color: #1E293B; }

        .modal-header { display: flex; gap: 1rem; align-items: center; margin-bottom: 2.5rem; }
        .icon-box { width: 50px; height: 50px; background: #ECFDF5; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
        .modal-header h2 { font-size: 1.5rem; font-weight: 900; color: #1E293B; margin: 0; }
        .modal-header p { font-size: 0.9rem; color: #64748B; margin: 0; font-weight: 600; }

        .op-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }
        .op-item { border: 2px solid #F1F5F9; border-radius: 20px; padding: 1.2rem; display: flex; flex-direction: column; align-items: center; gap: 10px; cursor: pointer; transition: 0.2s; }
        .op-item img { height: 32px; border-radius: 8px; }
        .op-item span { font-size: 0.8rem; font-weight: 800; color: #64748B; }
        .op-item.active.orange { border-color: #F37021; background: #FFF7ED; }
        .op-item.active.mtn { border-color: #FFCC00; background: #FEFCE8; }
        .op-item.active span { color: #1E293B; }

        .input-group { margin-bottom: 1.5rem; }
        .input-group label { display: block; font-size: 0.8rem; font-weight: 800; color: #64748B; margin-bottom: 8px; }
        .field { position: relative; }
        .field-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #94A3B8; }
        .field input { width: 100%; padding: 1.1rem 1rem 1.1rem 3.5rem; border-radius: 18px; border: 2.5px solid #F1F5F9; font-size: 1.1rem; font-weight: 800; outline: none; transition: 0.2s; background: #F8FAFC; }
        .field input:focus { border-color: #006233; background: #fff; }
        .bal-hint { font-size: 0.75rem; color: #94A3B8; margin-top: 6px; }

        .btn-main { width: 100%; padding: 1.2rem; border-radius: 20px; border: none; background: #006233; color: #fff; font-size: 1.1rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 10px 25px rgba(0,98,51,0.2); transition: 0.3s; margin-top: 1rem; }
        .btn-main:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(0,98,51,0.3); }
        .btn-main:disabled { opacity: 0.6; cursor: not-allowed; }

        .centered { text-align: center; padding: 1rem 0; }
        .lock-box { width: 80px; height: 80px; background: #F1F5F9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
        .centered h3 { font-size: 1.4rem; font-weight: 950; color: #1E293B; margin-bottom: 0.5rem; }
        .centered p { color: #64748B; font-weight: 600; font-size: 0.95rem; line-height: 1.5; margin-bottom: 2rem; }
        
        .otp-wrapper input { width: 100%; text-align: center; font-size: 3rem; font-weight: 950; letter-spacing: 15px; border: none; border-bottom: 4px solid #F1F5F9; outline: none; background: transparent; margin-bottom: 1rem; color: #1E293B; }
        .otp-wrapper input:focus { border-color: #006233; }
        .otp-hint { font-size: 0.8rem; color: #94A3B8; margin-bottom: 2.5rem; }

        .code-display { background: #1E293B; padding: 2.5rem; border-radius: 32px; color: #fff; margin-bottom: 2rem; }
        .code-display .label { font-size: 0.7rem; font-weight: 900; opacity: 0.6; letter-spacing: 2px; margin-bottom: 10px; }
        .withdraw-code { font-size: 4.5rem; font-weight: 950; margin: 0; letter-spacing: 5px; color: #10B981; }
        .expiry { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 1rem; font-size: 0.9rem; font-weight: 700; color: #94A3B8; }

        .info-alert { background: #EFF6FF; border: 1px solid #DBEAFE; padding: 1.2rem; border-radius: 20px; display: flex; gap: 12px; align-items: flex-start; margin-bottom: 2rem; text-align: left; }
        .info-alert p { font-size: 0.85rem; color: #1E40AF; margin: 0; line-height: 1.5; font-weight: 700; }

        .live-status-bar { display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 0.9rem; font-weight: 800; color: #006233; margin-bottom: 1rem; }
        .pulsating-dot { width: 10px; height: 10px; background: #10B981; border-radius: 50%; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.6); opacity: 0.4; } 100% { transform: scale(1); opacity: 1; } }
        .progress-mini { height: 6px; background: #F1F5F9; border-radius: 10px; overflow: hidden; }
        .progress-mini .fill { height: 100%; background: #10B981; transition: 0.5s; }

        .success-anim { margin-bottom: 2rem; }
        .receipt { background: #F8FAFC; border: 1.5px solid #F1F5F9; border-radius: 24px; padding: 1.5rem; margin-bottom: 2rem; text-align: left; }
        .r-line { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.85rem; }
        .r-line span { color: #94A3B8; font-weight: 700; }
        .r-line strong { color: #1E293B; font-weight: 800; }

        .error-box { background: #FEF2F2; color: #991B1B; padding: 1rem; border-radius: 16px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px; font-size: 0.85rem; font-weight: 700; border: 1px solid #FEE2E2; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
