import React, { useState, useEffect } from "react";
import { 
  X, 
  Smartphone, 
  Wallet, 
  Lock, 
  ChevronRight, 
  ShieldCheck, 
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRightLeft,
  Info,
  Send,
  ArrowLeft
} from "lucide-react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function TransferModal({ isOpen, onClose, user, token, balances, onRefresh }) {
  const [step, setStep] = useState(1);
  const [operator, setOperator] = useState("ORANGE");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verifyData, setVerifyData] = useState(null);
  const [txId, setTxId] = useState(null);
  const [liveStatus, setLiveStatus] = useState(null);
  const [successData, setSuccessData] = useState(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setRecipient("");
      setAmount("");
      setNote("");
      setPin("");
      setError("");
      setLiveStatus(null);
      setSuccessData(null);
      setVerifyData(null);
    }
  }, [isOpen]);

  const validatePhone = (num) => {
    const phoneRegex = /^(\+224|00224|224)?(611|621|622|623|624|625|626|627|628|629|661|662|664|666|669|654|655|656|657)[0-9]{6}$/;
    return phoneRegex.test(num.replace(/\s/g, ""));
  };

  const handleNextToConfirm = async () => {
    if (!validatePhone(recipient)) return setError("Numéro de téléphone Guinéen invalide");
    if (!amount || parseInt(amount) < 1000) return setError("Montant minimum : 1 000 GNF");
    
    const sourceBalance = operator === "ORANGE" ? balances.orange : balances.mtn;
    if (parseInt(amount) > sourceBalance) return setError("Solde insuffisant");

    setLoading(true);
    setError("");
    try {
      // Pré-vérification (Frais, Nom du destinataire simulé)
      const res = await axios.post(`${API}/m1/transfer/verify`, {
        operator,
        to_msisdn: recipient.replace(/\s/g, ""),
        amount: parseInt(amount)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVerifyData(res.data);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur de vérification");
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateTransfer = async () => {
    if (pin.length < 4) return setError("PIN requis");
    
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API}/m1/transfer/v2`, {
        operator,
        to_msisdn: recipient.replace(/\s/g, ""),
        amount: parseInt(amount),
        note: note || "Transfert Kandjou",
        pin: pin
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTxId(res.data.tx_id);
      setStep(4); // Mode Suivi temps réel
      connectWS(res.data.tx_id);
    } catch (err) {
      setError(err.response?.data?.detail || "Échec de l'initiation");
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
        setSuccessData(data.details);
        setStep(5);
        onRefresh(); // Refresh balances
      } else if (data.status === "FAILED") {
        setError(data.message);
        setStep(3); // Retour au PIN pour correction
      }
    };
  };

  const addPinDigit = (digit) => {
    if (pin.length < 4) setPin(prev => prev + digit);
  };

  const removePinDigit = () => {
    setPin(prev => prev.slice(0, -1));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="transfer-modal">
        <button className="close-btn" onClick={onClose}><X size={24} /></button>
        
        <div className="modal-header">
           <div className="icon-box"><Send size={24} color="#006233" /></div>
           <div>
              <h2>Envoyer de l'argent</h2>
              <p>Transfert sécurisé multi-opérateurs</p>
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
                <label>Numéro du destinataire</label>
                <div className="field">
                   <Smartphone size={20} className="field-icon" />
                   <input 
                     type="text" 
                     placeholder="Ex: 622 12 34 56" 
                     value={recipient} 
                     onChange={e => setRecipient(e.target.value)} 
                   />
                </div>
             </div>

             <div className="input-group">
                <label>Montant (GNF)</label>
                <div className="field">
                   <Wallet size={20} className="field-icon" />
                   <input 
                     type="number" 
                     placeholder="0" 
                     value={amount} 
                     onChange={e => setAmount(e.target.value)} 
                   />
                </div>
                <p className="bal-hint">Disponible : <strong>{(operator === 'ORANGE' ? balances.orange : balances.mtn).toLocaleString()} GNF</strong></p>
             </div>

             <button className="btn-main" onClick={handleNextToConfirm} disabled={loading}>
                {loading ? <Loader2 className="spin" size={20} /> : <>Continuer <ChevronRight size={18} /></>}
             </button>
          </div>
        )}

        {/* STEP 2: CONFIRMATION & FRAIS */}
        {step === 2 && (
          <div className="step-content">
             <div className="confirm-summary">
                <p className="label">VOUS ENVOYEZ</p>
                <h1 className="amount-val">{parseInt(amount).toLocaleString()} <span>GNF</span></h1>
             </div>

             <div className="confirm-details">
                <div className="c-row">
                   <span>Destinataire</span>
                   <strong>{recipient}</strong>
                </div>
                <div className="c-row">
                   <span>Nom estimé</span>
                   <strong style={{color: '#006233'}}>{verifyData?.recipient_name}</strong>
                </div>
                <div className="c-row">
                   <span>Frais de service</span>
                   <strong className={verifyData?.fees > 0 ? "fee-warn" : "fee-free"}>
                      {verifyData?.fees > 0 ? `${verifyData.fees.toLocaleString()} GNF` : "GRATUIT"}
                   </strong>
                </div>
                <div className="c-row total">
                   <span>Total à débiter</span>
                   <strong>{verifyData?.total_deducted?.toLocaleString()} GNF</strong>
                </div>
             </div>

             {verifyData?.is_interop && (
               <div className="interop-box">
                  <ArrowRightLeft size={20} color="#4338CA" />
                  <div>
                    <h4>Interopérabilité active</h4>
                    <p>Ce transfert sera routé via la passerelle Kandjou vers {operator === 'ORANGE' ? 'MTN' : 'Orange'}.</p>
                  </div>
               </div>
             )}

             <div className="action-grid">
                <button className="btn-secondary" onClick={() => setStep(1)}>Modifier</button>
                <button className="btn-main" onClick={() => setStep(3)}>Confirmer</button>
             </div>
          </div>
        )}

        {/* STEP 3: PIN PAD */}
        {step === 3 && (
          <div className="step-content centered">
             <div className="lock-box"><Lock size={40} color="#1E293B" /></div>
             <h3>Validation PIN</h3>
             <p>Saisissez votre code secret à 4 chiffres pour valider le transfert</p>
             
             <div className="pin-dots">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`dot ${pin.length > i ? 'filled' : ''}`}></div>
                ))}
             </div>

             <div className="numpad">
                {[1,2,3,4,5,6,7,8,9].map(n => (
                  <button key={n} onClick={() => addPinDigit(n.toString())}>{n}</button>
                ))}
                <button onClick={onClose} style={{color: '#EF4444'}}>X</button>
                <button onClick={() => addPinDigit("0")}>0</button>
                <button onClick={removePinDigit}><ArrowLeft size={20} /></button>
             </div>

             <button className="btn-main" onClick={handleInitiateTransfer} disabled={loading || pin.length < 4}>
                {loading ? <Loader2 className="spin" size={20} /> : "Valider le transfert"}
             </button>
          </div>
        )}

        {/* STEP 4: LIVE PROGRESS */}
        {step === 4 && (
          <div className="step-content centered">
             <div className="live-header">
                <div className="pulsating-dot"></div>
                <h3>{liveStatus?.message || "Initialisation..."}</h3>
             </div>

             <div className="africa-progress">
                <div className="bar">
                   <div className="fill" style={{ width: `${liveStatus?.progress || 10}%` }}></div>
                </div>
                <div className="labels">
                   <div className={liveStatus?.progress >= 25 ? 'active' : ''}>Sécurité</div>
                   <div className={liveStatus?.progress >= 70 ? 'active' : ''}>Opérateur</div>
                   <div className={liveStatus?.progress >= 100 ? 'active' : ''}>Finalisation</div>
                </div>
             </div>

             <div className="loader-container">
                <Loader2 className="spin" size={48} color="#006233" />
             </div>
             
             <p className="hint">Traitement en temps réel via la passerelle BCRG/Kandjou...</p>
          </div>
        )}

        {/* STEP 5: SUCCESS */}
        {step === 5 && (
          <div className="step-content centered">
             <div className="success-anim">
                <CheckCircle size={80} color="#10B981" />
             </div>
             <h2>Transfert Réussi !</h2>
             <p>Le montant de <strong>{parseInt(amount).toLocaleString()} GNF</strong> a été envoyé.</p>
             
             <div className="receipt">
                <div className="r-line"><span>Destinataire</span> <strong>{recipient}</strong></div>
                <div className="r-line"><span>ID Transaction</span> <strong>{txId}</strong></div>
                <div className="r-line"><span>Type</span> <strong>{successData?.interoperability ? 'INTEROPÉRABLE' : 'STANDARD'}</strong></div>
                <div className="r-line"><span>Nouveau Solde</span> <strong style={{color: '#006233'}}>{successData?.new_balance?.toLocaleString()} GNF</strong></div>
             </div>

             <button className="btn-main" onClick={onClose}>Fermer</button>
          </div>
        )}

      </div>

      <style>{`
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .transfer-modal { background: #fff; width: 100%; max-width: 500px; border-radius: 40px; padding: 2.5rem; position: relative; box-shadow: 0 40px 80px rgba(0,0,0,0.2); animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        .close-btn { position: absolute; top: 1.5rem; right: 1.5rem; border: none; background: #F8FAFC; width: 44px; height: 44px; border-radius: 14px; cursor: pointer; color: #64748B; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .close-btn:hover { background: #FEF2F2; color: #EF4444; transform: rotate(90deg); }

        .modal-header { display: flex; gap: 1.2rem; align-items: center; margin-bottom: 2.5rem; }
        .icon-box { width: 60px; height: 60px; background: #ECFDF5; border-radius: 20px; display: flex; align-items: center; justify-content: center; }
        .modal-header h2 { font-size: 1.7rem; font-weight: 950; color: #1E293B; margin: 0; letter-spacing: -0.5px; }
        .modal-header p { font-size: 0.95rem; color: #64748B; margin: 0; font-weight: 600; }

        .op-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }
        .op-item { border: 2.5px solid #F1F5F9; border-radius: 24px; padding: 1.5rem; display: flex; flex-direction: column; align-items: center; gap: 12px; cursor: pointer; transition: 0.2s; }
        .op-item img { height: 38px; border-radius: 10px; }
        .op-item span { font-size: 0.85rem; font-weight: 800; color: #64748B; }
        .op-item.active.orange { border-color: #F37021; background: #FFF7ED; }
        .op-item.active.mtn { border-color: #FFCC00; background: #FEFCE8; }
        .op-item.active span { color: #1E293B; }

        .input-group { margin-bottom: 1.5rem; }
        .input-group label { display: block; font-size: 0.85rem; font-weight: 800; color: #64748B; margin-bottom: 10px; }
        .field { position: relative; }
        .field-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: #94A3B8; }
        .field input { width: 100%; padding: 1.2rem 1rem 1.2rem 3.8rem; border-radius: 20px; border: 2.5px solid #F1F5F9; font-size: 1.1rem; font-weight: 800; outline: none; transition: 0.2s; background: #F8FAFC; color: #1E293B; }
        .field input:focus { border-color: #006233; background: #fff; box-shadow: 0 0 0 4px rgba(0, 98, 51, 0.05); }
        .bal-hint { font-size: 0.8rem; color: #94A3B8; margin-top: 8px; text-align: right; }

        .btn-main { width: 100%; padding: 1.3rem; border-radius: 22px; border: none; background: #006233; color: #fff; font-size: 1.1rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px; box-shadow: 0 12px 28px rgba(0,98,51,0.25); transition: 0.3s; margin-top: 1rem; }
        .btn-main:hover:not(:disabled) { transform: translateY(-4px); box-shadow: 0 18px 36px rgba(0,98,51,0.35); }
        .btn-main:disabled { opacity: 0.5; cursor: not-allowed; }

        .confirm-summary { text-align: center; margin-bottom: 2.5rem; padding: 2rem; background: #F8FAFC; border-radius: 32px; border: 1.5px solid #F1F5F9; }
        .confirm-summary .label { font-size: 0.75rem; font-weight: 900; color: #94A3B8; letter-spacing: 2px; margin-bottom: 10px; }
        .amount-val { font-size: 3rem; font-weight: 950; color: #1E293B; margin: 0; letter-spacing: -2px; }
        .amount-val span { font-size: 1.2rem; opacity: 0.5; margin-left: 5px; }

        .confirm-details { margin-bottom: 2.5rem; display: flex; flex-direction: column; gap: 1rem; }
        .c-row { display: flex; justify-content: space-between; align-items: center; font-size: 1rem; }
        .c-row span { color: #64748B; font-weight: 600; }
        .c-row strong { color: #1E293B; font-weight: 800; }
        .c-row.total { margin-top: 0.5rem; padding-top: 1rem; border-top: 1.5px dashed #E2E8F0; }
        .fee-warn { color: #4338CA !important; }
        .fee-free { color: #10B981 !important; }

        .interop-box { background: #EEF2FF; border: 1.5px solid #DBEAFE; padding: 1.5rem; border-radius: 24px; display: flex; gap: 15px; margin-bottom: 2.5rem; }
        .interop-box h4 { margin: 0 0 4px; font-size: 1rem; font-weight: 900; color: #4338CA; }
        .interop-box p { margin: 0; font-size: 0.85rem; color: #6366F1; line-height: 1.5; font-weight: 600; }

        .action-grid { display: grid; grid-template-columns: 0.4fr 1fr; gap: 1rem; }
        .btn-secondary { background: #F1F5F9; color: #64748B; border: none; padding: 1.3rem; border-radius: 22px; font-weight: 800; cursor: pointer; transition: 0.2s; }
        .btn-secondary:hover { background: #E2E8F0; color: #1E293B; }

        .centered { text-align: center; }
        .lock-box { width: 90px; height: 90px; background: #F1F5F9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
        .pin-dots { display: flex; gap: 1.5rem; justify-content: center; margin: 2.5rem 0; }
        .dot { width: 18px; height: 18px; border-radius: 50%; border: 3px solid #E2E8F0; transition: 0.2s; }
        .dot.filled { background: #006233; border-color: #006233; transform: scale(1.3); }

        .numpad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; max-width: 280px; margin: 0 auto 2.5rem; }
        .numpad button { height: 64px; border-radius: 18px; border: none; background: #F8FAFC; font-size: 1.5rem; font-weight: 900; color: #1E293B; cursor: pointer; transition: 0.2s; }
        .numpad button:hover { background: #F1F5F9; transform: scale(1.05); }

        .live-header { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 2.5rem; }
        .pulsating-dot { width: 12px; height: 12px; background: #10B981; border-radius: 50%; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.6); opacity: 0.4; } 100% { transform: scale(1); opacity: 1; } }

        .africa-progress { margin-bottom: 3rem; }
        .africa-progress .bar { height: 12px; background: #F1F5F9; border-radius: 10px; overflow: hidden; margin-bottom: 12px; }
        .africa-progress .fill { height: 100%; background: #006233; transition: width 0.6s cubic-bezier(0.65, 0, 0.35, 1); }
        .africa-progress .labels { display: flex; justify-content: space-between; }
        .africa-progress .labels div { font-size: 0.75rem; font-weight: 900; color: #94A3B8; text-transform: uppercase; }
        .africa-progress .labels div.active { color: #006233; }

        .loader-container { margin: 3rem 0; display: flex; justify-content: center; }
        .hint { font-size: 0.9rem; color: #94A3B8; font-weight: 600; }

        .receipt { background: #F8FAFC; border: 2px solid #F1F5F9; border-radius: 32px; padding: 2rem; margin-bottom: 2.5rem; text-align: left; }
        .r-line { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.95rem; }
        .r-line:last-child { margin-bottom: 0; border-top: 1.5px dashed #E2E8F0; padding-top: 12px; margin-top: 12px; }
        .r-line span { color: #94A3B8; font-weight: 700; }
        .r-line strong { color: #1E293B; font-weight: 800; }

        .error-box { background: #FEF2F2; color: #991B1B; padding: 1.2rem; border-radius: 18px; margin-bottom: 2rem; display: flex; align-items: center; gap: 12px; font-size: 0.9rem; font-weight: 700; border: 1.5px solid #FEE2E2; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
