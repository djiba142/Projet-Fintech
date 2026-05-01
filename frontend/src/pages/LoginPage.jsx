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
      const res = await login(phone, password);
      if (res.success) navigate("/dashboard");
      else setError(res.message || "Identifiants incorrects.");
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion.");
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
            <h1 className="visual-title">L'excellence financière <br/>pour chaque Guinéen.</h1>
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
                  <span>Sécurisé</span>
               </div>
            </div>
         </div>
         <div className="visual-overlay" />
      </div>

      {/* Right Form Side */}
      <div className="login-form-side">
         <div className="form-container">
            <div className="form-header">
               <h2>Bon retour parmi nous</h2>
               <p>Saisissez vos identifiants pour accéder à votre espace sécurisé.</p>
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
                  <Link to="#" className="forgot-link">Mot de passe oublié ?</Link>
               </div>

               <button type="submit" className="btn-auth-submit" disabled={loading}>
                  {loading ? (
                    <><Loader2 className="spin" size={20} /> Connexion en cours...</>
                  ) : (
                    <>Se connecter <ChevronRight size={20} /></>
                  )}
               </button>
            </form>

            <div className="form-footer">
               <p>Nouveau sur Kandjou ? <Link to="/register">Créer un compte</Link></p>
            </div>

            <div className="security-badge">
               <ShieldCheck size={16} color="#006233" />
               <span>Chiffrement AES-256 Actif</span>
            </div>
         </div>
      </div>

      <style>{`
        .login-page-container { display: flex; min-height: 100vh; background: #fff; font-family: 'Plus Jakarta Sans', sans-serif; }
        
        .login-visual { 
          flex: 1.2; 
          background: url('/kandjou_login_bg.png') center/cover; 
          position: relative; 
          display: flex; 
          align-items: center; 
          padding: 4rem; 
          color: #fff; 
        }
        .visual-overlay { 
          position: absolute; 
          inset: 0; 
          background: linear-gradient(135deg, rgba(0, 98, 51, 0.95) 0%, rgba(15, 23, 42, 0.85) 100%); 
          z-index: 1; 
        }
        .visual-content { position: relative; z-index: 2; max-width: 500px; }
        .login-logo-top { height: 45px; margin-bottom: 4rem; filter: brightness(0) invert(1); }
        .visual-title { font-size: 3.8rem; font-weight: 950; line-height: 1.1; margin-bottom: 1.5rem; letter-spacing: -2px; }
        .visual-subtitle { font-size: 1.2rem; opacity: 0.9; line-height: 1.7; margin-bottom: 4rem; font-weight: 500; }
        .visual-stats { display: flex; gap: 4rem; }
        .v-stat { display: flex; flex-direction: column; gap: 4px; }
        .v-stat strong { font-size: 2rem; font-weight: 900; }
        .v-stat span { font-size: 0.9rem; opacity: 0.7; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }

        .login-form-side { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem; background: #fff; }
        .form-container { width: 100%; max-width: 440px; }
        .form-header { margin-bottom: 3rem; }
        .form-header h2 { font-size: 2.2rem; font-weight: 950; color: #1E293B; letter-spacing: -1.5px; margin-bottom: 0.8rem; }
        .form-header p { color: #64748B; font-weight: 600; font-size: 1rem; }

        .error-box { background: #FFF1F2; color: #E11D48; padding: 1.2rem; border-radius: 16px; margin-bottom: 2rem; display: flex; align-items: center; gap: 12px; font-size: 0.95rem; font-weight: 700; border: 1.5px solid #FFE4E6; }

        .auth-form { display: flex; flex-direction: column; gap: 1.8rem; }
        .input-group label { display: block; font-size: 0.85rem; font-weight: 800; color: #475569; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .input-wrapper { position: relative; }
        .input-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: #94A3B8; transition: 0.3s; }
        .input-wrapper input { width: 100%; padding: 1.2rem 1rem 1.2rem 3.8rem; border-radius: 18px; border: 2px solid #F1F5F9; background: #F8FAFC; font-size: 1.05rem; font-weight: 700; color: #1E293B; outline: none; transition: 0.3s; }
        .input-wrapper input:focus { border-color: #006233; background: #fff; box-shadow: 0 0 0 5px rgba(0, 98, 51, 0.05); }
        .input-wrapper input:focus + .input-icon { color: #006233; }
        .eye-btn { position: absolute; right: 18px; top: 50%; transform: translateY(-50%); border: none; background: none; color: #94A3B8; cursor: pointer; display: flex; align-items: center; }

        .form-options { display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; }
        .checkbox-wrap { display: flex; align-items: center; gap: 10px; font-weight: 700; color: #64748B; cursor: pointer; }
        .forgot-link { color: #006233; font-weight: 800; text-decoration: none; }

        .btn-auth-submit { 
          background: #1E293B; 
          color: #fff; 
          border: none; 
          padding: 1.3rem; 
          border-radius: 20px; 
          font-size: 1.1rem; 
          font-weight: 800; 
          cursor: pointer; 
          transition: 0.3s; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 12px; 
          margin-top: 1rem; 
          box-shadow: 0 12px 30px rgba(30,41,59,0.15); 
        }
        .btn-auth-submit:hover { background: #0F172A; transform: translateY(-2px); box-shadow: 0 18px 40px rgba(30,41,59,0.25); }
        .btn-auth-submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

        .form-footer { margin-top: 3rem; text-align: center; font-size: 1rem; color: #64748B; font-weight: 600; }
        .form-footer a { color: #006233; font-weight: 900; text-decoration: none; margin-left: 6px; }

        .security-badge { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 4rem; font-size: 0.8rem; font-weight: 900; color: #94A3B8; text-transform: uppercase; letter-spacing: 1.5px; }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        @media (max-width: 1024px) {
           .login-visual { display: none; }
           .login-form-side { flex: 1; padding: 1.5rem; }
        }
      `}</style>
    </div>
  );
}
