import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  ChevronLeft
} from "lucide-react";
import logoKandjou from "../assets/logo_kandjou.png";
import loginBg from "../assets/kandjou_login_bg.png";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ROLE_ROUTES = {
  "Client": "/dashboard",
  "Agent de Crédit": "/agent",
  "Administrateur": "/admin",
  "Analyste Risque": "/risk",
  "Régulateur (BCRG)": "/audit",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(ROLE_ROUTES[user.role] || "/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.username.trim() || !form.password.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    const result = await login(form.username.trim(), form.password);
    if (!result.success) {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <style>{CSS}</style>

      {/* ── LEFT: VISUAL (PREMIUM SPLIT) ── */}
      <div style={S.visualSide}>
         <div style={S.overlay} />
         <div style={S.visualContent}>
            <img src={logoKandjou} alt="Kandjou" style={S.logoVisual} />
            <div style={{ marginTop: "auto" }}>
               <h1 style={S.visualTitle}>Le futur de la finance <br/>en Guinée est ici.</h1>
               <p style={S.visualText}>Gérez vos comptes Orange Money, MTN MoMo et vos crédits sur une plateforme unique, sécurisée et certifiée par la BCRG.</p>
               <div style={S.visualStats}>
                  <div style={S.vStat}>
                     <div style={S.vStatVal}>2.4M</div>
                     <div style={S.vStatLab}>Utilisateurs</div>
                  </div>
                  <div style={S.vStat}>
                     <div style={S.vStatVal}>99.9%</div>
                     <div style={S.vStatLab}>Uptime</div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* ── RIGHT: FORM ── */}
      <div style={S.formSide}>
         <div style={S.formScroll}>
            <div style={S.formCard}>
               <div style={{ marginBottom: "2.5rem" }}>
                  <img src={logoKandjou} alt="Logo" style={S.formLogo} />
                  <h2 style={S.formTitle}>Connexion Sécurisée</h2>
                  <p style={S.formSubtitle}>Saisissez vos identifiants pour accéder à votre espace.</p>
               </div>

               <form onSubmit={handleLogin} style={S.form}>
                  <div style={S.inputGroup}>
                     <label style={S.label}>Numéro de téléphone</label>
                     <div style={S.inputWrap}>
                        <Phone size={18} style={S.inputIcon} />
                        <input 
                           type="text" 
                           placeholder="Ex: 622 00 00 00" 
                           value={form.username}
                           onChange={e => setForm({...form, username: e.target.value})}
                           style={S.input}
                        />
                     </div>
                  </div>

                  <div style={S.inputGroup}>
                     <label style={S.label}>Mot de passe</label>
                     <div style={S.inputWrap}>
                        <Lock size={18} style={S.inputIcon} />
                        <input 
                           type={showPwd ? "text" : "password"} 
                           placeholder="••••••••••••" 
                           value={form.password}
                           onChange={e => setForm({...form, password: e.target.value})}
                           style={S.input}
                        />
                        <button type="button" onClick={() => setShowPwd(!showPwd)} style={S.eyeBtn}>
                           {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                     </div>
                  </div>

                  <div style={S.options}>
                     <label style={S.remember}>
                        <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                        Se souvenir de moi
                     </label>
                     <button type="button" onClick={() => setShowReset(true)} style={S.forgot}>Mot de passe oublié ?</button>
                  </div>

                  {error && (
                     <div style={S.error}>
                        <AlertCircle size={16} /> {error}
                     </div>
                  )}

                  <button type="submit" disabled={loading} style={S.submitBtn}>
                     {loading ? "Vérification..." : "Se connecter"}
                     {!loading && <ArrowRight size={18} style={{ marginLeft: 8 }} />}
                  </button>
               </form>

               <div style={S.footer}>
                  <p style={S.noAccount}>Nouveau sur la plateforme ? <button onClick={() => navigate("/register")} style={S.regLink}>Créer un compte</button></p>
                  <div style={S.secBadge}>
                     <ShieldCheck size={14} color="#10B981" />
                     Chiffrement de bout en bout actif
                  </div>
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  body { margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
  input:focus { border-color: #006233 !important; outline: none; box-shadow: 0 0 0 4px rgba(0,98,51,0.1); }
  .submit-hover:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0,98,51,0.25); }
`;

const S = {
  page: { display: "flex", height: "100vh", background: "#fff", overflow: "hidden" },
  
  visualSide: { 
    flex: 1.2, 
    background: `url(${loginBg})`, 
    backgroundSize: "cover", 
    backgroundPosition: "center",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    padding: "2.5rem",
  },
  overlay: { position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,30,16,0.85), rgba(0,40,20,0.95))" },
  visualContent: { position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" },
  logoVisual: { height: 45, width: "fit-content", objectFit: "contain" },
  visualTitle: { color: "#fff", fontSize: "2.5rem", fontWeight: 950, letterSpacing: -1.5, lineHeight: 1.1, marginBottom: "1rem" },
  visualText: { color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", fontWeight: 500, lineHeight: 1.5, maxWidth: 420 },
  visualStats: { display: "flex", gap: "2.5rem", marginTop: "2rem" },
  vStatVal: { color: "#fff", fontSize: "1.5rem", fontWeight: 900 },
  vStatLab: { color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 },

  formSide: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC" },
  formScroll: { width: "100%", maxWidth: 440, padding: "1.5rem" },
  formCard: { background: "#fff", padding: "2rem", borderRadius: 28, boxShadow: "0 15px 40px rgba(0,0,0,0.04)", border: "1px solid #E2E8F0" },
  mobileLogo: { height: 40, marginBottom: "2rem", display: "none" },
  formTitle: { fontSize: "1.5rem", fontWeight: 950, color: "#0F172A", margin: 0, letterSpacing: -0.8 },
  formSubtitle: { fontSize: "0.8rem", color: "#64748B", fontWeight: 600, marginTop: 6 },
  formLogo: { height: 40, marginBottom: "1rem", display: "block" },

  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  inputGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: "0.7rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5 },
  inputWrap: { position: "relative" },
  inputIcon: { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" },
  input: { width: "100%", padding: "12px 12px 12px 44px", borderRadius: 12, border: "2px solid #F1F5F9", background: "#F8FAFC", fontSize: "0.9rem", fontWeight: 600, transition: "0.2s" },
  eyeBtn: { position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94A3B8", cursor: "pointer" },

  options: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" },
  remember: { display: "flex", alignItems: "center", gap: 8, color: "#64748B", fontWeight: 600, cursor: "pointer" },
  forgot: { background: "none", border: "none", color: "#006233", fontWeight: 800, cursor: "pointer" },

  error: { padding: "12px", background: "#FEF2F2", borderRadius: 12, color: "#DC2626", fontSize: "0.85rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 10 },
  submitBtn: { 
    width: "100%", padding: "0.9rem", borderRadius: 14, border: "none", 
    background: "linear-gradient(135deg, #006233 0%, #004D28 100%)", color: "#fff", 
    fontSize: "0.9rem", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 8px 20px rgba(0,98,51,0.2)", transition: "0.2s"
  },

  footer: { marginTop: "1.5rem", textAlign: "center" },
  noAccount: { fontSize: "0.8rem", color: "#64748B", fontWeight: 600 },
  regLink: { background: "none", border: "none", color: "#006233", fontWeight: 900, cursor: "pointer", textDecoration: "underline" },
  secBadge: { marginTop: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: "0.7rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }
};
