/**
 * LandingPage.jsx — Vitrine publique Kandjou Fintech
 *
 * Design : Luxury Fintech Dark — Bleu nuit profond, accents cyan électrique,
 *          typographie DM Serif Display + DM Sans, animations CSS pures.
 * Sécurité : Rate limiting côté client, badges conformité, aucune donnée réelle exposée.
 * Aucune dépendance externe (pas d'axios, pas de framer-motion).
 */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ── Données statiques ──────────────────────────────────────────────────────
const STEPS = [
  {
    num: "01", icon: "◎", color: "#06b6d4",
    title: "Consentement OTP",
    desc: "Le client autorise l'accès via un code à 6 chiffres envoyé sur son téléphone. Aucune consultation sans accord explicite.",
  },
  {
    num: "02", icon: "⚡", color: "#3b82f6",
    title: "Agrégation Parallèle",
    desc: "Orange Money et MTN MoMo sont interrogés simultanément. Les données sont normalisées en un profil financier unifié.",
  },
  {
    num: "03", icon: "◆", color: "#8b5cf6",
    title: "Score & Décision",
    desc: "L'algorithme calcule un score de solvabilité 0-100. Un rapport PDF certifié est généré en moins de 3 secondes.",
  },
];

const SECURITY_POINTS = [
  { icon: "🔐", title: "AES-256",           desc: "Chiffrement des données au repos"       },
  { icon: "🛡",  title: "TLS 1.3",           desc: "Sécurisation du transport réseau"       },
  { icon: "📱",  title: "OTP Certifié",      desc: "Consentement client obligatoire"        },
  { icon: "🔑",  title: "JWT 5min TTL",      desc: "Tokens à durée de vie limitée"          },
  { icon: "🚫",  title: "Anti-Brute Force",  desc: "Blocage automatique après 3 tentatives" },
  { icon: "📋",  title: "BCRG Conforme",     desc: "Audit trail immuable conservé 12 mois"  },
];

const STATS = [
  { value: "< 3s",  label: "Temps de réponse" },
  { value: "99.9%", label: "Disponibilité"     },
  { value: "2 ops", label: "Opérateurs agrégés"},
  { value: "100%",  label: "Audit trail"        },
];

const FAQ = [
  {
    q: "Mes données sont-elles partagées avec des tiers ?",
    a: "Non. Kandjou n'est qu'un agrégateur de lecture. Nous ne stockons jamais les soldes — uniquement le score calculé, avec le consentement explicite du client.",
  },
  {
    q: "Comment fonctionne le consentement OTP ?",
    a: "Avant toute analyse, le client reçoit un code à 6 chiffres sur son téléphone. L'agent ne peut procéder sans ce code. Chaque session expire automatiquement en 3 minutes.",
  },
  {
    q: "Quelle est la conformité réglementaire de Kandjou ?",
    a: "Kandjou est conforme aux exigences de la Banque Centrale de la République de Guinée (BCRG). Chaque événement est tracé dans un registre d'audit immuable conservé 12 mois.",
  },
  {
    q: "Quels opérateurs sont supportés en version MVP ?",
    a: "Orange Money Guinée (préfixes 622-625) et MTN MoMo Guinée (664) sont supportés. D'autres opérateurs seront intégrés dans la version 2.",
  },
];

// ── Rate limiter côté client (protection démo publique) ───────────────────
const rateLimit = (() => {
  const hist = [];
  return {
    check()     { const n = Date.now(); hist.splice(0, hist.length, ...hist.filter(t => n - t < 60000)); if (hist.length >= 3) return false; hist.push(n); return true; },
    remaining() { const n = Date.now(); return Math.max(0, 3 - hist.filter(t => n - t < 60000).length); },
  };
})();

// ── Couleur de score ───────────────────────────────────────────────────────
const scoreCol = (s) => s >= 71 ? "#22c55e" : s >= 41 ? "#f59e0b" : "#ef4444";

