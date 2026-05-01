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
  Loader2
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
    password: "",
    confirmPassword: ""
  });

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const nextStep = () => {
    if (step === 1 && (!formData.fullname || !formData.phone)) {
      setError("Veuillez remplir les informations de base.");
      return;
    }
    if (step === 2 && (formData.password !== formData.confirmPassword)) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setError("");
    setStep(step + 1);
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/m3/register`, {
        username: formData.phone,
        password: formData.password,
        fullname: formData.fullname,
        email: formData.email,
        role: "Client"
      });
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.detail || "Échec de l'inscription. Ce numéro est déjà utilisé.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page-container">
      {/* Visual Column */}
      <div className="reg-visual-side">
         <div className="reg-visual-content">
            <img src={logoKandjou} alt="Kandjou" className="reg-logo" />
            <h1>Ouvrez les portes de l'interopérabilité.</h1>
            <p>Kandjou est plus qu'un agrégateur. C'est votre partenaire de croissance. Centralisez vos avoirs Orange Money et MTN MoMo pour une gestion sans barrière.</p>
            
            <div className="trust-points">
               <div className="trust-item">
                  <CheckCircle2 size={20} color="#10B981" />
                  <span>Vision unifiée 360°</span>
               </div>
               <div className="trust-item">
                  <CheckCircle2 size={20} color="#10B981" />
                  <span>Transferts instantanés</span>
               </div>
               <div className="trust-item">
                  <CheckCircle2 size={20} color="#10B981" />
                  <span>Score Crédit Certifié</span>
               </div>
            </div>
         </div>
         <div className="visual-overlay" />
      </div>

      {/* Form Column */}
      <div className="reg-form-side">
         <div className="reg-form-container">
            
            {step < 4 && (
              <div className="reg-progress">
                 <div className="progress-text">Étape {step} sur 3</div>
                 <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${(step/3)*100}%` }} />
                 </div>
              </div>
            )}

            {step === 1 && (
              <div className="reg-step-box">
                 <h2>Commençons par vous</h2>
                 <p className="reg-subtitle">Rejoignez Kandjou et gérez vos finances facilement avec une vision 360°.</p>
                 
                 <div className="auth-form">
                    <div className="input-group">
                       <label>Nom complet</label>
                       <div className="input-wrapper">
                          <User className="input-icon" size={20} />
                          <input type="text" placeholder="Ex: Mamadou Diallo" value={formData.fullname} onChange={e => setFormData({...formData, fullname: e.target.value})} />
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
                       <label>Email (optionnel)</label>
                       <div className="input-wrapper">
                          <Mail className="input-icon" size={20} />
                          <input type="email" placeholder="m.diallo@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                       </div>
                    </div>
                    {error && <p className="reg-error">{error}</p>}
                    <button className="btn-reg-next" onClick={nextStep}>Continuer <ChevronRight size={20} /></button>
                 </div>
              </div>
            )}

            {step === 2 && (
              <div className="reg-step-box">
                 <h2>Sécurité du compte</h2>
                 <p className="reg-subtitle">Définissez vos identifiants pour un accès sécurisé à votre espace.</p>
                 
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
                       <label>Confirmer le mot de passe</label>
                       <div className="input-wrapper">
                          <Lock className="input-icon" size={20} />
                          <input type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
                       </div>
                    </div>
                    <div className="reg-terms">
                       <input type="checkbox" id="terms" />
                       <label htmlFor="terms">J'accepte les conditions d'utilisation</label>
                    </div>
                    {error && <p className="reg-error">{error}</p>}
                    <div className="reg-btn-group">
                       <button className="btn-reg-back" onClick={() => setStep(1)}><ArrowLeft size={18} /> Retour</button>
                       <button className="btn-reg-next" onClick={nextStep}>Suivant <ChevronRight size={20} /></button>
                    </div>
                 </div>
              </div>
            )}

            {step === 3 && (
              <div className="reg-step-box">
                 <h2>Vérification SMS</h2>
                 <p className="reg-subtitle">Saisissez le code de vérification envoyé au <strong>{formData.phone}</strong></p>
                 
                 <div className="auth-form">
                    <div className="input-group">
                       <div className="otp-wrapper">
                          <Smartphone className="input-icon" size={24} />
                          <input type="text" maxLength="6" placeholder="0 0 0 0 0 0" className="otp-input" value={otp} onChange={e => setOtp(e.target.value)} />
                       </div>
                    </div>
                    <p className="resend-text">Renvoyer le code dans <span>59s</span></p>
                    {error && <p className="reg-error">{error}</p>}
                    <div className="reg-btn-group">
                       <button className="btn-reg-back" onClick={() => setStep(2)}>Retour</button>
                       <button className="btn-reg-next" onClick={handleRegister} disabled={loading}>
                          {loading ? <Loader2 className="spin" /> : "Vérifier et S'inscrire"}
                       </button>
                    </div>
                 </div>
              </div>
            )}

            {step === 4 && (
              <div className="reg-success">
                 <div className="success-icon-wrap">
                    <CheckCircle2 size={80} color="#10B981" />
                 </div>
                 <h2>Félicitations {formData.fullname.split(' ')[0]} !</h2>
                 <p>Votre compte Kandjou est maintenant actif. Vous pouvez dès à présent lier vos comptes Orange et MTN.</p>
                 <button className="btn-reg-next" onClick={() => navigate("/login")}>Accéder à mon Dashboard</button>
              </div>
            )}

            {step < 4 && (
              <div className="reg-footer">
                 <p>Déjà inscrit ? <Link to="/login">Connectez-vous</Link></p>
                 <div className="reg-security">
                    <ShieldCheck size={16} /> Données Ultra-Sécurisées (AES-256)
                 </div>
              </div>
            )}
         </div>
      </div>

      <style>{`
        .register-page-container { display: flex; min-height: 100vh; background: #fff; }
        .reg-visual-side { flex: 1.2; background: url('/register_branding.png') center/cover; position: relative; padding: 4rem; display: flex; align-items: center; color: #fff; }
        .visual-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0,98,51,0.9) 0%, rgba(30,41,59,0.7) 100%); z-index: 1; }
        .reg-visual-content { position: relative; z-index: 2; max-width: 500px; }
        .reg-logo { height: 40px; margin-bottom: 3rem; filter: brightness(0) invert(1); }
        .reg-visual-content h1 { font-size: 3rem; font-weight: 950; line-height: 1.1; margin-bottom: 1.5rem; letter-spacing: -1.5px; }
        .reg-visual-content p { font-size: 1.1rem; opacity: 0.9; line-height: 1.6; margin-bottom: 3rem; }
        .trust-points { display: flex; flex-direction: column; gap: 1rem; }
        .trust-item { display: flex; align-items: center; gap: 12px; font-weight: 700; font-size: 1rem; }

        .reg-form-side { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem; background: #fff; }
        .reg-form-container { width: 100%; max-width: 480px; }
        
        .reg-progress { margin-bottom: 3rem; }
        .progress-text { font-size: 0.75rem; font-weight: 900; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .progress-track { height: 6px; background: #F1F5F9; border-radius: 99px; overflow: hidden; }
        .progress-fill { height: 100%; background: #006233; transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1); }

        .reg-step-box h2 { font-size: 2.2rem; font-weight: 950; color: #1E293B; letter-spacing: -1px; margin-bottom: 0.5rem; }
        .reg-subtitle { color: #64748B; font-weight: 600; margin-bottom: 2.5rem; }

        .auth-form { display: flex; flex-direction: column; gap: 1.5rem; }
        .input-group label { display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px; }
        .input-wrapper { position: relative; }
        .input-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #94A3B8; }
        .input-wrapper input { width: 100%; padding: 1.1rem 1rem 1.1rem 3.5rem; border-radius: 16px; border: 2.5px solid #F1F5F9; background: #F8FAFC; font-size: 1rem; font-weight: 700; outline: none; transition: 0.2s; }
        .input-wrapper input:focus { border-color: #006233; background: #fff; box-shadow: 0 0 0 4px rgba(0,98,51,0.05); }
        .eye-btn { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); border: none; background: none; color: #94A3B8; cursor: pointer; }

        .reg-terms { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; color: #64748B; font-weight: 600; cursor: pointer; }
        .reg-error { color: #E11D48; font-size: 0.85rem; font-weight: 700; background: #FFF1F2; padding: 10px; border-radius: 8px; }

        .reg-btn-group { display: flex; gap: 1rem; margin-top: 1rem; }
        .btn-reg-back { flex: 0.5; background: #F1F5F9; border: none; padding: 1.1rem; border-radius: 16px; font-weight: 700; color: #475569; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-reg-next { flex: 1; background: #006233; color: #fff; border: none; padding: 1.1rem; border-radius: 16px; font-size: 1.1rem; font-weight: 800; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 10px 25px rgba(0,98,51,0.2); }
        .btn-reg-next:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(0,98,51,0.3); }

        .otp-wrapper { position: relative; display: flex; justify-content: center; align-items: center; }
        .otp-input { width: 100%; text-align: center; letter-spacing: 12px; font-size: 2rem; font-weight: 950; color: #1E293B; border: none; border-bottom: 3px solid #E2E8F0; padding: 1rem 0; outline: none; }
        .otp-input:focus { border-color: #006233; }
        .resend-text { text-align: center; font-size: 0.85rem; font-weight: 700; color: #94A3B8; margin: 1.5rem 0; }
        .resend-text span { color: #006233; }

        .reg-success { text-align: center; animation: fadeIn 0.5s ease; }
        .success-icon-wrap { margin-bottom: 2rem; }
        .reg-success h2 { font-size: 2.5rem; font-weight: 950; color: #1E293B; margin-bottom: 1rem; letter-spacing: -1.5px; }
        .reg-success p { color: #64748B; font-size: 1.1rem; line-height: 1.6; margin-bottom: 3rem; }

        .reg-footer { margin-top: 3rem; text-align: center; padding-top: 2rem; border-top: 1px solid #F1F5F9; }
        .reg-footer p { font-size: 0.95rem; color: #64748B; font-weight: 600; margin-bottom: 1.5rem; }
        .reg-footer a { color: #006233; font-weight: 800; text-decoration: none; }
        .reg-security { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.7rem; font-weight: 900; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 1024px) {
           .reg-visual-side { display: none; }
        }
      `}</style>
    </div>
  );
}
