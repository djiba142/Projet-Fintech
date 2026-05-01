import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  ChevronRight, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Smartphone,
  Eye,
  EyeOff,
  Loader2,
  MapPin
} from "lucide-react";
import axios from "axios";
import logoKandjou from "../assets/logo_kandjou.png";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: ""
  });

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const nextStep = () => {
    if (step === 1 && (!formData.fullname || !formData.phone)) {
      setError("Veuillez remplir votre nom et numéro de téléphone.");
      return;
    }
    if (step === 2 && (formData.password !== formData.confirmPassword)) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (step === 2 && formData.password.length < 6) {
        setError("Le mot de passe doit contenir au moins 6 caractères.");
        return;
    }
    setError("");
    setStep(step + 1);
  };

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API}/m3/register`, {
        username: formData.phone,
        password: formData.password,
        fullname: formData.fullname,
        email: formData.email,
        address: formData.address,
        role: "Client"
      });
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors de l'inscription. Ce numéro est peut-être déjà utilisé.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page-container">
      {/* Left Visual Side */}
      <div className="reg-visual-side">
         <div className="reg-visual-content">
            <img src={logoKandjou} alt="Kandjou" className="reg-logo" />
            <h1 className="reg-title">Rejoignez la révolution financière.</h1>
            <p className="reg-subtitle-visual">Ouvrez un compte en quelques minutes et accédez à l'interopérabilité totale entre vos portefeuilles mobiles.</p>
            
            <div className="trust-points">
               <div className="trust-item">
                  <div className="trust-icon"><CheckCircle2 size={22} /></div>
                  <div>
                    <h4>Gestion Unifiée</h4>
                    <p>Vos comptes Orange & MTN sur un seul écran.</p>
                  </div>
               </div>
               <div className="trust-item">
                  <div className="trust-icon"><CheckCircle2 size={22} /></div>
                  <div>
                    <h4>Accès au Crédit</h4>
                    <p>Valorisez vos transactions pour emprunter.</p>
                  </div>
               </div>
               <div className="trust-item">
                  <div className="trust-icon"><CheckCircle2 size={22} /></div>
                  <div>
                    <h4>Sécurité Maximale</h4>
                    <p>Protection de vos fonds certifiée BCRG.</p>
                  </div>
               </div>
            </div>
         </div>
         <div className="visual-overlay" />
      </div>

      {/* Right Form Side */}
      <div className="reg-form-side">
         <div className="reg-form-container">
            
            {step < 4 && (
              <div className="reg-progress-header">
                 <div className="progress-info">
                    <span>Étape {step} / 3</span>
                    <span className="step-label">
                        {step === 1 ? "Informations Personnelles" : step === 2 ? "Sécurisation" : "Vérification"}
                    </span>
                 </div>
                 <div className="progress-track-bg">
                    <div className="progress-track-fill" style={{ width: `${(step/3)*100}%` }} />
                 </div>
              </div>
            )}

            {step === 1 && (
              <div className="reg-step-box">
                 <h2>Créez votre compte</h2>
                 <p className="reg-form-desc">Saisissez vos coordonnées pour commencer l'aventure Kandjou.</p>
                 
                 <div className="auth-form">
                    <div className="input-group">
                       <label>Nom complet</label>
                       <div className="input-wrapper">
                          <User className="input-icon" size={20} />
                          <input type="text" placeholder="Ex: Ibrahima Diallo" value={formData.fullname} onChange={e => setFormData({...formData, fullname: e.target.value})} />
                       </div>
                    </div>
                    <div className="input-group">
                       <label>Numéro de téléphone</label>
                       <div className="input-wrapper">
                          <Phone className="input-icon" size={20} />
                          <input type="text" placeholder="622 00 00 00" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                       </div>
                    </div>
                    <div className="input-group">
                       <label>Adresse de résidence</label>
                       <div className="input-wrapper">
                          <MapPin className="input-icon" size={20} />
                          <input type="text" placeholder="Ex: Madina, Conakry" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                       </div>
                    </div>
                    {error && <div className="error-msg-box">{error}</div>}
                    <button className="btn-reg-next" onClick={nextStep}>Suivant <ChevronRight size={20} /></button>
                 </div>
              </div>
            )}

            {step === 2 && (
              <div className="reg-step-box">
                 <h2>Sécurité</h2>
                 <p className="reg-form-desc">Choisissez un mot de passe robuste pour protéger vos avoirs.</p>
                 
                 <div className="auth-form">
                    <div className="input-group">
                       <label>Mot de passe</label>
                       <div className="input-wrapper">
                          <Lock className="input-icon" size={20} />
                          <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                          <button className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                             {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                       </div>
                    </div>
                    <div className="input-group">
                       <label>Confirmation du mot de passe</label>
                       <div className="input-wrapper">
                          <Lock className="input-icon" size={20} />
                          <input type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
                       </div>
                    </div>
                    <div className="reg-terms-check">
                       <input type="checkbox" id="terms" />
                       <label htmlFor="terms">J'accepte les conditions d'utilisation et la politique de confidentialité de Kandjou.</label>
                    </div>
                    {error && <div className="error-msg-box">{error}</div>}
                    <div className="reg-btn-group">
                       <button className="btn-reg-back" onClick={() => setStep(1)}><ArrowLeft size={18} /> Retour</button>
                       <button className="btn-reg-next" onClick={nextStep}>Vérifier le numéro <ChevronRight size={20} /></button>
                    </div>
                 </div>
              </div>
            )}

            {step === 3 && (
              <div className="reg-step-box">
                 <h2>Vérification SMS</h2>
                 <p className="reg-form-desc">Un code a été envoyé au <strong>{formData.phone}</strong>. Saisissez-le ci-dessous.</p>
                 
                 <div className="auth-form">
                    <div className="otp-container">
                       <Smartphone className="input-icon" size={24} />
                       <input type="text" maxLength="6" placeholder="0 0 0 0 0 0" className="otp-input-field" value={otp} onChange={e => setOtp(e.target.value)} />
                    </div>
                    <p className="otp-resend">Vous n'avez rien reçu ? <button type="button">Renvoyer</button></p>
                    {error && <div className="error-msg-box">{error}</div>}
                    <div className="reg-btn-group">
                       <button className="btn-reg-back" onClick={() => setStep(2)}>Retour</button>
                       <button className="btn-reg-next" onClick={handleRegister} disabled={loading}>
                          {loading ? <Loader2 className="spin" /> : "Finaliser l'inscription"}
                       </button>
                    </div>
                 </div>
              </div>
            )}

            {step === 4 && (
              <div className="reg-success-state">
                 <div className="success-lottie">
                    <CheckCircle2 size={100} color="#006233" />
                 </div>
                 <h2>Bienvenue chez Kandjou !</h2>
                 <p>Votre compte a été créé avec succès. Vous faites maintenant partie de l'élite financière de Guinée.</p>
                 <button className="btn-reg-next" onClick={() => navigate("/login")}>Se connecter maintenant</button>
              </div>
            )}

            {step < 4 && (
              <div className="reg-footer-links">
                 <p>Déjà membre ? <Link to="/login">Connectez-vous</Link></p>
                 <div className="secure-tag">
                    <ShieldCheck size={16} /> Serveurs Bancaires Sécurisés
                 </div>
              </div>
            )}
         </div>
      </div>

      <style>{`
        .register-page-container { display: flex; min-height: 100vh; background: #fff; font-family: 'Plus Jakarta Sans', sans-serif; }
        
        .reg-visual-side { 
          flex: 1.2; 
          background: url('/register_branding.png') center/cover; 
          position: relative; 
          padding: 4rem; 
          display: flex; 
          align-items: center; 
          color: #fff; 
        }
        .visual-overlay { 
          position: absolute; 
          inset: 0; 
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(0, 98, 51, 0.85) 100%); 
          z-index: 1; 
        }
        .reg-visual-content { position: relative; z-index: 2; max-width: 550px; }
        .reg-logo { height: 45px; margin-bottom: 4rem; filter: brightness(0) invert(1); }
        .reg-title { font-size: 3.5rem; font-weight: 950; line-height: 1.1; margin-bottom: 1.5rem; letter-spacing: -2px; }
        .reg-subtitle-visual { font-size: 1.2rem; opacity: 0.9; line-height: 1.7; margin-bottom: 5rem; font-weight: 500; }
        
        .trust-points { display: flex; flex-direction: column; gap: 2.5rem; }
        .trust-item { display: flex; gap: 1.5rem; align-items: flex-start; }
        .trust-icon { 
          width: 48px; 
          height: 48px; 
          background: rgba(255,255,255,0.1); 
          border-radius: 14px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: #10B981;
          backdrop-filter: blur(10px);
        }
        .trust-item h4 { font-size: 1.2rem; font-weight: 800; margin-bottom: 4px; }
        .trust-item p { font-size: 0.95rem; opacity: 0.7; font-weight: 600; }

        .reg-form-side { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem; background: #fff; }
        .reg-form-container { width: 100%; max-width: 500px; }
        
        .reg-progress-header { margin-bottom: 4rem; }
        .progress-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .progress-info span { font-size: 0.8rem; font-weight: 900; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; }
        .step-label { color: #1E293B !important; }
        .progress-track-bg { height: 8px; background: #F1F5F9; border-radius: 99px; overflow: hidden; }
        .progress-track-fill { height: 100%; background: #006233; transition: 0.5s cubic-bezier(0.4, 0, 0.2, 1); }

        .reg-step-box h2 { font-size: 2.5rem; font-weight: 950; color: #1E293B; letter-spacing: -1.5px; margin-bottom: 0.8rem; }
        .reg-form-desc { color: #64748B; font-weight: 600; margin-bottom: 3rem; font-size: 1.05rem; }

        .auth-form { display: flex; flex-direction: column; gap: 1.8rem; }
        .input-group label { display: block; font-size: 0.85rem; font-weight: 800; color: #475569; margin-bottom: 10px; text-transform: uppercase; }
        .input-wrapper { position: relative; }
        .input-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: #94A3B8; }
        .input-wrapper input { width: 100%; padding: 1.2rem 1rem 1.2rem 3.8rem; border-radius: 18px; border: 2.5px solid #F1F5F9; background: #F8FAFC; font-size: 1.05rem; font-weight: 700; outline: none; transition: 0.3s; }
        .input-wrapper input:focus { border-color: #006233; background: #fff; box-shadow: 0 0 0 5px rgba(0, 98, 51, 0.05); }

        .reg-terms-check { display: flex; align-items: flex-start; gap: 12px; font-size: 0.85rem; color: #64748B; font-weight: 600; line-height: 1.5; cursor: pointer; }
        .reg-terms-check input { margin-top: 3px; }
        .error-msg-box { background: #FFF1F2; color: #E11D48; padding: 1rem; border-radius: 12px; font-size: 0.9rem; font-weight: 700; border: 1.5px solid #FFE4E6; }

        .reg-btn-group { display: flex; gap: 1.2rem; margin-top: 1rem; }
        .btn-reg-back { flex: 0.4; background: #F1F5F9; border: none; padding: 1.2rem; border-radius: 20px; font-weight: 800; color: #475569; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; }
        .btn-reg-next { flex: 1; background: #006233; color: #fff; border: none; padding: 1.2rem; border-radius: 20px; font-size: 1.1rem; font-weight: 800; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 10px 25px rgba(0, 98, 51, 0.2); }
        .btn-reg-next:hover { transform: translateY(-2px); box-shadow: 0 15px 35px rgba(0, 98, 51, 0.3); }

        .otp-container { position: relative; display: flex; justify-content: center; align-items: center; padding: 1rem 0; }
        .otp-input-field { width: 100%; text-align: center; letter-spacing: 15px; font-size: 2.5rem; font-weight: 950; color: #1E293B; border: none; border-bottom: 4px solid #E2E8F0; padding: 1rem 0; outline: none; background: transparent; }
        .otp-input-field:focus { border-color: #006233; }
        .otp-resend { text-align: center; font-size: 0.9rem; font-weight: 700; color: #94A3B8; margin: 1.5rem 0; }
        .otp-resend button { background: none; border: none; color: #006233; font-weight: 900; cursor: pointer; text-decoration: underline; margin-left: 5px; }

        .reg-success-state { text-align: center; animation: fadeIn 0.6s ease-out; }
        .success-lottie { margin-bottom: 3rem; }
        .reg-success-state h2 { font-size: 2.8rem; font-weight: 950; color: #1E293B; margin-bottom: 1.5rem; letter-spacing: -2px; }
        .reg-success-state p { color: #64748B; font-size: 1.2rem; line-height: 1.7; margin-bottom: 4rem; }

        .reg-footer-links { margin-top: 4rem; text-align: center; padding-top: 2.5rem; border-top: 1.5px solid #F1F5F9; }
        .reg-footer-links p { font-size: 1rem; color: #64748B; font-weight: 600; margin-bottom: 1.5rem; }
        .reg-footer-links a { color: #006233; font-weight: 900; text-decoration: none; margin-left: 6px; }
        .secure-tag { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.75rem; font-weight: 900; color: #94A3B8; text-transform: uppercase; letter-spacing: 2px; }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 1024px) {
           .reg-visual-side { display: none; }
           .reg-form-side { padding: 1.5rem; }
        }
      `}</style>
    </div>
  );
}
