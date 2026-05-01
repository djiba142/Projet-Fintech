import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoKandjou from "../assets/logo_kandjou.png";
import brandingImg from "../assets/register_branding.png";
import { translations } from "../i18n";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState(localStorage.getItem("kandjou_lang") || "FR");

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("kandjou_lang") || "FR");
    window.addEventListener("languageChange", handleLangChange);
    return () => window.removeEventListener("languageChange", handleLangChange);
  }, []);

  const t = translations[lang];
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ nom: "", tel: "", email: "", mdp: "", mdpConfirm: "", parrainage: "", code: "" });
  const [showMdp, setShowMdp] = useState(false);
  const [cgv, setCgv] = useState(false);

  const next = () => { if (step < 4) setStep(step + 1); };
  const prev = () => { if (step > 1) setStep(step - 1); };

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
        body { background: #fff; }
        .fade-in { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        input:focus { border-color: #2D6A4F !important; background: #fff !important; box-shadow: 0 0 0 4px rgba(45, 106, 79, 0.05); }
      `}</style>

      {/* LEFT: Branding Experience */}
      <div style={s.left}>
        <div style={s.leftContent}>
          <div style={s.logoWrap} onClick={() => navigate("/")}>
            <img src={logoKandjou} alt="Kandjou Logo" style={{ ...s.logoImg, filter: "brightness(0) invert(1)" }} />
          </div>

          <div style={s.brandingInfo}>
            <h1 style={s.brandingH1}>Ouvrez les portes de l'interopérabilité.</h1>
            <p style={s.brandingP}>
              Kandjou est plus qu'un agrégateur. C'est votre partenaire de croissance. 
              Centralisez vos avoirs Orange Money et MTN MoMo pour une gestion sans barrière, 
              sécurisée par les standards les plus rigoureux de la BCRG.
            </p>
          </div>

          <div style={s.imageBox}>
            <img src={brandingImg} alt="Kandjou Experience" style={s.mainImg} />
          </div>

          <div style={s.trust}>
            <div style={s.trustItem}>✅ Vision unifiée 360°</div>
            <div style={s.trustDivider} />
            <div style={s.trustItem}>✅ Transferts instantanés</div>
            <div style={s.trustDivider} />
            <div style={s.trustItem}>✅ Score Crédit Certifié</div>
          </div>
        </div>
      </div>

      {/* RIGHT: Flow */}
      <div style={s.right}>
        <div style={s.formWrapper}>
          
          <div style={s.formHeader}>
            <img src={logoKandjou} alt="Kandjou" style={{ height: 35, marginBottom: "0.8rem" }} />
            <h2 style={s.formH2}>Créer un compte</h2>
            <p style={s.formP}>Étape {step} sur 3 — {step === 1 ? t.step1 : step === 2 ? t.step2 : t.step3}</p>
          </div>

          <div style={s.stepper}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ ...s.stepCircle, ...(step >= i ? s.stepCircleActive : {}) }}>
                {step > i ? "✓" : i}
              </div>
            ))}
          </div>

          <div className="fade-in" key={step} style={s.card}>
            {step === 1 && (
              <div>
                <h3 style={s.cardTitle}>Commençons par vous</h3>
                <p style={s.cardSubtitle}>Rejoignez Kandjou et gérez vos finances facilement avec une vision 360°.</p>
                
                <div style={s.inputWrapper}>
                  <label style={s.label}>Nom complet *</label>
                  <input type="text" placeholder="Ex: Kadiatou Bah" style={s.input}
                    value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} />
                </div>
                <div style={s.inputWrapper}>
                  <label style={s.label}>Numéro de téléphone *</label>
                  <div style={s.telRow}>
                    <div style={s.telCode}>+224</div>
                    <input type="tel" placeholder="620 00 00 00" style={s.telInput}
                      value={form.tel} onChange={e => setForm({...form, tel: e.target.value})} />
                  </div>
                </div>
                <div style={s.inputWrapper}>
                  <label style={s.label}>Email (optionnel)</label>
                  <input type="email" placeholder="kadiatou@email.com" style={s.input}
                    value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <button style={{ ...s.btnPrim, opacity: (form.nom && form.tel) ? 1 : 0.4 }}
                  disabled={!form.nom || !form.tel} onClick={next}>
                  Continuer
                </button>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 style={s.cardTitle}>Sécurité du compte</h3>
                <p style={s.cardSubtitle}>Définissez vos identifiants pour un accès sécurisé à votre espace.</p>
                
                <div style={s.inputWrapper}>
                  <label style={s.label}>Mot de passe *</label>
                  <input type={showMdp ? "text" : "password"} placeholder="8 caractères minimum" style={s.input}
                    value={form.mdp} onChange={e => setForm({...form, mdp: e.target.value})} />
                </div>
                <div style={s.inputWrapper}>
                  <label style={s.label}>Confirmer le mot de passe *</label>
                  <input type={showMdp ? "text" : "password"} placeholder="Répétez le mot de passe" style={s.input}
                    value={form.mdpConfirm} onChange={e => setForm({...form, mdpConfirm: e.target.value})} />
                </div>
                <div style={s.optionRow} onClick={() => setShowMdp(!showMdp)}>
                  <div style={{ ...s.check, ...(showMdp ? s.checkOn : {}) }}>{showMdp && "✓"}</div>
                  <span style={s.optionLabel}>Afficher le mot de passe</span>
                </div>
                <div style={s.optionRow} onClick={() => setCgv(!cgv)}>
                  <div style={{ ...s.check, ...(cgv ? s.checkOn : {}) }}>{cgv && "✓"}</div>
                  <span style={s.optionLabel}>J'accepte les conditions d'utilisation</span>
                </div>
                <div style={s.btnRow}>
                  <button style={s.btnSec} onClick={prev}>Retour</button>
                  <button style={{ ...s.btnPrim, opacity: (form.mdp && form.mdp === form.mdpConfirm && cgv) ? 1 : 0.4 }}
                    disabled={!form.mdp || form.mdp !== form.mdpConfirm || !cgv} onClick={next}>
                    Suivant
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h3 style={s.cardTitle}>Vérification SMS</h3>
                <p style={s.cardSubtitle}>Saisissez le code de vérification envoyé au <strong>+224 {form.tel}</strong></p>
                
                <div style={s.inputWrapper}>
                  <input type="text" maxLength="6" placeholder="· · · · · ·" style={s.codeInput}
                    value={form.code} onChange={e => setForm({...form, code: e.target.value})} />
                </div>
                <p style={s.resend}>Renvoyer le code dans 00:59</p>
                <div style={s.btnRow}>
                  <button style={s.btnSec} onClick={prev}>Retour</button>
                  <button style={{ ...s.btnPrim, opacity: form.code.length >= 4 ? 1 : 0.4 }}
                    disabled={form.code.length < 4} onClick={next}>
                    Vérifier
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div style={s.success}>
                <div style={s.successCircle}>✓</div>
                <h3 style={s.successH3}>{t.successTitle}</h3>
                <p style={s.successP}>Félicitations <strong>{form.nom}</strong>. Votre compte Kandjou est maintenant actif et prêt à l'emploi.</p>
                <button style={s.btnPrim} onClick={() => navigate("/login")}>{t.login}</button>
              </div>
            )}
          </div>

          {step < 4 && (
            <p style={s.footerLink}>
              Déjà un compte ? <span style={s.link} onClick={() => navigate("/login")}>Se connecter</span>
            </p>
          )}

          <div style={s.secureBadge}>
            <span style={{ fontSize: "1.4rem" }}>🛡️</span>
            <div>
              <div style={s.secureTitle}>Données Ultra-Sécurisées</div>
              <div style={s.secureDesc}>Régulation BCRG n°001/2019 • Cryptage AES-256</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const s = {
  page: { height: "100vh", display: "flex", background: "#fff", overflow: "hidden" },
  left: { flex: 1, background: "#1A3A2A", display: "flex", justifyContent: "center", alignItems: "center", padding: "2rem 2.5rem", position: "relative", overflow: "hidden" },
  leftContent: { maxWidth: 420, color: "#fff", position: "relative", zIndex: 10 },
  logoWrap: { display: "flex", alignItems: "center", marginBottom: "1.5rem", cursor: "pointer" },
  logoImg: { height: 40, objectFit: "contain" },
  brandingH1: { fontSize: "1.8rem", fontWeight: 900, lineHeight: 1.15, marginBottom: "0.8rem" },
  brandingP: { fontSize: "0.8rem", color: "#A7DFC0", lineHeight: 1.5, fontWeight: 500, marginBottom: "1.5rem" },
  imageBox: { width: "100%", borderRadius: 18, overflow: "hidden", boxShadow: "0 15px 40px rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "1.5rem" },
  mainImg: { width: "100%", height: "auto", display: "block" },
  trust: { display: "flex", alignItems: "center", gap: "0.8rem" },
  trustItem: { fontSize: "0.65rem", fontWeight: 700, color: "#fff" },
  trustDivider: { width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.2)" },

  right: { flex: 1, background: "#F9FAFB", display: "flex", justifyContent: "center", alignItems: "center", padding: "1.5rem", overflow: "auto" },
  formWrapper: { width: "100%", maxWidth: 400 },
  formHeader: { textAlign: "center", marginBottom: "1.2rem" },
  formH2: { fontSize: "1.6rem", fontWeight: 900, color: "#0F172A", marginBottom: "0.3rem", letterSpacing: -0.8 },
  formP: { fontSize: "0.7rem", color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 },
  stepper: { display: "flex", justifyContent: "center", gap: "0.6rem", marginBottom: "1.2rem" },
  stepCircle: { width: 30, height: 30, borderRadius: "50%", background: "#fff", border: "2px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800, color: "#94A3B8", transition: "all 0.3s" },
  stepCircleActive: { borderColor: "#2D6A4F", background: "#F0FFF4", color: "#2D6A4F" },
  card: { background: "#fff", padding: "1.5rem", borderRadius: 22, boxShadow: "0 10px 30px rgba(0,0,0,0.02)", border: "1px solid #F1F5F9" },
  cardTitle: { fontSize: "1.1rem", fontWeight: 900, color: "#0F172A", marginBottom: "0.3rem" },
  cardSubtitle: { fontSize: "0.75rem", color: "#64748B", marginBottom: "1.2rem", lineHeight: 1.4, fontWeight: 500 },
  inputWrapper: { marginBottom: "0.9rem" },
  label: { display: "block", fontSize: "0.65rem", fontWeight: 800, color: "#1E293B", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "0.4rem" },
  input: { width: "100%", background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 12, padding: "0.75rem", fontSize: "0.9rem", fontWeight: 600, outline: "none", transition: "all 0.2s" },
  telRow: { display: "flex" },
  telCode: { background: "#F1F5F9", border: "1.5px solid #E2E8F0", borderRight: "none", borderRadius: "12px 0 0 12px", padding: "0.75rem", fontWeight: 900, fontSize: "0.85rem", color: "#1E293B", display: "flex", alignItems: "center" },
  telInput: { flex: 1, background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: "0 12px 12px 0", padding: "0.75rem", fontSize: "0.9rem", fontWeight: 600, outline: "none" },
  optionRow: { display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", marginBottom: "0.6rem" },
  check: { width: 20, height: 20, borderRadius: 5, border: "2px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 900, color: "#fff" },
  checkOn: { background: "#2D6A4F", borderColor: "#2D6A4F" },
  optionLabel: { fontSize: "0.8rem", fontWeight: 600, color: "#475569" },
  btnPrim: { width: "100%", background: "#2D6A4F", color: "#fff", border: "none", borderRadius: 14, padding: "0.85rem", fontSize: "0.9rem", fontWeight: 800, cursor: "pointer", transition: "all 0.2s" },
  btnSec: { background: "#fff", border: "2px solid #E2E8F0", borderRadius: 14, padding: "0.85rem 1.5rem", fontSize: "0.9rem", fontWeight: 800, color: "#64748B", cursor: "pointer" },
  btnRow: { display: "flex", gap: "0.8rem" },
  codeInput: { width: "100%", textAlign: "center", fontSize: "1.8rem", fontWeight: 900, letterSpacing: "0.4em", background: "#F8FAFC", border: "2px solid #E2E8F0", borderRadius: 16, padding: "0.8rem", color: "#2D6A4F", outline: "none" },
  resend: { textAlign: "center", fontSize: "0.7rem", color: "#2D6A4F", fontWeight: 800, marginTop: "0.6rem" },
  success: { textAlign: "center" },
  successCircle: { width: 60, height: 60, background: "#F0FDF4", color: "#2D6A4F", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: 900, margin: "0 auto 1.5rem", border: "2px solid #DCFCE7" },
  successH3: { fontSize: "1.4rem", fontWeight: 900, marginBottom: "0.6rem" },
  successP: { fontSize: "0.9rem", color: "#64748B", marginBottom: "1.5rem", lineHeight: 1.4 },
  footerLink: { textAlign: "center", fontSize: "0.8rem", color: "#64748B", marginTop: "1.2rem", fontWeight: 500 },
  link: { color: "#2D6A4F", fontWeight: 800, cursor: "pointer", textDecoration: "underline" },
  secureBadge: { display: "flex", alignItems: "center", gap: "0.8rem", marginTop: "1.2rem", padding: "0.8rem", background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", width: "fit-content", margin: "1.2rem auto 0" },
  secureTitle: { fontSize: "0.6rem", fontWeight: 900, color: "#1E293B", textTransform: "uppercase", letterSpacing: 0.5 },
  secureDesc: { fontSize: "0.55rem", color: "#94A3B8", fontWeight: 600, marginTop: 2 },
};