// ── Composant principal ────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled,     setScrolled]     = useState(false);
  const [demoInput,    setDemoInput]    = useState("");
  const [demoResult,   setDemoResult]   = useState(null);
  const [demoLoading,  setDemoLoading]  = useState(false);
  const [demoError,    setDemoError]    = useState("");
  const [remaining,    setRemaining]    = useState(3);
  const [openFaq,      setOpenFaq]      = useState(null);
  const [gaugeAnim,    setGaugeAnim]    = useState(0);
  const [tickerIdx,    setTickerIdx]    = useState(0);

  const TICKERS = [
    "🔥 Analyse en temps réel : Orange & MTN opérationnels",
    "🛡️ Certifié conforme aux normes BCRG 2026",
    "⚡ Traitement moyen : 2.4 secondes",
    "📍 Dernière analyse : Conakry, il y a 3 minutes",
    "👤 1,240 rapports générés ce mois-ci"
  ];

  // Navbar scroll
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    const tickerInterval = setInterval(() => {
      setTickerIdx(prev => (prev + 1) % TICKERS.length);
    }, 4000);
    return () => {
      window.removeEventListener("scroll", fn);
      clearInterval(tickerInterval);
    };
  }, []);

  // Animation jauge au chargement
  useEffect(() => {
    const timer = setTimeout(() => setGaugeAnim(85), 600);
    return () => clearTimeout(timer);
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  // Démo publique sécurisée — aucun appel réseau réel
  const handleDemo = async () => {
    setDemoError(""); setDemoResult(null);
    const clean = demoInput.replace(/\D/g, "").replace(/^224/, "");
    const isOrange = /^62[2-5]\d{6}$/.test(clean);
    const isMTN    = /^664\d{6}$/.test(clean);

    if (!isOrange && !isMTN) {
      setDemoError("Numéro invalide. Utilisez Orange (622-625XXXXXX) ou MTN (664XXXXXX) à 9 chiffres.");
      return;
    }
    if (!rateLimit.check()) {
      setDemoError("Limite atteinte — 3 essais/min. Connectez-vous pour un accès complet.");
      setRemaining(0);
      return;
    }
    setRemaining(rateLimit.remaining());
    setDemoLoading(true);
    await new Promise(r => setTimeout(r, 1600));

    // Score fictif déterministe (pas de vraie donnée financière)
    const seed  = parseInt(clean.slice(-2)) || 42;
    const score = Math.min(95, 48 + seed % 48);

    setDemoResult({
      score,
      operator: isOrange ? "Orange Money" : "MTN MoMo",
      status:   score >= 71 ? "ÉLIGIBLE" : score >= 41 ? "RISQUE MOYEN" : "REFUSÉ",
    });
    setDemoLoading(false);
  };

  // Arc SVG pour la jauge
  const gaugeOffset = 251 - (251 * gaugeAnim) / 100;

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#050d1a;overflow-x:hidden}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(6,182,212,.2)}50%{box-shadow:0 0 40px rgba(6,182,212,.5)}}
        @keyframes slideIn{from{opacity:0;max-height:0}to{opacity:1;max-height:200px}}
        .anim1{animation:fadeUp .7s ease forwards}
        .anim2{animation:fadeUp .7s .15s ease both}
        .anim3{animation:fadeUp .7s .3s ease both}
        .anim4{animation:fadeUp .7s .45s ease both}
        .float1{animation:float 4s ease-in-out infinite}
        .float2{animation:float 4s 2s ease-in-out infinite}
        .nav-a:hover{color:#f1f5f9!important}
        .btn-p:hover{transform:translateY(-2px);box-shadow:0 16px 40px rgba(6,182,212,.4)!important}
        .btn-o:hover{background:rgba(255,255,255,.07)!important}
        .step:hover{transform:translateY(-5px);border-color:rgba(6,182,212,.25)!important}
        .sec-c:hover{background:rgba(6,182,212,.05)!important}
        .stat-c:hover{border-color:rgba(6,182,212,.3)!important;transform:translateY(-2px)}
        .faq-i:hover{background:rgba(255,255,255,.03)!important}
        .demo-w:focus-within{border-color:rgba(6,182,212,.45)!important;box-shadow:0 0 0 3px rgba(6,182,212,.1)!important}
        input::placeholder{color:#1e3a5f}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:#0f1e33;border-radius:2px}
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        ...s.nav,
        background: scrolled ? "rgba(5,13,26,.96)" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,.06)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,.4)" : "none",
      }}>
        <div style={s.navLogo} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <span style={s.navGlyph}>◈</span>
          <div>
            <div style={s.navBrand}>KANDJOU</div>
            <div style={s.navSub}>Intelligence de Crédit</div>
          </div>
        </div>

        <div style={s.navLinks}>
          {[["services","Services"],["securite","Sécurité"],["demo","Démo"],["contact","Contact"]].map(([id,label]) => (
            <button key={id} className="nav-a" onClick={() => scrollTo(id)} style={s.navA}>{label}</button>
          ))}
        </div>

        <button className="btn-o" onClick={() => navigate("/login")} style={s.btnO}>
          Connexion
        </button>
      </nav>

      {/* ── HERO ── */}
      <section style={s.hero}>
        {/* Grille de fond */}
        <div style={s.bgGrid} />
        <div style={s.bgGlow1} />
        <div style={s.bgGlow2} />

        <div style={s.heroInner}>
          {/* Badge live */}
          <div className="anim1" style={s.heroBadge}>
            <span style={s.liveDot} />
            <span key={tickerIdx} style={{animation: "fadeUp 0.5s ease"}}>{TICKERS[tickerIdx]}</span>
          </div>

          <h1 className="anim2" style={s.h1}>
            L'Intelligence de Crédit<br />
            <em style={s.h1Accent}>pour une Finance Inclusive.</em>
          </h1>

          <p className="anim3" style={s.heroDesc}>
            Kandjou agrège et analyse les données Orange Money et MTN MoMo<br />
            pour un score de solvabilité en moins de 3 secondes.
          </p>

          <div className="anim4" style={s.ctas}>
            <button className="btn-p" onClick={() => scrollTo("demo")} style={s.btnP}>
              Essayer la démo gratuite
            </button>
            <button className="btn-o" onClick={() => navigate("/login")} style={s.btnO}>
              Connexion
            </button>
          </div>

          {/* Visuel Hero */}
          <div className="anim4" style={s.heroVis}>

            {/* Carte Orange */}
            <div className="float1" style={s.opCard}>
              <img src="/orange.png" alt="Orange Money" style={s.opImg}
                onError={e => e.target.style.display = "none"} />
              <div style={s.opName}>ORANGE MONEY</div>
              <div style={s.opAmount}>1,250,000 GNF</div>
              <div style={{ ...s.opPrefix, color: "#F37021", background: "rgba(243,112,33,.1)" }}>
                622 – 625
              </div>
              <div style={s.opStatus}>
                <span style={{ ...s.dot, background: "#22c55e" }} />
                ACTIF
              </div>
            </div>

            {/* Centre — jauge + flux */}
            <div style={s.heroCenter}>
              <div style={s.fluxRow}>
                {[0,1,2].map(i => (
                  <span key={i} style={{ ...s.fluxDot, animationDelay: `${i * 0.3}s` }} />
                ))}
              </div>

              <div style={s.gaugeCard}>
                <svg viewBox="0 0 200 120" width="200" height="120">
                  <path d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none" stroke="rgba(6,182,212,.1)"
                    strokeWidth="12" strokeLinecap="round" />
                  <path d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none" stroke="url(#cg)" strokeWidth="12" strokeLinecap="round"
                    strokeDasharray="251"
                    strokeDashoffset={gaugeOffset}
                    style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1)" }}
                  />
                  <defs>
                    <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%"   stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <text x="100" y="80" textAnchor="middle" fill="white"
                    fontSize="34" fontWeight="900"
                    fontFamily="'DM Serif Display',serif">{gaugeAnim}</text>
                  <text x="100" y="96" textAnchor="middle"
                    fill="rgba(255,255,255,.3)" fontSize="12">/100</text>
                </svg>
                <div style={s.gaugeLabel}>
                  <span style={{ ...s.dot, background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,.7)" }} />
                  Éligibilité Élevée
                </div>
              </div>

              <div style={s.fluxRow}>
                {[0,1,2].map(i => (
                  <span key={i} style={{ ...s.fluxDot, animationDelay: `${0.9 + i * 0.3}s` }} />
                ))}
              </div>
            </div>

            {/* Carte MTN */}
            <div className="float2" style={s.opCard}>
              <img src="/mtn.png" alt="MTN MoMo" style={s.opImg}
                onError={e => e.target.style.display = "none"} />
              <div style={s.opName}>MTN MOMO</div>
              <div style={s.opAmount}>780,000 GNF</div>
              <div style={{ ...s.opPrefix, color: "#FFCC00", background: "rgba(255,204,0,.1)" }}>
                664
              </div>
              <div style={s.opStatus}>
                <span style={{ ...s.dot, background: "#22c55e" }} />
                ACTIF
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section id="services" style={s.sec}>
        <div style={s.secIn}>
          <Heading eyebrow="Processus" title="Comment ça marche"
            sub="Trois étapes sécurisées, de la demande du client à la décision de crédit." />
          <div style={s.stepsGrid}>
            {STEPS.map((step, i) => (
              <div key={i} className="step" style={{ ...s.stepCard, transition: "all .3s ease" }}>
                <div style={s.stepNum}>{step.num}</div>
                <div style={{ ...s.stepIcon, color: step.color }}>{step.icon}</div>
                <div style={{ width: "36px", height: "3px", borderRadius: "2px", background: step.color, marginBottom: "1rem" }} />
                <h3 style={s.stepTitle}>{step.title}</h3>
                <p style={s.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SÉCURITÉ ── */}
      <section id="securite" style={{ ...s.sec, background: "rgba(6,182,212,.015)", borderTop: "1px solid rgba(6,182,212,.08)", borderBottom: "1px solid rgba(6,182,212,.08)" }}>
        <div style={s.secIn}>
          <Heading eyebrow="Sécurité" title="Protection de niveau bancaire"
            sub={"Chaque donnée est chiffrée, auditée et traçable.\nConforme aux exigences de la Banque Centrale de la République de Guinée."} />

          {/* Flux de chiffrement */}
          <div style={s.encFlow}>
            {[["💻","Client"],["🔒","HTTPS TLS"],["🛡","OTP M3"],["⚡","M1 Aggrég."],["📱","Opérateurs"]].map(([icon, label], i) => (
              <div key={i} style={s.encStep}>
                <div style={{
                  ...s.encNode,
                  borderColor: i === 2 ? "rgba(6,182,212,.4)" : "rgba(255,255,255,.08)",
                  background:  i === 2 ? "rgba(6,182,212,.07)" : "rgba(255,255,255,.02)",
                  boxShadow:   i === 2 ? "0 0 16px rgba(6,182,212,.15)" : "none",
                }}>{icon}</div>
                <div style={s.encLabel}>{label}</div>
                {i < 4 && <div style={s.encArrow}>→</div>}
              </div>
            ))}
          </div>

          <div style={s.secGrid}>
            {SECURITY_POINTS.map((pt, i) => (
              <div key={i} className="sec-c" style={{ ...s.secCard, transition: "all .2s ease" }}>
                <div style={s.secIcon}>{pt.icon}</div>
                <div>
                  <div style={s.secTitle}>{pt.title}</div>
                  <div style={s.secDesc}>{pt.desc}</div>
                </div>
                <div style={s.secCheck}>✓</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DÉMO PUBLIQUE ── */}
      <section id="demo" style={s.sec}>
        <div style={{ ...s.secIn, maxWidth: "700px" }}>
          <Heading eyebrow="Démo Gratuite" title="Testez votre éligibilité"
            sub="Entrez un numéro Orange Money ou MTN MoMo guinéen. Score indicatif — aucune donnée réelle consultée." />

          <div style={s.demoCard}>
            {/* Header démo */}
            <div style={s.demoHeader}>
              <div style={s.demoBadge}>
                <span style={{ ...s.dot, background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,.6)", animation: "pulse 1.5s ease-in-out infinite" }} />
                Mode démo sécurisé
              </div>
              <div style={s.demoRemaining}>
                {remaining} essai{remaining !== 1 ? "s" : ""} restant{remaining !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Input */}
            <div style={s.demoRow}>
              <div className="demo-w" style={{ ...s.demoWrap, transition: "all .2s ease" }}>
                <span style={s.demoFlag}>🇬🇳</span>
                <input
                  type="tel" value={demoInput}
                  onChange={e => { setDemoInput(e.target.value); setDemoError(""); setDemoResult(null); }}
                  onKeyDown={e => e.key === "Enter" && handleDemo()}
                  placeholder="622 00 00 00 ou 664 00 00 00"
                  maxLength={15}
                  style={s.demoIn}
                />
                {/* Détection opérateur en temps réel */}
                {(() => {
                  const c = demoInput.replace(/\D/g,"").replace(/^224/,"");
                  return /^62[2-5]/.test(c) ? (
                    <img src="/orange.png" alt="Orange" style={s.demoOp} onError={e=>e.target.style.display="none"}/>
                  ) : /^664/.test(c) ? (
                    <img src="/mtn.png" alt="MTN" style={s.demoOp} onError={e=>e.target.style.display="none"}/>
                  ) : null;
                })()}
              </div>
              <button onClick={handleDemo} disabled={demoLoading || !demoInput || remaining === 0}
                style={{ ...s.demoBtn, opacity: demoLoading || !demoInput || remaining === 0 ? .5 : 1 }}>
                {demoLoading
                  ? <span style={{ display: "inline-block", animation: "spin .8s linear infinite" }}>⟳</span>
                  : "Analyser →"
                }
              </button>
            </div>

            {demoError && <div style={s.demoErr}>⚠ {demoError}</div>}

            {/* Résultat démo */}
            {demoResult && (
              <div style={s.demoRes}>
                <div style={s.demoResTop}>
                  <div style={s.demoScoreWrap}>
                    <span style={{ ...s.demoScore, color: scoreCol(demoResult.score) }}>
                      {demoResult.score}
                    </span>
                    <span style={s.demoScoreMax}>/100</span>
                  </div>
                  <div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "700", color: scoreCol(demoResult.score) }}>
                      {demoResult.status}
                    </div>
                    <div style={{ color: "#475569", fontSize: ".82rem", marginTop: ".2rem" }}>
                      via {demoResult.operator}
                    </div>
                  </div>
                </div>

                {/* Barre de score */}
                <div style={s.scoreBar}>
                  <div style={{
                    ...s.scoreBarFill,
                    width: `${demoResult.score}%`,
                    background: `linear-gradient(90deg, ${scoreCol(demoResult.score)}, ${scoreCol(demoResult.score)}88)`,
                    transition: "width 1s cubic-bezier(.4,0,.2,1)",
                  }} />
                </div>

                <div style={s.demoNote}>
                  🔒 Score indicatif basé sur des données simulées. Le résultat réel nécessite un accès agent autorisé.
                </div>

                <button onClick={() => navigate("/login")} style={s.demoCtaBtn}>
                  Obtenir le rapport complet — Connexion Agent →
                </button>
              </div>
            )}

            <p style={s.demoDis}>
              Les résultats de la démo sont fictifs. Pour une analyse certifiée, connectez-vous avec vos identifiants d'agent.
            </p>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: "3rem 6%" }}>
        <div style={{ ...s.secIn, maxWidth: "900px" }}>
          <div style={s.statsGrid}>
            {STATS.map((st, i) => (
              <div key={i} className="stat-c" style={{ ...s.statCard, transition: "all .25s ease" }}>
                <div style={s.statVal}>{st.value}</div>
                <div style={s.statLab}>{st.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POUR LES BANQUES ── */}
      <section style={{ ...s.sec, background: "rgba(255,255,255,.01)", borderTop: "1px solid rgba(255,255,255,.04)" }}>
        <div style={s.secIn}>
          <Heading eyebrow="Partenaires" title="Pour les Banques & IMF"
            sub={"Infrastructure conforme Bâle III\net aux exigences réglementaires de la BCRG."} />
          <div style={s.partnersRow}>
            {[
              { src: "/orange.png", name: "Orange Money Guinée", color: "#F37021", bg: "rgba(243,112,33,.06)" },
              { src: "/mtn.png",    name: "MTN MoMo Guinée",     color: "#FFCC00", bg: "rgba(255,204,0,.06)"  },
            ].map((pt, i) => (
              <div key={i} style={{ ...s.partCard, background: pt.bg, borderColor: pt.color + "30" }}>
                <img src={pt.src} alt={pt.name} style={s.partLogo}
                  onError={e => e.target.style.display = "none"} />
                <span style={{ color: pt.color, fontWeight: "700", fontSize: ".9rem" }}>{pt.name}</span>
                <span style={{ color: "#22c55e", fontSize: ".72rem", fontWeight: "600" }}>● Intégré</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={s.sec}>
        <div style={{ ...s.secIn, maxWidth: "720px" }}>
          <Heading eyebrow="Transparence" title="Questions fréquentes" sub="" />
          <div style={{ display: "flex", flexDirection: "column", gap: ".6rem" }}>
            {FAQ.map((item, i) => (
              <div key={i} className="faq-i"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ ...s.faqItem, transition: "background .2s ease" }}>
                <div style={s.faqQ}>
                  <span>{item.q}</span>
                  <span style={{ color: "#334155", fontSize: ".7rem", transition: "transform .3s", transform: openFaq === i ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
                </div>
                {openFaq === i && <p style={s.faqA}>{item.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section id="contact" style={{ padding: "6rem 6%", textAlign: "center" }}>
        <div style={s.ctaCard}>
          <div style={s.ctaBg} />
          <p style={{ ...s.eyebrow, position: "relative" }}>Prêt à démarrer ?</p>
          <h2 style={{ ...s.h2, position: "relative", fontSize: "2rem", marginBottom: "1rem" }}>
            Rejoignez les institutions<br />qui font confiance à Kandjou
          </h2>
          <p style={{ color: "#64748b", position: "relative", marginBottom: "2rem" }}>
            Demandez une démonstration complète avec vos données de test.
          </p>
          <button className="btn-p" onClick={() => navigate("/login")}
            style={{ ...s.btnP, position: "relative" }}>
            Accès Agent — Connexion sécurisée →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={s.footer}>
        <div style={s.footTop}>
          <div>
            <div style={s.footBrand}>
              <span style={{ color: "#06b6d4", fontSize: "1.5rem" }}>◈</span>
              <div>
                <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.05rem", letterSpacing: "2px" }}>KANDJOU</div>
                <div style={{ color: "#1e3a5f", fontSize: ".58rem", letterSpacing: "1px" }}>Intelligence de Crédit</div>
              </div>
            </div>
            <p style={s.footDesc}>
              Plateforme d'agrégation Mobile Money pour<br />l'inclusion financière en Guinée.
            </p>
          </div>

          <div style={s.footLinks}>
            {[
              ["Produit", ["Services","Sécurité","Démo"]],
              ["Conformité", ["BCRG","Bâle III","RGPD","Audit Trail"]],
              ["Accès", ["Connexion Agent","Démo publique"]],
            ].map(([title, links]) => (
              <div key={title} style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
                <p style={{ color: "#e2e8f0", fontSize: ".72rem", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: ".2rem" }}>
                  {title}
                </p>
                {links.map(l => (
                  <button key={l} style={s.footLink}
                    onClick={() => l === "Connexion Agent" ? navigate("/login") : l === "Démo publique" ? scrollTo("demo") : scrollTo(l.toLowerCase())}>
                    {l}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div style={s.footBottom}>
          <span style={{ color: "#0f1e33", fontSize: ".72rem" }}>© 2026 Kandjou Fintech — Conakry, Guinée</span>
          <div style={{ display: "flex", gap: ".7rem" }}>
            {["🔐 AES-256","🛡 TLS 1.3","📋 BCRG"].map(b => (
              <span key={b} style={s.footBadge}>{b}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Sous-composant Heading ─────────────────────────────────────────────────
function Heading({ eyebrow, title, sub }) {
  return (
    <div style={{ textAlign: "center", marginBottom: "3rem" }}>
      <p style={s.eyebrow}>{eyebrow}</p>
      <h2 style={s.h2}>{title}</h2>
      {sub && <p style={{ color: "#64748b", fontSize: "1rem", lineHeight: "1.7", whiteSpace: "pre-line" }}>{sub}</p>}
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const s = {
  root: { minHeight: "100vh", background: "#050d1a", color: "#f1f5f9", fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", overflowX: "hidden" },

  // Navbar
  nav: { position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.2rem 6%", transition: "all .3s ease" },
  navLogo: { display: "flex", alignItems: "center", gap: ".8rem", cursor: "pointer" },
  navGlyph: { fontSize: "1.8rem", color: "#06b6d4", lineHeight: 1, filter: "drop-shadow(0 0 8px rgba(6,182,212,.5))" },
  navBrand: { fontFamily: "'DM Serif Display',serif", fontSize: "1.05rem", letterSpacing: "2px" },
  navSub: { color: "#1e3a5f", fontSize: ".58rem", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase" },
  navLinks: { display: "flex", gap: "1.8rem" },
  navA: { background: "none", border: "none", color: "#475569", fontSize: ".85rem", fontWeight: "500", cursor: "pointer", letterSpacing: ".2px", transition: "color .2s" },
  btnO: { background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.12)", borderRadius: "8px", color: "#e2e8f0", padding: ".6rem 1.3rem", fontSize: ".82rem", fontWeight: "600", cursor: "pointer", letterSpacing: ".3px", transition: "all .2s" },
  btnP: { background: "linear-gradient(135deg,#06b6d4,#3b82f6)", border: "none", borderRadius: "10px", color: "white", padding: ".85rem 2rem", fontSize: ".9rem", fontWeight: "700", cursor: "pointer", boxShadow: "0 8px 24px rgba(6,182,212,.25)", transition: "all .3s ease", letterSpacing: ".3px" },

  // Hero
  hero: { minHeight: "100vh", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: "8rem 6% 5rem", overflow: "hidden" },
  bgGrid: { position: "absolute", inset: 0, zIndex: 0, backgroundImage: "linear-gradient(rgba(6,182,212,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,.04) 1px,transparent 1px)", backgroundSize: "64px 64px" },
  bgGlow1: { position: "absolute", top: "15%", left: "5%", zIndex: 0, width: "600px", height: "600px", background: "radial-gradient(circle,rgba(6,182,212,.07) 0%,transparent 70%)", pointerEvents: "none" },
  bgGlow2: { position: "absolute", bottom: "5%", right: "0%", zIndex: 0, width: "500px", height: "500px", background: "radial-gradient(circle,rgba(59,130,246,.05) 0%,transparent 70%)", pointerEvents: "none" },
  heroInner: { position: "relative", zIndex: 1, maxWidth: "1000px", width: "100%", textAlign: "center" },
  heroBadge: { display: "inline-flex", alignItems: "center", gap: ".5rem", background: "rgba(6,182,212,.07)", border: "1px solid rgba(6,182,212,.2)", borderRadius: "20px", padding: ".4rem 1rem", color: "#67e8f9", fontSize: ".76rem", fontWeight: "600", marginBottom: "1.8rem" },
  liveDot: { width: "6px", height: "6px", borderRadius: "50%", background: "#06b6d4", display: "inline-block", boxShadow: "0 0 8px rgba(6,182,212,.9)", animation: "pulse 1.4s ease-in-out infinite" },
  h1: { fontFamily: "'DM Serif Display',serif", fontSize: "3.4rem", lineHeight: "1.15", color: "#f8fafc", marginBottom: "1.4rem", letterSpacing: "-.5px" },
  h1Accent: { fontStyle: "italic", background: "linear-gradient(135deg,#06b6d4,#3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  heroDesc: { color: "#64748b", fontSize: "1.05rem", lineHeight: "1.7", margin: "0 auto 2.5rem", maxWidth: "520px" },
  ctas: { display: "flex", gap: "1rem", justifyContent: "center", marginBottom: "4rem" },

  // Visuel Hero
  heroVis: { display: "flex", justifyContent: "center", alignItems: "center", gap: "2rem", flexWrap: "wrap" },
  opCard: { background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: "18px", padding: "1.5rem 1.2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: ".5rem", width: "145px" },
  opImg: { width: "48px", height: "32px", objectFit: "contain" },
  opName: { color: "#334155", fontSize: ".6rem", fontWeight: "700", letterSpacing: "1px" },
  opAmount: { color: "#f1f5f9", fontSize: ".82rem", fontWeight: "700", fontFamily: "monospace" },
  opPrefix: { borderRadius: "10px", padding: ".15rem .6rem", fontSize: ".68rem", fontWeight: "700" },
  opStatus: { display: "flex", alignItems: "center", gap: ".35rem", color: "#22c55e", fontSize: ".65rem", fontWeight: "700" },
  dot: { width: "7px", height: "7px", borderRadius: "50%", display: "inline-block" },

  heroCenter: { display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" },
  fluxRow: { display: "flex", gap: ".5rem" },
  fluxDot: { width: "7px", height: "7px", borderRadius: "50%", background: "#06b6d4", display: "inline-block", boxShadow: "0 0 6px rgba(6,182,212,.7)", animation: "pulse 1.2s ease-in-out infinite" },
  gaugeCard: { background: "rgba(6,182,212,.04)", border: "1px solid rgba(6,182,212,.15)", borderRadius: "18px", padding: "1.2rem", display: "flex", flexDirection: "column", alignItems: "center", animation: "glow 3s ease-in-out infinite" },
  gaugeLabel: { display: "flex", alignItems: "center", gap: ".4rem", color: "#22c55e", fontSize: ".75rem", fontWeight: "700" },

  // Sections
  sec: { padding: "6rem 6%" },
  secIn: { maxWidth: "1100px", margin: "0 auto" },
  eyebrow: { color: "#06b6d4", fontSize: ".7rem", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", marginBottom: ".8rem" },
  h2: { fontFamily: "'DM Serif Display',serif", fontSize: "2.3rem", color: "#f8fafc", lineHeight: "1.2", marginBottom: "1rem" },

  // Steps
  stepsGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem" },
  stepCard: { background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.06)", borderRadius: "20px", padding: "2rem" },
  stepNum: { fontFamily: "'DM Serif Display',serif", fontSize: "2.8rem", color: "rgba(255,255,255,.05)", lineHeight: 1, marginBottom: "1rem" },
  stepIcon: { fontSize: "1.5rem", marginBottom: ".8rem" },
  stepTitle: { fontSize: "1.05rem", fontWeight: "700", color: "#e2e8f0", marginBottom: ".6rem" },
  stepDesc: { fontSize: ".85rem", color: "#64748b", lineHeight: "1.65" },

  // Sécurité
  encFlow: { display: "flex", justifyContent: "center", alignItems: "flex-start", gap: ".5rem", marginBottom: "2.5rem", flexWrap: "wrap" },
  encStep: { display: "flex", alignItems: "center", gap: ".5rem" },
  encNode: { width: "54px", height: "54px", borderRadius: "14px", border: "1px solid", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" },
  encLabel: { display: "none" },
  encArrow: { color: "#0f2a40", fontSize: "1.1rem", fontWeight: "700" },
  secGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem" },
  secCard: { display: "flex", alignItems: "center", gap: "1rem", background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.06)", borderRadius: "14px", padding: "1.3rem" },
  secIcon: { fontSize: "1.4rem", flexShrink: 0 },
  secTitle: { color: "#e2e8f0", fontSize: ".88rem", fontWeight: "700", marginBottom: ".2rem" },
  secDesc: { color: "#475569", fontSize: ".78rem" },
  secCheck: { marginLeft: "auto", color: "#22c55e", fontWeight: "900", fontSize: ".9rem", flexShrink: 0 },

  // Démo
  demoCard: { background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.07)", borderRadius: "20px", padding: "2.5rem" },
  demoHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  demoBadge: { display: "flex", alignItems: "center", gap: ".5rem", color: "#475569", fontSize: ".78rem" },
  demoRemaining: { color: "#334155", fontSize: ".72rem", fontFamily: "monospace" },
  demoRow: { display: "flex", gap: ".8rem", marginBottom: "1rem" },
  demoWrap: { flex: 1, display: "flex", alignItems: "center", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: "10px", padding: "0 1rem" },
  demoFlag: { fontSize: "1rem", marginRight: ".6rem", flexShrink: 0 },
  demoIn: { flex: 1, background: "none", border: "none", outline: "none", color: "#f1f5f9", fontSize: "1rem", padding: ".85rem 0", fontFamily: "monospace" },
  demoOp: { width: "28px", height: "18px", objectFit: "contain", marginLeft: ".4rem" },
  demoBtn: { background: "linear-gradient(135deg,#06b6d4,#3b82f6)", color: "white", border: "none", borderRadius: "10px", padding: "0 1.5rem", fontSize: ".9rem", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" },
  demoErr: { background: "rgba(239,68,68,.07)", border: "1px solid rgba(239,68,68,.2)", borderRadius: "8px", color: "#fca5a5", padding: ".7rem 1rem", fontSize: ".82rem", marginBottom: "1rem" },
  demoRes: { background: "rgba(6,182,212,.04)", border: "1px solid rgba(6,182,212,.14)", borderRadius: "14px", padding: "1.5rem", marginBottom: "1rem" },
  demoResTop: { display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1rem" },
  demoScoreWrap: { display: "flex", alignItems: "baseline", gap: ".3rem" },
  demoScore: { fontSize: "3rem", fontWeight: "900", fontFamily: "'DM Serif Display',serif", lineHeight: 1 },
  demoScoreMax: { color: "#334155", fontSize: "1rem" },
  scoreBar: { height: "4px", background: "rgba(255,255,255,.06)", borderRadius: "2px", overflow: "hidden", marginBottom: "1rem" },
  scoreBarFill: { height: "100%", borderRadius: "2px" },
  demoNote: { color: "#475569", fontSize: ".78rem", marginBottom: "1rem" },
  demoCtaBtn: { width: "100%", background: "rgba(6,182,212,.08)", border: "1px solid rgba(6,182,212,.22)", borderRadius: "8px", color: "#67e8f9", padding: ".75rem", fontSize: ".85rem", fontWeight: "700", cursor: "pointer" },
  demoDis: { color: "#0f1e33", fontSize: ".7rem", textAlign: "center", lineHeight: "1.5", marginTop: "1rem" },

  // Stats
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem" },
  statCard: { background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)", borderRadius: "16px", padding: "2rem", textAlign: "center" },
  statVal: { fontFamily: "'DM Serif Display',serif", fontSize: "2.2rem", color: "#06b6d4", marginBottom: ".4rem" },
  statLab: { color: "#475569", fontSize: ".8rem", fontWeight: "600" },

  // Partenaires
  partnersRow: { display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" },
  partCard: { display: "flex", flexDirection: "column", alignItems: "center", gap: ".6rem", border: "1px solid", borderRadius: "18px", padding: "2rem 3.5rem" },
  partLogo: { width: "60px", height: "40px", objectFit: "contain" },

  // FAQ
  faqItem: { background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.06)", borderRadius: "12px", padding: "1.2rem 1.4rem", cursor: "pointer" },
  faqQ: { display: "flex", justifyContent: "space-between", alignItems: "center", color: "#e2e8f0", fontSize: ".92rem", fontWeight: "600", gap: "1rem" },
  faqA: { color: "#64748b", fontSize: ".85rem", lineHeight: "1.65", marginTop: ".8rem" },

  // CTA
  ctaCard: { position: "relative", textAlign: "center", background: "rgba(6,182,212,.03)", border: "1px solid rgba(6,182,212,.1)", borderRadius: "24px", padding: "5rem 3rem", overflow: "hidden", maxWidth: "800px", margin: "0 auto" },
  ctaBg: { position: "absolute", inset: 0, zIndex: 0, background: "radial-gradient(ellipse at center,rgba(6,182,212,.06) 0%,transparent 70%)" },

  // Footer
  footer: { padding: "3rem 6% 2rem", borderTop: "1px solid rgba(255,255,255,.04)", background: "rgba(0,0,0,.2)" },
  footTop: { display: "flex", justifyContent: "space-between", gap: "3rem", marginBottom: "2rem", flexWrap: "wrap" },
  footBrand: { display: "flex", alignItems: "center", gap: ".7rem", marginBottom: "1rem" },
  footDesc: { color: "#1e3a5f", fontSize: ".82rem", lineHeight: "1.6" },
  footLinks: { display: "flex", gap: "4rem", flexWrap: "wrap" },
  footLink: { background: "none", border: "none", color: "#334155", fontSize: ".8rem", cursor: "pointer", textAlign: "left", padding: 0 },
  footBottom: { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,.04)", paddingTop: "1.5rem", flexWrap: "wrap", gap: ".8rem" },
  footBadge: { background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)", borderRadius: "6px", padding: ".2rem .6rem", color: "#1e3a5f", fontSize: ".68rem", fontWeight: "600" },
};
