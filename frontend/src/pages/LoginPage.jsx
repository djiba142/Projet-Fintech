import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Phone, 
  Lock, 
  ChevronRight, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Loader2,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logoKandjou from "../assets/logo_kandjou.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const success = await login(phone, password);
      if (success) navigate("/dashboard");
      else setError("Identifiants incorrects. Veuillez réessayer.");
    } catch (err) {
      setError("Une erreur est survenue. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      {/* Left Visual Side */}
      <div className="login-visual">
         <div className="visual-content">
            <img src={logoKandjou} alt="Kandjou Logo" className="login-logo-top" />
            <h1 className="visual-title">Le futur de la finance <br/>en Guinée est ici.</h1>
            <p className="visual-subtitle">
               Gérez vos comptes Orange Money, MTN MoMo et vos crédits sur une plateforme unique, sécurisée et certifiée par la BCRG.
            </p>
            <div className="visual-stats">
               <div className="v-stat">
                  <strong>250k+</strong>
                  <span>Utilisateurs</span>
               </div>
               <div className="v-stat">
                  <strong>99.9%</strong>
                  <span>Disponibilité</span>
               </div>
            </div>
         </div>
         <div className="visual-overlay" />
      </div>

      {/* Right Form Side */}
      <div className="login-form-side">
         <div className="form-container">
            <div className="form-header">
               <h2>Connexion Sécurisée</h2>
               <p>Saisissez vos identifiants pour accéder à votre espace.</p>
            </div>

            {error && (
              <div className="error-box">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
               <div className="input-group">
                  <label>Numéro de téléphone</label>
                  <div className="input-wrapper">
                     <Phone className="input-icon" size={20} />
                     <input 
                       type="text" 
                       placeholder="Ex: 622 00 00 00" 
                       value={phone} 
                       onChange={(e) => setPhone(e.target.value)}
                       required
                     />
                  </div>
               </div>

               <div className="input-group">
                  <label>Mot de passe</label>
                  <div className="input-wrapper">
                     <Lock className="input-icon" size={20} />
                     <input 
                       type={showPassword ? "text" : "password"} 
                       placeholder="••••••••" 
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       required
                     />
                     <button 
                       type="button" 
                       className="eye-btn" 
                       onClick={() => setShowPassword(!showPassword)}
                     >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                     </button>
                  </div>
               </div>

               <div className="form-options">
                  <label className="checkbox-wrap">
                     <input type="checkbox" />
                     <span>Se souvenir de moi</span>
                  </label>
                  <Link to="/forgot-password" title="Mot de passe oublié ?" className="forgot-link">Mot de passe oublié ?</Link>
               </div>

               <button type="submit" className="btn-auth-submit" disabled={loading}>
                  {loading ? (
                    <><Loader2 className="spin" size={20} /> Vérification...</>
                  ) : (
                    <>Se connecter <ChevronRight size={20} /></>
                  )}
               </button>
            </form>

            <div className="form-footer">
               <p>Nouveau sur la plateforme ? <Link to="/register">Créer un compte</Link></p>
            </div>

            <div className="security-badge">
               <ShieldCheck size={16} color="#10B981" />
               <span>Chiffrement de bout en bout actif</span>
            </div>
         </div>
      </div>

      <style>{`
        .login-page-container { display: flex; min-height: 100vh; background: #fff; font-family: 'Inter', sans-serif; }
        .login-visual { flex: 1.2; background: url('/kandjou_login_bg.png') center/cover; position: relative; display: flex; align-items: center; padding: 4rem; color: #fff; }
        .visual-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0,98,51,0.95) 0%, rgba(30,41,59,0.8) 100%); z-index: 1; }
        .visual-content { position: relative; z-index: 2; max-width: 500px; }
        .login-logo-top { height: 40px; margin-bottom: 3rem; filter: brightness(0) invert(1); }
        .visual-title { font-size: 3.5rem; font-weight: 950; line-height: 1.1; margin-bottom: 1.5rem; letter-spacing: -2px; }
        .visual-subtitle { font-size: 1.1rem; opacity: 0.9; line-height: 1.6; margin-bottom: 3rem; }
        .visual-stats { display: flex; gap: 3rem; }
        .v-stat { display: flex; flex-direction: column; }
        .v-stat strong { font-size: 1.8rem; font-weight: 900; }
        .v-stat span { font-size: 0.85rem; opacity: 0.7; font-weight: 600; }

        .login-form-side { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem; background: #fff; }
        .form-container { width: 100%; max-width: 420px; }
        .form-header { margin-bottom: 2.5rem; }
        .form-header h2 { font-size: 2rem; font-weight: 950; color: #1E293B; letter-spacing: -1px; margin-bottom: 0.5rem; }
        .form-header p { color: #64748B; font-weight: 600; }

        .error-box { background: #FFF1F2; color: #E11D48; padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px; font-size: 0.9rem; font-weight: 700; border: 1px solid #FFE4E6; }

        .auth-form { display: flex; flex-direction: column; gap: 1.5rem; }
        .input-group label { display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px; }
        .input-wrapper { position: relative; }
        .input-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #94A3B8; transition: 0.2s; }
        .input-wrapper input { width: 100%; padding: 1.1rem 1rem 1.1rem 3.5rem; border-radius: 14px; border: 2px solid #F1F5F9; background: #F8FAFC; font-size: 1rem; font-weight: 700; color: #1E293B; outline: none; transition: 0.2s; }
        .input-wrapper input:focus { border-color: #006233; background: #fff; box-shadow: 0 0 0 4px rgba(0,98,51,0.05); }
        .input-wrapper input:focus + .input-icon { color: #006233; }
        .eye-btn { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); border: none; background: none; color: #94A3B8; cursor: pointer; display: flex; align-items: center; }

        .form-options { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; }
        .checkbox-wrap { display: flex; align-items: center; gap: 8px; font-weight: 600; color: #64748B; cursor: pointer; }
        .forgot-link { color: #006233; font-weight: 700; text-decoration: none; }

        .btn-auth-submit { background: #1E293B; color: #fff; border: none; padding: 1.2rem; border-radius: 16px; font-size: 1.1rem; font-weight: 800; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 1rem; box-shadow: 0 10px 25px rgba(30,41,59,0.15); }
        .btn-auth-submit:hover { background: #0F172A; transform: translateY(-2px); box-shadow: 0 15px 30px rgba(30,41,59,0.25); }
        .btn-auth-submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

        .form-footer { margin-top: 2.5rem; text-align: center; font-size: 0.95rem; color: #64748B; font-weight: 600; }
        .form-footer a { color: #006233; font-weight: 800; text-decoration: none; margin-left: 5px; }

        .security-badge { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 3rem; font-size: 0.75rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        @media (max-width: 1024px) {
           .login-visual { display: none; }
           .login-form-side { flex: 1; }
        }
      `}</style>
    </div>
  );
}
