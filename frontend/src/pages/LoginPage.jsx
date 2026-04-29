import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8000/m3";

const ROLE_ROUTES = {
  "Client": "/dashboard",
  "Agent de Crédit": "/agent",
  "Administrateur": "/admin",
  "Analyste Risque": "/risk",
  "Régulateur (BCRG)": "/audit",
};

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);

  // ─── Mot de passe oublié ───
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [resetError, setResetError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("kandjou_remember");
    if (saved) {
      setForm(prev => ({ ...prev, username: saved }));
      setRemember(true);
    }
  }, []);

  // ─── Login ───
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.username.trim() || !form.password.trim()) {
      setError("Tous les champs sont obligatoires.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/login`, {
        username: form.username.trim(),
        password: form.password,
      });
      const { token, role, fullname, language } = res.data;
      localStorage.setItem("kandjou_token", token);
      localStorage.setItem("kandjou_user", JSON.stringify({ username: form.username.trim(), role, fullname, language }));
      if (remember) localStorage.setItem("kandjou_remember", form.username.trim());
      else localStorage.removeItem("kandjou_remember");
      navigate(ROLE_ROUTES[role] || "/dashboard");
    } catch (err) {
      if (err.response?.status === 401) setError("Identifiants incorrects. Vérifiez votre numéro et mot de passe.");
      else if (err.response?.status === 403) setError("Votre compte est suspendu. Contactez l'administrateur.");
      else setError("Erreur de connexion au serveur. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Réinitialisation mot de passe ───
  const handleReset = async (e) => {
    e.preventDefault();
    setResetError("");
    if (!resetEmail.trim()) {
      setResetError("Veuillez saisir votre identifiant ou e-mail.");
      return;
    }
    setResetLoading(true);
    try {
      await axios.post(`${API}/auth/reset-password`, { username: resetEmail.trim() });
      setResetDone(true);
    } catch {
      // On affiche toujours un succès pour ne pas révéler si le compte existe
      setResetDone(true);
    } finally {
      setResetLoading(false);
    }
  };

  // ─── ÉCRAN RÉINITIALISATION ───
  if (showReset) {
    return (
      <div style={S.page}>
        <style>{CSS}</style>
        <div style={S.bgDeco1} />
        <div style={S.bgDeco2} />
        <div className="login-card" style={S.card}>
          <div style={S.greenHeader}>
            <img src="/logo_kandjou.png" alt="Kandjou" style={S.logoImg} onClick={() => navigate("/")} />
          </div>
          <div style={S.body}>
            {!resetDone ? (
              <>
                {/* Bouton retour */}
                <button onClick={() => { setShowReset(false); setResetDone(false); setResetError(""); setResetEmail(""); }} style={S.backBtn}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
                  Retour à la connexion
                </button>

                <div style={{ marginBottom: "1.8rem", marginTop: "0.5rem" }}>
                  <h1 style={S.title}>Mot de passe oublié ?</h1>
                  <p style={S.subtitle}>Saisissez votre identifiant ou adresse e-mail. Nous vous enverrons un lien de réinitialisation.</p>
                </div>

                <form onSubmit={handleReset} style={S.form}>
                  <div style={S.fieldGroup}>
                    <label style={S.label}>Identifiant ou e-mail</label>
                    <div style={S.inputWrap}>
                      <div style={S.inputIcon}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                      </div>
                      <input
                        className="login-input"
                        type="text"
                        placeholder="client@kandjou.gn ou +224..."
                        style={S.input}
                        value={resetEmail}
                        onChange={e => setResetEmail(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>

                  {resetError && (
                    <div style={S.errorBox}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      <span>{resetError}</span>
                    </div>
                  )}

                  <button type="submit" disabled={resetLoading} className="login-btn" style={{ ...S.btnLogin, opacity: resetLoading ? 0.6 : 1, cursor: resetLoading ? "wait" : "pointer" }}>
                    {resetLoading ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                        <span style={S.spinnerStyle} />
                        Envoi en cours...
                      </span>
                    ) : "Envoyer le lien de réinitialisation"}
                  </button>
                </form>
              </>
            ) : (
              /* ─── MESSAGE DE CONFIRMATION ─── */
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                <div style={{ width: 70, height: 70, background: "#E8F5EE", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#006233" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <h2 style={{ fontSize: "1.35rem", fontWeight: 900, color: "#1E293B", marginBottom: "0.8rem" }}>E-mail envoyé !</h2>
                <p style={{ fontSize: "0.88rem", color: "#64748B", fontWeight: 500, lineHeight: 1.6, marginBottom: "2rem" }}>
                  Si un compte est associé à <strong style={{ color: "#1E293B" }}>{resetEmail}</strong>, vous recevrez un lien de réinitialisation dans quelques instants.
                </p>
                <p style={{ fontSize: "0.78rem", color: "#94A3B8", fontWeight: 600, marginBottom: "2rem" }}>
                  Pensez à vérifier votre dossier spam.
                </p>
                <button onClick={() => { setShowReset(false); setResetDone(false); setResetEmail(""); }} className="login-btn" style={{ ...S.btnLogin, cursor: "pointer" }}>
                  Retour à la connexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── ÉCRAN PRINCIPAL (LOGIN) ───
  return (
    <div style={S.page}>
      <style>{CSS}</style>
      <div style={S.bgDeco1} />
      <div style={S.bgDeco2} />

      <div className="login-card" style={S.card}>
        {/* ── Bandeau vert + logo ── */}
        <div style={S.greenHeader}>
          <img src="/logo_kandjou.png" alt="Kandjou" style={S.logoImg} onClick={() => navigate("/")} />
        </div>

        <div style={S.body}>
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={S.title}>Bienvenue sur Kandjou</h1>
            <p style={S.subtitle}>Connectez-vous à votre espace sécurisé pour accéder à vos comptes Mobile Money en Guinée.</p>
          </div>

          <form onSubmit={handleLogin} style={S.form}>
            {/* Numéro de téléphone */}
            <div style={S.fieldGroup}>
              <label style={S.label}>Numéro de téléphone</label>
              <div style={S.inputWrap}>
                <div style={S.inputIcon}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <input className="login-input" type="text" placeholder="+224 6XX XX XX XX" autoComplete="username" style={S.input} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
              </div>
            </div>

            {/* Mot de passe */}
            <div style={S.fieldGroup}>
              <label style={S.label}>Mot de passe</label>
              <div style={S.inputWrap}>
                <div style={S.inputIcon}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <input className="login-input" type={showPwd ? "text" : "password"} placeholder="••••••••••" autoComplete="current-password" style={S.input} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                <button type="button" className="pwd-eye" onClick={() => setShowPwd(!showPwd)} style={S.pwdToggle} tabIndex={-1}>
                  {showPwd ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Options */}
            <div style={S.optionsRow}>
              <label style={S.checkLabel}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ accentColor: "#006233", width: 15, height: 15, cursor: "pointer" }} />
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748B" }}>Se souvenir de moi</span>
              </label>
              <span style={S.forgotLink} onClick={() => setShowReset(true)}>
                Mot de passe oublié ?
              </span>
            </div>

            {/* Erreur */}
            {error && (
              <div style={S.errorBox}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                <span>{error}</span>
              </div>
            )}

            {/* Bouton */}
            <button type="submit" disabled={loading} className="login-btn" style={{ ...S.btnLogin, opacity: loading ? 0.6 : 1, cursor: loading ? "wait" : "pointer" }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                  <span style={S.spinnerStyle} />
                  Connexion en cours...
                </span>
              ) : "Se connecter"}
            </button>
          </form>

          {/* Séparateur */}
          <div style={S.sep}>
            <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1 }}>ou</span>
            <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
          </div>

          <p style={S.registerRow}>
            Nouveau sur Kandjou ?{" "}
            <span style={S.registerLink} onClick={() => navigate("/register")}>Créer un compte</span>
          </p>

          <div style={S.secFooter}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Connexion sécurisée SSL 256-bit</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════ CSS global ══════════
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .login-card { animation: cardIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }
  @keyframes cardIn { from { opacity:0; transform:translateY(24px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes spin { to { transform:rotate(360deg); } }
  .login-input:focus { border-color:#006233!important; background:#fff!important; box-shadow:0 0 0 4px rgba(0,98,51,0.08)!important; }
  .login-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 16px 36px rgba(0,98,51,0.35)!important; }
  .login-btn:active:not(:disabled) { transform:translateY(0) scale(0.98); }
  .pwd-eye:hover { color:#006233!important; }
`;

// ══════════ STYLES ══════════
const S = {
  page: { minHeight: "100vh", fontFamily: "'Plus Jakarta Sans',sans-serif", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", position: "relative", overflow: "hidden" },
  bgDeco1: { position: "absolute", top: "-12%", right: "-8%", width: "45%", height: "55%", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,98,51,0.04) 0%, transparent 70%)", zIndex: 0 },
  bgDeco2: { position: "absolute", bottom: "-15%", left: "-10%", width: "50%", height: "55%", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,98,51,0.04) 0%, transparent 70%)", zIndex: 0 },

  card: { width: "100%", maxWidth: 440, background: "#fff", borderRadius: 28, overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03)", position: "relative", zIndex: 1 },
  greenHeader: { background: "linear-gradient(135deg, #003D20 0%, #006233 60%, #008C46 100%)", padding: "1.8rem 2.5rem", display: "flex", alignItems: "center", justifyContent: "center" },
  logoImg: { height: 48, objectFit: "contain", cursor: "pointer" },
  body: { padding: "2.2rem 2.5rem 2rem" },

  title: { fontSize: "1.5rem", fontWeight: 900, color: "#1E293B", letterSpacing: "-0.8px", marginBottom: "0.5rem" },
  subtitle: { fontSize: "0.85rem", color: "#64748B", fontWeight: 500, lineHeight: 1.55 },

  form: { display: "flex", flexDirection: "column", gap: "1.3rem" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "7px" },
  label: { fontSize: "0.7rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: 1.1 },
  inputWrap: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: { position: "absolute", left: "15px", display: "flex", alignItems: "center", pointerEvents: "none", zIndex: 1 },
  input: { width: "100%", background: "#F8FAFC", border: "2px solid #E2E8F0", borderRadius: 14, padding: "0.95rem 0.95rem 0.95rem 46px", fontSize: "0.92rem", fontWeight: 600, color: "#1E293B", outline: "none", transition: "all 0.25s ease" },
  pwdToggle: { position: "absolute", right: "12px", background: "none", border: "none", cursor: "pointer", color: "#94A3B8", display: "flex", alignItems: "center", padding: "4px", transition: "color 0.2s" },

  optionsRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  checkLabel: { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" },
  forgotLink: { fontSize: "0.78rem", fontWeight: 700, color: "#006233", cursor: "pointer", transition: "opacity 0.2s" },

  errorBox: { display: "flex", alignItems: "center", gap: "10px", background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: 12, padding: "0.85rem 1.1rem", fontSize: "0.8rem", fontWeight: 700, color: "#DC2626" },

  btnLogin: { width: "100%", background: "linear-gradient(135deg, #006233 0%, #008C46 100%)", color: "#fff", border: "none", borderRadius: 16, padding: "1.1rem", fontSize: "0.95rem", fontWeight: 800, boxShadow: "0 12px 28px rgba(0,98,51,0.25)", transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)", marginTop: "0.3rem" },
  spinnerStyle: { display: "inline-block", width: 17, height: 17, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" },

  sep: { display: "flex", alignItems: "center", gap: "14px", margin: "1.8rem 0" },
  registerRow: { textAlign: "center", fontSize: "0.88rem", color: "#64748B", fontWeight: 600 },
  registerLink: { color: "#006233", fontWeight: 800, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px" },
  secFooter: { display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", marginTop: "2rem", fontSize: "0.68rem", fontWeight: 600, color: "#94A3B8" },

  backBtn: { display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "#006233", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", padding: 0, marginBottom: "0.5rem" },
};
