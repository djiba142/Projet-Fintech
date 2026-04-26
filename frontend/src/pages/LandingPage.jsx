/**
 * LandingPage.jsx — Vitrine publique Kandjou Fintech
 *
 * Design : Luxury Fintech Dark — Bleu nuit profond, accents cyan électrique
 * Typographie : DM Serif Display + DM Sans (Google Fonts)
 * Animations : CSS pures uniquement — pas de framer-motion
 * Sécurité : Rate limiter côté client, aucune donnée réelle exposée en démo
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ── Rate limiter côté client (protection démo) ────────────────────────────
const makeRateLimiter = (max, windowMs) => {
  const history = [];
  return {
    check() {
      const now = Date.now();
      while (history.length && now - history[0] > windowMs) history.shift();
      if (history.length >= max) return false;
      history.push(now);
      return true;
    },
    remaining() {
      const now = Date.now();
      return max - history.filter(t => now - t < windowMs).length;
    },
  };
};
const demoLimiter = makeRateLimiter(3, 60000);

// ── Données statiques ──────────────────────────────────────────────────────
const STEPS = [
  {
    num: "01", icon: "◎", color: "#06b6d4",
    title: "Validation de Souveraineté",
    desc: "Le client garde le contrôle total. L'accès aux flux financiers n'est activé qu'après authentification forte par OTP (One-Time Password) sur le numéro titulaire.",
  },
  {
    num: "02", icon: "⚡", color: "#3b82f6",
    title: "Agrégation Multisectorielle",
    desc: "Nos moteurs d'agrégation interrogent en temps réel les API Orange Money et MTN MoMo pour consolider un historique transactionnel fiable et exhaustif.",
  },
  {
    num: "03", icon: "◆", color: "#8b5cf6",
    title: "Intelligence Prédictive",
    desc: "Notre algorithme propriétaire analyse plus de 50 variables pour générer un score de crédit instantané et un rapport certifié prêt pour décision.",
  },
];

const SECURITY_POINTS = [
  { icon: "🔐", title: "Cryptographie AES-256",   desc: "Protection maximale des données stockées" },
  { icon: "🛡",  title: "Protocoles TLS 1.3",      desc: "Transmissions sécurisées de bout en bout" },
  { icon: "📱",  title: "Consentement Dynamique",  desc: "Validation OTP obligatoire pour chaque session" },
  { icon: "🔑",  title: "Jetons Éphémères JWT",    desc: "Accès limités dans le temps et l'espace" },
  { icon: "🚫",  title: "Système Anti-Intrusion",  desc: "Détection et blocage des comportements suspects" },
  { icon: "📋",  title: "Traçabilité Institutionnelle", desc: "Registre d'audit immuable certifié par la BCRG" },
];

const STATS = [
  { value: "< 3s",  label: "Latence d'Analyse" },
  { value: "99.9%", label: "SLA Disponibilité" },
  { value: "24/7",  label: "Surveillance Risque" },
  { value: "100%",  label: "Conformité Audit" },
];

const FAQ = [
  {
    q: "Quelle est la politique de conservation des données ?",
    a: "Kandjou agit comme un facilitateur de lecture. Nous ne stockons jamais les soldes bancaires ni l'historique complet. Seul le score de solvabilité est conservé pour l'audit, avec un accès strictement limité aux agents autorisés.",
  },
  {
    q: "Le client peut-il révoquer son consentement ?",
    a: "Absolument. Chaque demande d'analyse nécessite une nouvelle validation OTP. Le consentement est à usage unique et expire dès que la session de scoring est clôturée.",
  },
  {
    q: "Kandjou remplace-t-il les bureaux de crédit classiques ?",
    a: "Kandjou complète les systèmes existants. En agrégeant la 'donnée alternative' du Mobile Money, nous permettons d'évaluer des profils jusqu'ici invisibles pour le système bancaire traditionnel.",
  },
  {
    q: "Quelles sont les garanties de conformité ?",
    a: "Notre infrastructure est auditée pour répondre aux normes de la Banque Centrale de la République de Guinée (BCRG). Nous suivons les meilleures pratiques internationales en matière de protection des données financières.",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────
function scoreColor(s) {
  return s >= 71 ? "#22c55e" : s >= 41 ? "#f59e0b" : "#ef4444";
}

function detectOperator(raw) {
  const clean = raw.replace(/\D/g, "").replace(/^224/, "");
  if (/^62[2-5]\d{6}$/.test(clean)) return { op: "Orange Money", msisdn: "224" + clean };
  if (/^664\d{6}$/.test(clean))     return { op: "MTN MoMo",     msisdn: "224" + clean };
  return null;
}

// ── Composant principal ───────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled,    setScrolled]    = useState(false);
  const [demoInput,   setDemoInput]   = useState("");
  const [demoResult,  setDemoResult]  = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError,   setDemoError]   = useState("");
  const [remaining,   setRemaining]   = useState(3);
  const [openFaq,     setOpenFaq]     = useState(null);
  const [gaugeAnim,   setGaugeAnim]   = useState(0);

  // Navbar scroll
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Animation jauge hero au chargement
  useEffect(() => {
    const t = setTimeout(() => setGaugeAnim(85), 400);
    return () => clearTimeout(t);
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  // Démo publique sécurisée
  const handleDemo = async () => {
    setDemoError("");
    const detected = detectOperator(demoInput);
    if (!detected) {
      setDemoError("Numéro invalide. Utilisez Orange (622–625) ou MTN (664) à 9 chiffres.");
      return;
    }
    if (!demoLimiter.check()) {
      setDemoError("Limite de 3 essais/minute atteinte. Connectez-vous pour un accès complet.");
      return;
    }
    setRemaining(demoLimiter.remaining());
    setDemoLoading(true);
    setDemoResult(null);

    // Simulation — aucun appel réseau, aucune donnée réelle
    await new Promise(r => setTimeout(r, 1400));

    const lastDigit = parseInt(detected.msisdn.slice(-1));
    const score = Math.min(95, 50 + lastDigit * 4);

    setDemoResult({
      score,
      operator: detected.op,
      status: score >= 71 ? "ÉLIGIBLE" : score >= 41 ? "RISQUE MOYEN" : "REFUSÉ",
    });
    setDemoLoading(false);
  };

  // Stroke de la jauge hero
  const gaugeCircumference = 201;
  const gaugeOffset = gaugeCircumference - (gaugeCircumference * gaugeAnim) / 100;

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050d1a; overflow-x: hidden; }
        
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(6,182,212,0.4); }
          50%       { opacity: 0.7; box-shadow: 0 0 0 6px rgba(6,182,212,0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes gaugeFill {
          from { stroke-dashoffset: 201; }
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }

        .fu1 { animation: fadeSlideUp 0.6s 0.1s ease both; }
        .fu2 { animation: fadeSlideUp 0.6s 0.25s ease both; }
        .fu3 { animation: fadeSlideUp 0.6s 0.4s ease both; }
        .fu4 { animation: fadeSlideUp 0.6s 0.55s ease both; }

        .hover-card:hover { transform: translateY(-5px) !important; border-color: rgba(6,182,212,0.25) !important; }
        .hover-sec:hover  { background: rgba(6,182,212,0.06) !important; }
        .hover-stat:hover { border-color: rgba(6,182,212,0.3) !important; transform: translateY(-2px); }
        .hover-faq:hover  { background: rgba(255,255,255,0.03) !important; }
        .hover-link:hover { color: #e2e8f0 !important; }
        .hover-btn-outline:hover { background: rgba(255,255,255,0.07) !important; transform: translateY(-1px); }
        .hover-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(6,182,212,0.4) !important; }

        input::placeholder { color: #1e3a5f; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        ...s.nav,
        background: scrolled ? "rgba(5,13,26,0.96)" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        boxShadow: scrolled ? "0 4px 32px rgba(0,0,0,0.4)" : "none",
      }}>
        <div style={s.navLogo} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <img src="/kandjou.png" alt="Kandjou" style={s.logoImg} />
          <div>
            <div style={s.logoName}>KANDJOU</div>
            <div style={s.logoSub}>Intelligence de Crédit</div>
          </div>
        </div>

        <div style={s.navLinks}>
          {[["services","Services"],["securite","Sécurité"],["demo","Démo"],["contact","Contact"]].map(([id, label]) => (
            <button key={id} className="hover-link"
              onClick={() => scrollTo(id)}
              style={s.navLink}>{label}</button>
          ))}
        </div>

        <button className="hover-btn-outline"
          onClick={() => navigate("/login")}
          style={s.btnOutline}>
          Connexion →
        </button>
      </nav>

      {/* ── HERO ── */}
      <section style={s.hero}>
        {/* Fond grille */}
        <div style={s.bgGrid} />
        <div style={s.bgGlow1} />
        <div style={s.bgGlow2} />

        {/* Ligne de scan décorative */}
        <div style={s.scanlineWrap}>
          <div style={s.scanline} />
        </div>

        <div style={s.heroInner}>
          {/* Badge animé */}
          <div className="fu1" style={s.heroBadge}>
            <span style={s.pulseDot} />
            Plateforme certifiée BCRG — Guinée 2026
          </div>

          <h1 className="fu2" style={s.heroTitle}>
            Propulsez vos décisions<br />
            <em style={s.heroAccent}>grâce à l'Open-Banking Mobile.</em>
          </h1>

          <p className="fu3" style={s.heroDesc}>
            Kandjou transforme les flux Orange Money et MTN MoMo en indicateurs<br />
            de solvabilité exploitables. Une solution souveraine pour l'inclusion financière.
          </p>

          <div className="fu4" style={s.heroCtas}>
            <button className="hover-btn-primary"
              onClick={() => scrollTo("demo")}
              style={s.btnPrimary}>
              Essayer la démo gratuite
            </button>
            <button className="hover-btn-outline"
              onClick={() => navigate("/login")}
              style={s.btnOutline}>
              Accès agents →
            </button>
          </div>

          {/* Visuel — 2 téléphones + jauge centrale */}
          <div className="fu4" style={s.heroVisual}>

            {/* Téléphone Orange */}
            <div style={{ ...s.phoneCard, animation: "float 4s ease-in-out infinite" }}>
              <div style={s.phonePill}>
                <img src="/orange.png" alt="Orange" style={s.phoneLogo}
                  onError={e => { e.target.style.display="none"; }} />
                <span style={{ color:"#F37021", fontSize:"0.72rem", fontWeight:"700" }}>Orange Money</span>
              </div>
              <div style={s.phoneAmount}>1,250,000<span style={s.phoneCurrency}> GNF</span></div>
              <div style={{ ...s.phoneBadge, color:"#F37021", border:"1px solid rgba(243,112,33,0.3)", background:"rgba(243,112,33,0.08)" }}>
                Préfixes 622–625
              </div>
            </div>

            {/* Jauge centrale */}
            <div style={s.gaugeBox}>
              {/* Halo */}
              <div style={s.gaugeHalo} />
              <svg viewBox="0 0 160 100" width="180" height="112" style={{ position:"relative", zIndex:1 }}>
                <defs>
                  <linearGradient id="gGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                {/* Arc fond */}
                <path d="M 16 80 A 64 64 0 0 1 144 80"
                  fill="none" stroke="rgba(6,182,212,0.1)"
                  strokeWidth="12" strokeLinecap="round" />
                {/* Arc score animé */}
                <path d="M 16 80 A 64 64 0 0 1 144 80"
                  fill="none" stroke="url(#gGrad)"
                  strokeWidth="12" strokeLinecap="round"
                  strokeDasharray={gaugeCircumference}
                  strokeDashoffset={gaugeOffset}
                  style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
                />
                <text x="80" y="66" textAnchor="middle"
                  fill="white" fontSize="30" fontWeight="900"
                  fontFamily="'DM Serif Display', serif">{gaugeAnim}</text>
                <text x="80" y="80" textAnchor="middle"
                  fill="rgba(255,255,255,0.25)" fontSize="10">/100</text>
              </svg>
              <div style={s.gaugeLabel}>
                <span style={s.gaugeDot} />
                Éligibilité Élevée
              </div>
              <div style={s.gaugeSubLabel}>Score consolidé</div>
            </div>

            {/* Téléphone MTN */}
            <div style={{ ...s.phoneCard, animation: "float 4s 2s ease-in-out infinite" }}>
              <div style={s.phonePill}>
                <img src="/mtn.png" alt="MTN" style={s.phoneLogo}
                  onError={e => { e.target.style.display="none"; }} />
                <span style={{ color:"#FFCC00", fontSize:"0.72rem", fontWeight:"700" }}>MTN MoMo</span>
              </div>
              <div style={s.phoneAmount}>780,000<span style={s.phoneCurrency}> GNF</span></div>
              <div style={{ ...s.phoneBadge, color:"#FFCC00", border:"1px solid rgba(255,204,0,0.3)", background:"rgba(255,204,0,0.06)" }}>
                Préfixe 664
              </div>
            </div>
          </div>

          {/* Bande de conformité */}
          <div className="fu4" style={s.complianceBand}>
            {["🔐 AES-256","🛡 TLS 1.3","📋 BCRG","✓ OTP Certifié","🔑 JWT 5min","🚫 Anti-Brute"].map(b => (
              <span key={b} style={s.complianceChip}>{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section id="services" style={s.section}>
        <div style={s.container}>
          <Eyebrow>Interopérabilité</Eyebrow>
          <SectionTitle>Une Architecture au service du Risque</SectionTitle>
          <SectionSub>De la capture de la donnée au rapport certifié : un workflow automatisé et sécurisé.</SectionSub>

          <div style={s.stepsGrid}>
            {STEPS.map((step, i) => (
              <div key={i} className="hover-card" style={{ ...s.stepCard, transition:"all 0.3s ease" }}>
                <div style={{ ...s.stepNum, color:`${step.color}20` }}>{step.num}</div>
                <div style={{ ...s.stepIcon, color: step.color }}>{step.icon}</div>
                <div style={{ ...s.stepBar, background: step.color }} />
                <h3 style={s.stepTitle}>{step.title}</h3>
                <p style={s.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SÉCURITÉ ── */}
      <section id="securite" style={{
        ...s.section,
        background: "linear-gradient(180deg, transparent, rgba(6,182,212,0.025), transparent)",
        borderTop: "1px solid rgba(6,182,212,0.08)",
        borderBottom: "1px solid rgba(6,182,212,0.08)",
      }}>
        <div style={s.container}>
          <Eyebrow>Gouvernance</Eyebrow>
          <SectionTitle>Infrastructure de Confiance Numérique</SectionTitle>
          <SectionSub>
            Nous déployons des standards de cybersécurité bancaire pour garantir l'intégrité<br />
            et la confidentialité de chaque interaction financière.
          </SectionSub>

          {/* Flux de chiffrement visuel */}
          <div style={s.encryptFlow}>
            {[
              { icon:"💻", label:"Client" },
              { icon:"→",  label:"",       arrow:true },
              { icon:"🔒", label:"HTTPS/TLS" },
              { icon:"→",  label:"",       arrow:true },
              { icon:"🛡",  label:"OTP M3" },
              { icon:"→",  label:"",       arrow:true },
              { icon:"⚡",  label:"M1 Agrégateur" },
              { icon:"→",  label:"",       arrow:true },
              { icon:"📱",  label:"M2 Opérateurs" },
            ].map((item, i) => (
              item.arrow
                ? <div key={i} style={s.flowArrow}>{item.icon}</div>
                : (
                  <div key={i} style={s.flowNode}>
                    <div style={{
                      ...s.flowNodeIcon,
                      borderColor: i === 0 ? "#06b6d4" : i === 4 ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.1)",
                      background:  i === 4 ? "rgba(6,182,212,0.08)" : "rgba(255,255,255,0.02)",
                    }}>
                      {item.icon}
                    </div>
                    <span style={s.flowNodeLabel}>{item.label}</span>
                  </div>
                )
            ))}
          </div>

          <div style={s.secGrid}>
            {SECURITY_POINTS.map((pt, i) => (
              <div key={i} className="hover-sec" style={{ ...s.secCard, transition:"background 0.2s" }}>
                <span style={s.secIcon}>{pt.icon}</span>
                <div>
                  <div style={s.secTitle}>{pt.title}</div>
                  <div style={s.secDesc}>{pt.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RAPPORT CERTIFIÉ ── */}
      <section id="rapport" style={{ ...s.section, overflow:"hidden" }}>
        <div style={s.container}>
          <div style={s.reportGrid}>
            <div style={s.reportText}>
              <Eyebrow>Souveraineté</Eyebrow>
              <SectionTitle>Un Rapport Institutionnel<br />Infalsifiable & Auditable</SectionTitle>
              <SectionSub>
                Chaque analyse génère un document PDF haute sécurité incluant le Score de Santé Financière,
                les soldes consolidés et l'empreinte numérique Kandjou (QR Auth).
              </SectionSub>
              <ul style={s.reportList}>
                <li>✓ Signature numérique BCRG</li>
                <li>✓ Validité de 15 jours</li>
                <li>✓ Détails par opérateur</li>
                <li>✓ Facteurs d'influence du score</li>
              </ul>
            </div>
            <div style={s.reportVisual}>
              <div style={s.reportMockup}>
                <div style={s.reportHeader}>
                  <img src="/kandjou.png" alt="Kandjou" style={{ width:"40px" }} />
                  <div style={s.reportTitle}>RAPPORT DE SOLVABILITÉ</div>
                </div>
                <div style={s.reportContent}>
                  <div style={s.reportRow}><span>CIBLE:</span> <strong>224 622 *** 456</strong></div>
                  <div style={s.reportRow}><span>DATE:</span> 26 AVRIL 2026</div>
                  <div style={s.reportScoreRow}>
                    <div style={s.reportScoreVal}>85</div>
                    <div style={s.reportScoreLabel}>SCORE GLOBAL<br /><small>Éligible</small></div>
                  </div>
                  <div style={s.reportBar} />
                  <div style={s.reportFooter}>Authentifié par Kandjou Security Protocol</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DÉMO PUBLIQUE SÉCURISÉE ── */}
      <section id="demo" style={s.section}>
        <div style={{ ...s.container, maxWidth:"660px" }}>
          <Eyebrow>Simulation</Eyebrow>
          <SectionTitle>Simulateur de Solvabilité</SectionTitle>
          <SectionSub>
            Découvrez le potentiel de notre algorithme en testant un numéro Orange ou MTN.<br />
            <span style={{ color:"#334155" }}>Environnement de test — Aucune donnée réelle n'est extraite en mode public.</span>
          </SectionSub>

          <div style={s.demoCard}>
            {/* Badge rate limit */}
            <div style={s.demoRateBar}>
              <span style={{ color:"#22c55e" }}>🔒</span>
              <span>Mode démo sécurisé</span>
              <span style={s.demoRateDots}>
                {[0,1,2].map(i => (
                  <span key={i} style={{
                    ...s.demoRateDot,
                    background: i < remaining ? "#22c55e" : "rgba(255,255,255,0.1)",
                  }} />
                ))}
              </span>
              <span style={{ color:"#475569" }}>{remaining}/3 essai{remaining > 1?"s":""}</span>
            </div>

            <div style={s.demoRow}>
              <div style={s.demoInputWrap}>
                <span style={s.demoFlag}>🇬🇳</span>
                <input
                  type="tel"
                  placeholder="622 00 00 00 ou 664 00 00 00"
                  value={demoInput}
                  onChange={e => { setDemoInput(e.target.value); setDemoError(""); setDemoResult(null); }}
                  onKeyDown={e => e.key === "Enter" && handleDemo()}
                  maxLength={15}
                  style={s.demoInput}
                />
                {/* Indicateur opérateur détecté */}
                {demoInput && (() => {
                  const d = detectOperator(demoInput);
                  return d ? (
                    <span style={{ ...s.demoDetected, color: d.op === "Orange Money" ? "#F37021" : "#FFCC00" }}>
                      ✓ {d.op}
                    </span>
                  ) : null;
                })()}
              </div>
              <button
                onClick={handleDemo}
                disabled={demoLoading || !demoInput}
                style={{ ...s.demoBtn, opacity: demoLoading || !demoInput ? 0.5 : 1 }}
              >
                {demoLoading
                  ? <span style={{ display:"inline-block", animation:"spin 0.7s linear infinite" }}>⟳</span>
                  : "Générer le Score →"
                }
              </button>
            </div>

            {demoError && <div style={s.demoError}>⚠ {demoError}</div>}

            {demoResult && (
              <div style={s.demoResult}>
                <div style={s.demoResultTop}>
                  <div style={s.demoScoreWrap}>
                    <svg viewBox="0 0 100 60" width="100" height="60">
                      <path d="M 8 50 A 42 42 0 0 1 92 50"
                        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" strokeLinecap="round" />
                      <path d="M 8 50 A 42 42 0 0 1 92 50"
                        fill="none" stroke={scoreColor(demoResult.score)} strokeWidth="8" strokeLinecap="round"
                        strokeDasharray="132"
                        strokeDashoffset={132 - (132 * demoResult.score) / 100}
                        style={{ transition:"stroke-dashoffset 1s ease" }}
                      />
                      <text x="50" y="46" textAnchor="middle"
                        fill={scoreColor(demoResult.score)} fontSize="22" fontWeight="900"
                        fontFamily="'DM Serif Display',serif">{demoResult.score}</text>
                    </svg>
                  </div>
                  <div>
                    <div style={{ ...s.demoStatus, color: scoreColor(demoResult.score) }}>
                      {demoResult.status}
                    </div>
                    <div style={s.demoOp}>via {demoResult.operator}</div>
                    <div style={s.demoNote}>
                      Score indicatif · Données simulées · Résultat non contractuel
                    </div>
                  </div>
                </div>
                <button onClick={() => navigate("/login")} style={s.demoCta}>
                  Obtenir l'analyse complète → Connexion
                </button>
              </div>
            )}

            <p style={s.demoDisclaimer}>
              🔒 La démo utilise exclusivement des données fictives.
              Aucun appel réseau n'est effectué vers les opérateurs en mode public.
              Pour une analyse réelle, connectez-vous avec vos identifiants d'agent autorisé.
            </p>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding:"4rem 6%" }}>
        <div style={{ ...s.container, maxWidth:"860px" }}>
          <div style={s.statsGrid}>
            {STATS.map((st, i) => (
              <div key={i} className="hover-stat" style={{ ...s.statCard, transition:"all 0.25s ease" }}>
                <div style={s.statVal}>{st.value}</div>
                <div style={s.statLbl}>{st.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ ...s.section, paddingTop:"3rem" }}>
        <div style={{ ...s.container, maxWidth:"700px" }}>
          <Eyebrow>Transparence</Eyebrow>
          <SectionTitle>Questions fréquentes</SectionTitle>

          <div style={s.faqList}>
            {FAQ.map((item, i) => (
              <div key={i} className="hover-faq"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ ...s.faqItem, transition:"background 0.2s" }}
              >
                <div style={s.faqQ}>
                  <span>{item.q}</span>
                  <span style={{
                    ...s.faqChev,
                    transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease",
                  }}>▾</span>
                </div>
                {openFaq === i && <p style={s.faqA}>{item.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section id="contact" style={{ padding:"6rem 6%", textAlign:"center" }}>
        <div style={s.ctaBox}>
          <div style={s.ctaGlow} />
          <p style={{ ...s.eyebrow, position:"relative" }}>Prêt à démarrer ?</p>
          <h2 style={{ ...s.sTitle, position:"relative", fontSize:"2.2rem", marginBottom:"1rem" }}>
            Rejoignez les institutions<br />qui font confiance à Kandjou
          </h2>
          <p style={{ ...s.sSub, position:"relative", marginBottom:"2rem" }}>
            Demandez une démonstration complète avec vos données de test.
          </p>
          <button className="hover-btn-primary"
            onClick={() => navigate("/login")}
            style={{ ...s.btnPrimary, position:"relative" }}>
            Accès — Connexion sécurisée →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={s.footer}>
        <div style={s.footerTop}>
          <div style={s.footerBrand}>
            <div style={s.footerLogoRow}>
              <img src="/kandjou.png" alt="Kandjou" style={{ width:"32px", height:"32px", objectFit:"contain" }} />
              <div>
                <div style={s.fBrandName}>KANDJOU</div>
                <div style={s.fBrandSub}>Intelligence de Crédit</div>
              </div>
            </div>
            <p style={s.fBrandDesc}>
              Architecture souveraine d'agrégation et de scoring Mobile Money,
              dédiée à l'accélération de l'inclusion financière en République de Guinée.
            </p>
          </div>

          <div style={s.footerNav}>
            <FooterCol title="Produit" items={[
              { label:"Services",  fn: () => scrollTo("services") },
              { label:"Sécurité",  fn: () => scrollTo("securite") },
              { label:"Démo",      fn: () => scrollTo("demo") },
            ]} />
            <FooterCol title="Conformité" items={[
              { label:"BCRG",        fn: () => scrollTo("securite") },
              { label:"Bâle III",    fn: () => scrollTo("rapport") },
              { label:"RGPD",        fn: () => scrollTo("securite") },
              { label:"Audit Trail", fn: () => scrollTo("rapport") },
            ]} />
            <FooterCol title="Accès" items={[
              { label:"Connexion",      fn: () => navigate("/login") },
              { label:"Démo publique",  fn: () => scrollTo("demo") },
            ]} />
          </div>
        </div>

        <div style={s.footerBottom}>
          <span style={s.fCopy}>© 2026 Kandjou Fintech — Conakry, République de Guinée</span>
          <div style={s.fBadges}>
            {["🔐 AES-256","🛡 TLS 1.3","📋 BCRG","✓ Audit"].map(b => (
              <span key={b} style={s.fBadge}>{b}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Micro-composants ──────────────────────────────────────────────────────
const eyebrow = { color:"#06b6d4", fontSize:"0.7rem", fontWeight:"700", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"0.8rem" };
const sTitle  = { fontFamily:"'DM Serif Display', serif", fontSize:"2.4rem", color:"#f8fafc", lineHeight:"1.2", marginBottom:"1rem" };
const sSub    = { color:"#64748b", fontSize:"1rem", lineHeight:"1.7", marginBottom:"3rem" };

function Eyebrow({ children }) { return <p style={eyebrow}>{children}</p>; }
function SectionTitle({ children }) { return <h2 style={sTitle}>{children}</h2>; }
function SectionSub({ children }) { return <p style={sSub}>{children}</p>; }

function FooterCol({ title, items }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
      <p style={{ color:"#e2e8f0", fontSize:"0.75rem", fontWeight:"700", letterSpacing:"1px", textTransform:"uppercase", marginBottom:"0.4rem" }}>
        {title}
      </p>
      {items.map(item => (
        <button key={item.label} className="hover-link"
          onClick={item.fn}
          style={{ background:"none", border:"none", color:"#475569", fontSize:"0.82rem", cursor: item.fn ? "pointer":"default", textAlign:"left", padding:0, transition:"color 0.2s" }}>
          {item.label}
        </button>
      ))}
    </div>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────
const s = {
  root: {
    minHeight:"100vh", background:"#050d1a", color:"#f1f5f9",
    fontFamily:"'DM Sans', 'Segoe UI', system-ui, sans-serif",
    overflowX:"hidden",
  },

  // Navbar
  nav: {
    position:"fixed", top:0, left:0, right:0, zIndex:1000,
    display:"flex", justifyContent:"space-between", alignItems:"center",
    padding:"1.1rem 6%", transition:"all 0.35s ease",
  },
  navLogo: { display:"flex", alignItems:"center", gap:"0.8rem", cursor:"pointer" },
  logoImg: {
    width:"42px", height:"42px", objectFit:"contain",
    filter:"drop-shadow(0 0 8px rgba(6,182,212,0.3))",
  },
  logoName: { fontFamily:"'DM Serif Display',serif", fontSize:"1.05rem", letterSpacing:"2px" },
  logoSub:  { fontSize:"0.56rem", color:"#334155", fontWeight:"600", letterSpacing:"1.5px", textTransform:"uppercase" },
  navLinks: { display:"flex", gap:"2rem" },
  navLink: {
    background:"none", border:"none", color:"#475569",
    fontSize:"0.85rem", fontWeight:"500", cursor:"pointer",
    letterSpacing:"0.3px", transition:"color 0.2s",
  },
  btnOutline: {
    background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.14)",
    borderRadius:"8px", color:"#cbd5e1",
    padding:"0.6rem 1.4rem", fontSize:"0.82rem", fontWeight:"600",
    cursor:"pointer", transition:"all 0.2s",
  },
  btnPrimary: {
    background:"linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
    border:"none", borderRadius:"10px", color:"white",
    padding:"0.85rem 2.2rem", fontSize:"0.9rem", fontWeight:"700",
    cursor:"pointer", letterSpacing:"0.3px",
    boxShadow:"0 8px 28px rgba(6,182,212,0.3)",
    transition:"all 0.3s ease",
  },

  // Hero
  hero: {
    minHeight:"100vh", position:"relative",
    display:"flex", alignItems:"center", justifyContent:"center",
    padding:"9rem 6% 5rem", overflow:"hidden",
  },
  bgGrid: {
    position:"absolute", inset:0, zIndex:0,
    backgroundImage:"linear-gradient(rgba(6,182,212,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.035) 1px, transparent 1px)",
    backgroundSize:"64px 64px",
  },
  bgGlow1: {
    position:"absolute", top:"15%", left:"5%", zIndex:0,
    width:"600px", height:"600px",
    background:"radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 65%)",
    pointerEvents:"none",
  },
  bgGlow2: {
    position:"absolute", bottom:"10%", right:"5%", zIndex:0,
    width:"500px", height:"500px",
    background:"radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 65%)",
    pointerEvents:"none",
  },
  scanlineWrap: {
    position:"absolute", inset:0, zIndex:0, overflow:"hidden", pointerEvents:"none",
  },
  scanline: {
    position:"absolute", left:0, right:0, height:"2px",
    background:"linear-gradient(90deg, transparent, rgba(6,182,212,0.15), transparent)",
    animation:"scanline 6s linear infinite",
  },

  heroInner: { position:"relative", zIndex:1, maxWidth:"1000px", width:"100%", textAlign:"center" },

  heroBadge: {
    display:"inline-flex", alignItems:"center", gap:"0.5rem",
    background:"rgba(6,182,212,0.07)", border:"1px solid rgba(6,182,212,0.2)",
    borderRadius:"20px", padding:"0.4rem 1.1rem",
    color:"#67e8f9", fontSize:"0.76rem", fontWeight:"600",
    marginBottom:"2rem",
  },
  pulseDot: {
    width:"7px", height:"7px", borderRadius:"50%", background:"#06b6d4",
    display:"inline-block", animation:"pulse 1.8s ease-in-out infinite",
  },

  heroTitle: {
    fontFamily:"'DM Serif Display', serif",
    fontSize:"clamp(2.2rem, 5vw, 3.6rem)",
    lineHeight:"1.15", color:"#f8fafc", marginBottom:"1.4rem",
    letterSpacing:"-0.5px",
  },
  heroAccent: {
    fontStyle:"italic",
    background:"linear-gradient(135deg, #06b6d4, #3b82f6)",
    WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
  },
  heroDesc: {
    color:"#475569", fontSize:"1.05rem", lineHeight:"1.72",
    maxWidth:"520px", margin:"0 auto 2.5rem",
  },
  heroCtas: { display:"flex", gap:"1rem", justifyContent:"center", marginBottom:"4rem", flexWrap:"wrap" },

  // Visuel hero
  heroVisual: {
    display:"flex", justifyContent:"center", alignItems:"center",
    gap:"2rem", flexWrap:"wrap",
  },
  phoneCard: {
    background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)",
    borderRadius:"20px", padding:"1.5rem 1.2rem",
    display:"flex", flexDirection:"column", alignItems:"center", gap:"0.7rem",
    width:"150px", backdropFilter:"blur(4px)",
  },
  phonePill: { display:"flex", flexDirection:"column", alignItems:"center", gap:"0.4rem" },
  phoneLogo: { width:"44px", height:"30px", objectFit:"contain" },
  phoneAmount: { color:"#f1f5f9", fontSize:"1.05rem", fontWeight:"700", fontFamily:"monospace", textAlign:"center" },
  phoneCurrency: { color:"#475569", fontSize:"0.72rem" },
  phoneBadge: { borderRadius:"12px", padding:"0.2rem 0.7rem", fontSize:"0.65rem", fontWeight:"700" },

  gaugeBox: {
    position:"relative", display:"flex", flexDirection:"column", alignItems:"center", gap:"0.5rem",
    background:"rgba(6,182,212,0.04)", border:"1px solid rgba(6,182,212,0.12)",
    borderRadius:"24px", padding:"1.5rem 1.8rem",
  },
  gaugeHalo: {
    position:"absolute", inset:"-20px",
    background:"radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)",
    pointerEvents:"none", borderRadius:"50%",
  },
  gaugeLabel: {
    display:"flex", alignItems:"center", gap:"0.4rem",
    color:"#22c55e", fontSize:"0.75rem", fontWeight:"700",
  },
  gaugeDot: {
    width:"6px", height:"6px", borderRadius:"50%", background:"#22c55e",
    display:"inline-block", boxShadow:"0 0 6px rgba(34,197,94,0.7)",
  },
  gaugeSubLabel: { color:"#334155", fontSize:"0.65rem", fontWeight:"600", letterSpacing:"1px" },

  complianceBand: {
    display:"flex", flexWrap:"wrap", gap:"0.6rem",
    justifyContent:"center", marginTop:"3rem",
  },
  complianceChip: {
    background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)",
    borderRadius:"20px", padding:"0.3rem 0.9rem",
    color:"#334155", fontSize:"0.72rem", fontWeight:"600",
  },

  // Sections
  section: { padding:"6rem 6%" },
  container: { maxWidth:"1100px", margin:"0 auto" },

  // Steps
  stepsGrid: { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.5rem" },
  stepCard: {
    background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)",
    borderRadius:"20px", padding:"2.2rem",
  },
  stepNum: {
    fontFamily:"'DM Serif Display',serif", fontSize:"3.5rem",
    lineHeight:1, marginBottom:"1rem", fontWeight:"900",
  },
  stepIcon: { fontSize:"1.5rem", marginBottom:"0.8rem" },
  stepBar:  { width:"28px", height:"3px", borderRadius:"2px", marginBottom:"1rem" },
  stepTitle: { fontSize:"1.05rem", fontWeight:"700", color:"#e2e8f0", marginBottom:"0.6rem" },
  stepDesc:  { fontSize:"0.85rem", color:"#475569", lineHeight:"1.65" },

  // Sécurité
  encryptFlow: {
    display:"flex", justifyContent:"center", alignItems:"center",
    gap:"0.4rem", marginBottom:"3rem", flexWrap:"wrap",
  },
  flowNode: { display:"flex", flexDirection:"column", alignItems:"center", gap:"0.4rem" },
  flowNodeIcon: {
    width:"52px", height:"52px", borderRadius:"14px",
    border:"1px solid",
    display:"flex", alignItems:"center", justifyContent:"center",
    fontSize:"1.2rem",
  },
  flowNodeLabel: { color:"#334155", fontSize:"0.62rem", fontWeight:"600", textAlign:"center", maxWidth:"70px" },
  flowArrow: { color:"#1e3a52", fontSize:"1rem", fontWeight:"700", paddingBottom:"1.2rem" },

  secGrid: { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem" },
  secCard: {
    display:"flex", alignItems:"flex-start", gap:"0.9rem",
    background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)",
    borderRadius:"14px", padding:"1.3rem",
  },
  secIcon:  { fontSize:"1.3rem", flexShrink:0, marginTop:"0.1rem" },
  secTitle: { color:"#e2e8f0", fontSize:"0.88rem", fontWeight:"700", marginBottom:"0.25rem" },
  secDesc:  { color:"#475569", fontSize:"0.78rem" },

  // Démo
  demoCard: {
    background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)",
    borderRadius:"20px", padding:"2rem",
  },
  demoRateBar: {
    display:"flex", alignItems:"center", gap:"0.6rem", justifyContent:"center",
    marginBottom:"1.4rem", color:"#475569", fontSize:"0.78rem",
  },
  demoRateDots: { display:"flex", gap:"0.3rem" },
  demoRateDot:  { width:"8px", height:"8px", borderRadius:"50%", display:"inline-block" },
  demoRow: { display:"flex", gap:"0.8rem", marginBottom:"1rem" },
  demoInputWrap: {
    flex:1, display:"flex", alignItems:"center", gap:"0.5rem",
    background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
    borderRadius:"10px", padding:"0 1rem",
    transition:"border-color 0.2s, box-shadow 0.2s",
  },
  demoFlag: { fontSize:"1rem", flexShrink:0 },
  demoInput: {
    flex:1, background:"none", border:"none", outline:"none",
    color:"#f1f5f9", fontSize:"0.95rem", padding:"0.85rem 0",
    fontFamily:"monospace",
  },
  demoDetected: { fontSize:"0.72rem", fontWeight:"700", whiteSpace:"nowrap", flexShrink:0 },
  demoBtn: {
    background:"linear-gradient(135deg, #06b6d4, #3b82f6)",
    color:"white", border:"none", borderRadius:"10px",
    padding:"0 1.5rem", fontSize:"0.88rem", fontWeight:"700",
    cursor:"pointer", whiteSpace:"nowrap", transition:"opacity 0.2s",
  },
  demoError: {
    background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)",
    borderRadius:"8px", color:"#fca5a5",
    padding:"0.7rem 1rem", fontSize:"0.82rem", marginBottom:"1rem",
  },
  demoResult: {
    background:"rgba(6,182,212,0.05)", border:"1px solid rgba(6,182,212,0.15)",
    borderRadius:"14px", padding:"1.4rem", marginBottom:"1rem",
  },
  demoResultTop: { display:"flex", alignItems:"center", gap:"1.5rem", marginBottom:"1rem" },
  demoScoreWrap: { flexShrink:0 },
  demoStatus: { fontSize:"1.1rem", fontWeight:"800", marginBottom:"0.2rem" },
  demoOp:    { color:"#475569", fontSize:"0.8rem", marginBottom:"0.3rem" },
  demoNote:  { color:"#334155", fontSize:"0.72rem" },
  demoCta:   {
    width:"100%", background:"rgba(6,182,212,0.08)",
    border:"1px solid rgba(6,182,212,0.2)", borderRadius:"8px",
    color:"#67e8f9", padding:"0.75rem",
    fontSize:"0.84rem", fontWeight:"700", cursor:"pointer",
  },
  demoDisclaimer: {
    color:"#1e3a5f", fontSize:"0.7rem", textAlign:"center",
    lineHeight:"1.6", marginTop:"1rem",
  },

  // Stats
  statsGrid: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem" },
  statCard: {
    background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)",
    borderRadius:"16px", padding:"2rem", textAlign:"center",
  },
  statVal: { fontFamily:"'DM Serif Display',serif", fontSize:"2.2rem", color:"#06b6d4", marginBottom:"0.4rem" },
  statLbl: { color:"#475569", fontSize:"0.78rem", fontWeight:"600" },

  // FAQ
  faqList: { display:"flex", flexDirection:"column", gap:"0.5rem" },
  faqItem: {
    background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)",
    borderRadius:"12px", padding:"1.2rem 1.4rem", cursor:"pointer",
  },
  faqQ: {
    display:"flex", justifyContent:"space-between", alignItems:"center",
    color:"#e2e8f0", fontSize:"0.93rem", fontWeight:"600",
  },
  faqChev: { color:"#334155", fontSize:"0.8rem", flexShrink:0 },
  faqA:    { color:"#64748b", fontSize:"0.86rem", lineHeight:"1.65", marginTop:"0.8rem" },

  // CTA
  ctaBox: {
    position:"relative", maxWidth:"800px", margin:"0 auto", textAlign:"center",
    background:"rgba(6,182,212,0.04)", border:"1px solid rgba(6,182,212,0.12)",
    borderRadius:"24px", padding:"5rem 3rem", overflow:"hidden",
  },
  ctaGlow: {
    position:"absolute", inset:0,
    background:"radial-gradient(ellipse at center, rgba(6,182,212,0.07) 0%, transparent 70%)",
    pointerEvents:"none",
  },

  // Footer
  footer: {
    padding:"3rem 6% 2rem",
    borderTop:"1px solid rgba(255,255,255,0.05)",
    background:"rgba(0,0,0,0.3)",
  },
  footerTop: {
    display:"flex", justifyContent:"space-between", gap:"3rem",
    marginBottom:"2.5rem", flexWrap:"wrap",
  },
  footerBrand: { maxWidth:"260px" },
  footerLogoRow: { display:"flex", alignItems:"center", gap:"0.7rem", marginBottom:"0.8rem" },
  fBrandName: { fontFamily:"'DM Serif Display',serif", fontSize:"1.05rem", letterSpacing:"2px" },
  fBrandSub:  { color:"#334155", fontSize:"0.57rem", letterSpacing:"1.5px" },
  fBrandDesc: { color:"#334155", fontSize:"0.8rem", lineHeight:"1.6" },
  footerNav:  { display:"flex", gap:"4rem", flexWrap:"wrap" },

  footerBottom: {
    display:"flex", justifyContent:"space-between", alignItems:"center",
    borderTop:"1px solid rgba(255,255,255,0.04)", paddingTop:"1.5rem",
    flexWrap:"wrap", gap:"0.8rem",
  },
  fCopy:   { color:"#1e3a5f", fontSize:"0.7rem" },
  fBadges: { display:"flex", gap:"0.6rem" },
  fBadge:  {
    background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)",
    borderRadius:"6px", padding:"0.2rem 0.6rem",
    color:"#1e3a5f", fontSize:"0.66rem", fontWeight:"600",
  },
  // Rapport
  reportGrid: { display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:"4rem", alignItems:"center" },
  reportText: { textAlign:"left" },
  reportList: { listStyle:"none", marginTop:"1.5rem", color:"#94a3b8", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", fontSize:"0.9rem" },
  reportVisual: { position:"relative" },
  reportMockup: {
    background:"white", color:"#0f172a", borderRadius:"12px", padding:"1.5rem",
    boxShadow:"0 30px 60px rgba(0,0,0,0.5), 0 0 40px rgba(6,182,212,0.1)",
    transform:"rotate(2deg)", transition:"transform 0.5s ease",
  },
  reportHeader: { display:"flex", alignItems:"center", gap:"0.8rem", borderBottom:"2px solid #f1f5f9", paddingBottom:"0.8rem", marginBottom:"1.2rem" },
  reportTitle: { fontSize:"0.75rem", fontWeight:"800", letterSpacing:"1px", color:"#64748b" },
  reportContent: { display:"flex", flexDirection:"column", gap:"0.6rem" },
  reportRow: { fontSize:"0.7rem", color:"#94a3b8", display:"flex", justifyContent:"space-between" },
  reportScoreRow: { display:"flex", alignItems:"center", gap:"1rem", margin:"1rem 0" },
  reportScoreVal: { fontSize:"2.4rem", fontWeight:"900", color:"#06b6d4", fontFamily:"'DM Serif Display',serif" },
  reportScoreLabel: { fontSize:"0.7rem", fontWeight:"700", color:"#1e293b", lineHeight:1.2 },
  reportBar: { height:"4px", background:"#f1f5f9", borderRadius:"2px", overflow:"hidden", position:"relative" },
  reportFooter: { fontSize:"0.55rem", color:"#cbd5e1", textAlign:"center", marginTop:"1.2rem", fontStyle:"italic" },
  eyebrow, sTitle, sSub,
};
