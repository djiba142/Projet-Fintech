import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useLanguage } from "../context/LanguageContext";
import logoKandjou from "../assets/logo_kandjou.png";

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [stats, setStats] = useState({ total_users: "7 000+", total_transactions: "250k+", active_partners: "15+", availability: "99.9%" });

  useEffect(() => {
    // Fetch dynamic stats
    fetch("http://localhost:8000/stats/public")
      .then(res => res.json())
      .then(data => {
        setStats({
          total_users: data.total_users.toLocaleString() + "+",
          total_transactions: (data.total_transactions / 1000).toFixed(0) + "k+",
          active_partners: data.active_partners + "+",
          availability: data.availability
        });
      })
      .catch(err => console.error("Stats fetch error:", err));
  }, []);

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        section { scroll-margin-top: 80px; }
        .hover-lift { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease; }
        .hover-lift:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.06) !important; }
        .gradient-text { background: linear-gradient(135deg, #2D6A4F 0%, #1A3A2A 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      `}</style>

      {/* BCRG Top Bar */}
      <div style={s.topBar}>
        <div style={s.topInner}>
          <span>{t("bcrgCert")}</span>
          <div style={s.topRight}>
             <span>{t("helpCenter")}</span>
             <span style={{opacity: 0.3}}>|</span>
             <span>{t("location")}</span>
          </div>
        </div>
      </div>

      <Header />

      {/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 HERO \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */}
      <section id="hero" style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.heroText}>
            <div style={s.badge}>{t("heroBadge")}</div>
            <h1 style={s.heroH1}>
              {t("heroTitle").split('\n')[0]}<br />
              <span className="gradient-text">{t("heroTitle").split('\n')[1] || ""}</span>
            </h1>
            <p style={s.heroP}>
              {t("heroSubtitle")}
            </p>
            <div style={s.heroBtns}>
              <button onClick={() => navigate("/register")} style={s.btnPrim}>{t("btnStart")}</button>
              <button onClick={() => document.getElementById('features')?.scrollIntoView({behavior:'smooth'})} style={s.btnSec}>{t("btnDiscover")}</button>
            </div>
            <div style={s.heroStats}>
              <div style={s.heroStatItem}>
                <span style={s.hStatVal}>{stats.total_transactions}</span>
                <span style={s.hStatLab}>{t("statsTx")}</span>
              </div>
              <div style={s.hStatDivider} />
              <div style={s.heroStatItem}>
                <span style={s.hStatVal}>{stats.availability}</span>
                <span style={s.hStatLab}>{t("statsSecurity")}</span>
              </div>
            </div>
          </div>

          <div style={s.heroImageWrap}>
             <div style={s.floatingCard1}>
                <div style={s.fIcon}>\ud83d\udcc8</div>
                <div>
                   <div style={s.fTitle}>{t("cardBalance")}</div>
                   <div style={s.fVal}>12 847 500 GNF</div>
                </div>
             </div>
             <div style={s.floatingCard2}>
                <div style={s.fIcon}>\u26a1</div>
                <div>
                   <div style={s.fTitle}>{t("cardScore")}</div>
                   <div style={s.fVal}>72 / 100</div>
                </div>
             </div>
             <div style={s.heroCircle} />
          </div>
        </div>
      </section>

      {/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 FONCTIONNALIT\u00c9S \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */}
      <section id="features" style={s.section}>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>{t("featTitle")}</h2>
          <p style={s.sectionSubtitle}>{t("featSubtitle")}</p>
        </div>

        <div style={s.featureGrid}>
          {[
            { title: t("feat1Title"), desc: t("feat1Desc"), icon: "\ud83c\udfe6" },
            { title: t("feat2Title"), desc: t("feat2Desc"), icon: "\ud83d\udd04" },
            { title: t("feat3Title"), desc: t("feat3Desc"), icon: "\ud83d\udcca" },
            { title: t("feat4Title"), desc: t("feat4Desc"), icon: "\ud83d\udee1\ufe0f" },
          ].map((f, i) => (
            <div key={i} className="hover-lift" style={s.featureCard}>
              <div style={s.featureIcon}>{f.icon}</div>
              <h3 style={s.featureTitle}>{f.title}</h3>
              <p style={s.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 COMMENT \u00c7A MARCHE \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */}
      <section id="how-it-works" style={s.sectionAlt}>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>{t("howTitle")}</h2>
          <p style={s.sectionSubtitle}>{t("howSubtitle")}</p>
        </div>

        <div style={s.stepsGrid}>
          {[
            { step: "01", title: t("step1Title"), desc: t("step1Desc") },
            { step: "02", title: t("step2Title"), desc: t("step2Desc") },
            { step: "03", title: t("step3Title"), desc: t("step3Desc") },
          ].map((st, i) => (
            <div key={i} style={s.stepCard}>
              <div style={s.stepNumber}>{st.step}</div>
              <h3 style={s.stepTitle}>{st.title}</h3>
              <p style={s.stepDesc}>{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 \u00c0 PROPOS \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */}
      <section id="about" style={s.section}>
        <div style={s.aboutGrid}>
          <div style={s.aboutText}>
            <h2 style={s.sectionTitle}>{t("aboutTitle")}</h2>
            <p style={s.aboutP}>{t("aboutP1")}</p>
            <p style={s.aboutP}>{t("aboutP2")}</p>
            <div style={s.aboutKPIs}>
              <div style={s.akpi}>
                <span style={s.akpiVal}>{stats.total_users}</span>
                <span style={s.akpiLab}>{t("aboutKpi1")}</span>
              </div>
              <div style={s.akpi}>
                <span style={s.akpiVal}>{stats.active_partners}</span>
                <span style={s.akpiLab}>{t("aboutKpi2")}</span>
              </div>
            </div>
          </div>
          <div style={s.aboutImage}>
             <div style={s.aboutVisual}>
                <div style={s.avCircle} />
                <div style={s.avLabel}>Kandjou Core v2.4</div>
             </div>
          </div>
        </div>
      </section>

      {/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 FOOTER \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */}
      <footer id="footer" style={s.footer}>
        <div style={s.footerMain}>
          <div style={s.fCol1}>
            <div style={s.logoWrap} onClick={() => navigate("/")}>
              <img src={logoKandjou} alt="Kandjou Logo" style={s.logoImgFooter} />
            </div>
            <p style={s.fDesc}>{t("footerSlogan")}</p>
          </div>
          <div style={s.fCol}>
            <h4 style={s.fColTitle}>{t("footerCol1")}</h4>
            <span style={s.fLink} onClick={() => navigate("/login")}>{t("fLinkDashboard")}</span>
            <span style={s.fLink} onClick={() => navigate("/login")}>{t("fLinkTx")}</span>
            <span style={s.fLink} onClick={() => navigate("/login")}>{t("fLinkScoring")}</span>
          </div>
          <div style={s.fCol}>
            <h4 style={s.fColTitle}>{t("footerCol2")}</h4>
            <span style={s.fLink}>{t("fLinkTerms")}</span>
            <span style={s.fLink}>{t("fLinkPrivacy")}</span>
            <span style={s.fLink}>{t("fLinkBcrg")}</span>
          </div>
          <div style={s.fCol}>
            <h4 style={s.fColTitle}>{t("footerCol3")}</h4>
            <a href="mailto:support@kandjou.com" style={s.fLink}>support@kandjou.com</a>
            <a href="tel:+224620123456" style={s.fLink}>+224 620 12 34 56</a>
          </div>
        </div>
        <div style={s.footerBottom}>
          <span>{t("footerCopyright")}</span>
        </div>
      </footer>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#1E293B" },
  topBar: { background: "#1A3A2A", padding: "0.6rem 4rem", color: "#A7DFC0", fontSize: "0.7rem", fontWeight: 700 },
  topInner: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  topRight: { display: "flex", gap: "1.5rem" },

  hero: { padding: "6rem 4rem", background: "radial-gradient(circle at 90% 10%, rgba(45,106,79,0.03) 0%, transparent 40%)" },
  heroInner: { maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: "4rem" },
  heroText: { flex: 1.2 },
  badge: { display: "inline-block", background: "#F0FFF4", color: "#2D6A4F", padding: "0.5rem 1rem", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 800, marginBottom: "1.5rem", border: "1.5px solid #E2F0E5" },
  heroH1: { fontSize: "3.5rem", fontWeight: 900, lineHeight: 1.1, marginBottom: "1.5rem", letterSpacing: "-0.04em" },
  heroP: { fontSize: "1.1rem", color: "#64748B", lineHeight: 1.6, marginBottom: "2.5rem", maxWidth: 540 },
  heroBtns: { display: "flex", gap: "1rem", marginBottom: "3rem" },
  btnPrim: { background: "#2D6A4F", color: "#fff", border: "none", borderRadius: 14, padding: "1.2rem 2.2rem", fontSize: "0.95rem", fontWeight: 800, cursor: "pointer", boxShadow: "0 10px 30px rgba(45,106,79,0.2)" },
  btnSec: { background: "#fff", color: "#2D6A4F", border: "2px solid #E2E8F0", borderRadius: 14, padding: "1.2rem 2.2rem", fontSize: "0.95rem", fontWeight: 800, cursor: "pointer" },
  
  heroStats: { display: "flex", gap: "2rem", alignItems: "center" },
  heroStatItem: { display: "flex", flexDirection: "column" },
  hStatVal: { fontSize: "1.4rem", fontWeight: 900, color: "#1A3A2A" },
  hStatLab: { fontSize: "0.7rem", color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 },
  hStatDivider: { width: 1, height: 40, background: "#E2E8F0" },

  heroImageWrap: { flex: 1, position: "relative", display: "flex", justifyContent: "center" },
  heroCircle: { width: 340, height: 340, borderRadius: "50%", background: "linear-gradient(135deg, #F0FFF4 0%, #E2F0E5 100%)", position: "relative" },
  floatingCard1: { position: "absolute", top: "20%", left: "-10%", background: "#fff", padding: "1.2rem 1.5rem", borderRadius: 20, boxShadow: "0 15px 35px rgba(0,0,0,0.06)", border: "1px solid #F1F5F9", display: "flex", gap: "1rem", zIndex: 10 },
  floatingCard2: { position: "absolute", bottom: "15%", right: "-5%", background: "#fff", padding: "1.2rem 1.5rem", borderRadius: 20, boxShadow: "0 15px 35px rgba(0,0,0,0.06)", border: "1px solid #F1F5F9", display: "flex", gap: "1rem", zIndex: 10 },
  fIcon: { width: 40, height: 40, background: "#F8FAFC", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" },
  fTitle: { fontSize: "0.65rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", marginBottom: 2 },
  fVal: { fontSize: "1.1rem", fontWeight: 900, color: "#1A3A2A" },

  section: { padding: "6rem 4rem", maxWidth: 1200, margin: "0 auto" },
  sectionAlt: { padding: "6rem 4rem", background: "#F8FAFC", borderY: "1px solid #F1F5F9" },
  sectionHeader: { textAlign: "center", marginBottom: "4rem", maxWidth: 700, margin: "0 auto 4rem" },
  sectionTitle: { fontSize: "2.4rem", fontWeight: 900, marginBottom: "1rem", letterSpacing: "-0.02em" },
  sectionSubtitle: { fontSize: "1.05rem", color: "#64748B", lineHeight: 1.6, fontWeight: 500 },

  featureGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem" },
  featureCard: { background: "#fff", padding: "2.5rem", borderRadius: 24, border: "1px solid #F1F5F9", boxShadow: "0 10px 30px rgba(0,0,0,0.02)" },
  featureIcon: { fontSize: "2rem", marginBottom: "1.5rem" },
  featureTitle: { fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.8rem", color: "#1A3A2A" },
  featureDesc: { fontSize: "0.85rem", color: "#64748B", lineHeight: 1.6, fontWeight: 500 },

  stepsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2.5rem" },
  stepCard: { position: "relative", padding: "2rem", background: "#fff", borderRadius: 24, border: "1.5px solid #F1F5F9" },
  stepNumber: { fontSize: "4rem", fontWeight: 900, color: "#F1F5F9", position: "absolute", top: "1rem", right: "2rem", zIndex: 0 },
  stepTitle: { fontSize: "1.25rem", fontWeight: 800, marginBottom: "1rem", color: "#1A3A2A", position: "relative", zIndex: 1 },
  stepDesc: { fontSize: "0.95rem", color: "#64748B", lineHeight: 1.6, position: "relative", zIndex: 1 },

  aboutGrid: { display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "5rem", alignItems: "center" },
  aboutText: { },
  aboutP: { fontSize: "1.05rem", color: "#475569", lineHeight: 1.7, marginBottom: "1.5rem" },
  aboutKPIs: { display: "flex", gap: "3rem", marginTop: "2rem" },
  akpi: { display: "flex", flexDirection: "column" },
  akpiVal: { fontSize: "2rem", fontWeight: 900, color: "#2D6A4F" },
  akpiLab: { fontSize: "0.8rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" },
  aboutVisual: { height: 380, background: "#1A3A2A", borderRadius: 32, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" },
  avCircle: { width: 240, height: 240, border: "2px dashed rgba(167,223,192,0.2)", borderRadius: "50%" },
  avLabel: { position: "absolute", bottom: "2rem", color: "#A7DFC0", fontSize: "0.7rem", fontWeight: 700, opacity: 0.5 },

  footer: { background: "#0F172A", padding: "5rem 4rem 3rem", color: "#fff" },
  footerMain: { maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: "4rem", marginBottom: "4rem" },
  fCol1: { },
  logoWrap: { display: "flex", alignItems: "center", marginBottom: "1.5rem", cursor: "pointer" },
  logoImgFooter: { height: 45, objectFit: "contain", filter: "brightness(0) invert(1)" },
  fDesc: { color: "#94A3B8", fontSize: "0.9rem", lineHeight: 1.6 },
  fCol: { display: "flex", flexDirection: "column", gap: "1rem" },
  fColTitle: { fontSize: "0.95rem", fontWeight: 800, marginBottom: "0.5rem", color: "#fff" },
  fLink: { color: "#94A3B8", fontSize: "0.85rem", cursor: "pointer", transition: "color 0.2s", textDecoration: "none", display: "block" },
  footerBottom: { maxWidth: 1200, margin: "0 auto", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "2rem", textAlign: "center", fontSize: "0.75rem", color: "#64748B", fontWeight: 500 },
};
