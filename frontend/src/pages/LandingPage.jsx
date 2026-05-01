import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { 
  ArrowRight, 
  ShieldCheck, 
  Smartphone, 
  Zap, 
  PieChart, 
  CreditCard,
  ArrowRightLeft,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Users,
  Globe
} from "lucide-react";
import logoKandjou from "../assets/logo_kandjou.png";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-wrapper">
      <Header />

      {/* ── HERO SECTION ── */}
      <section className="hero-section" id="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-icon">🇬🇳</span>
              Premier agrégateur agréé de Guinée
            </div>
            <h1 className="hero-title">
              L'excellence financière <br/>
              <span className="text-gradient">en une seule interface.</span>
            </h1>
            <p className="hero-subtitle">
              Kandjou révolutionne la gestion de vos comptes Orange Money et MTN Mobile Money. Une vision consolidée en temps réel pour votre liberté financière.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => navigate("/register")}>
                Commencer gratuitement <ArrowRight size={20} />
              </button>
              <button className="btn-secondary">
                Découvrir nos solutions
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <strong>250k+</strong>
                <span>Transactions/jour</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <strong>99.9%</strong>
                <span>Sécurisé BCRG</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
             <div className="floating-card balance-card">
                <div className="card-top">
                   <p>Solde Consolidé</p>
                   <TrendingUp size={20} color="#10B981" />
                </div>
                <h3>12 847 500 GNF</h3>
                <div className="card-footer">
                   <div className="op-icons">
                      <img src="/orange.png" alt="OM" />
                      <img src="/mtn.png" alt="MoMo" />
                   </div>
                   <span>+2.4% ce mois</span>
                </div>
             </div>
             <div className="floating-card score-card">
                <p>Score Crédit</p>
                <div className="score-flex">
                   <div className="score-val">72<span>/100</span></div>
                   <div className="score-label">Excellent</div>
                </div>
             </div>
             <div className="hero-main-img-wrap">
                <div className="abstract-shape" />
             </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Une plateforme, des possibilités infinies</h2>
            <p className="section-subtitle">Nos solutions sont conçues pour répondre aux exigences des particuliers et des institutions financières guinéennes.</p>
          </div>

          <div className="features-grid">
            {[
              { 
                icon: <PieChart size={32} />, 
                title: "Vue Consolidée 360°", 
                desc: "Plus besoin de jongler entre les applications. Visualisez vos soldes Orange et MTN en un coup d'œil sur un tableau de bord unifié." 
              },
              { 
                icon: <ArrowRightLeft size={32} />, 
                title: "Transferts Inter-opérateurs", 
                desc: "Décloisonnez vos finances. Transférez des fonds entre vos comptes de différents opérateurs instantanément et sans effort." 
              },
              { 
                icon: <Zap size={32} />, 
                title: "Scoring de Solvabilité AI", 
                desc: "Valorisez vos données de transactions pour obtenir un score de crédit fiable, reconnu par nos institutions partenaires." 
              },
              { 
                icon: <ShieldCheck size={32} />, 
                title: "Sécurité de Niveau Bancaire", 
                desc: "Nous utilisons les standards de chiffrement les plus élevés pour garantir que vos données restent privées et sécurisées." 
              }
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feat-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how-section" id="how-it-works">
        <div className="container">
          <div className="how-wrapper">
             <div className="how-text">
                <h2 className="section-title">Votre parcours vers l'intelligence financière</h2>
                <div className="steps-list">
                   <div className="step-item">
                      <div className="step-num">01</div>
                      <div className="step-body">
                         <h3>Liez vos comptes</h3>
                         <p>Connectez vos comptes Orange Money et MTN MoMo en toute sécurité via notre interface cryptée.</p>
                      </div>
                   </div>
                   <div className="step-item">
                      <div className="step-num">02</div>
                      <div className="step-body">
                         <h3>Analysez vos flux</h3>
                         <p>Laissez Kandjou agréger vos données pour vous offrir une vision claire de vos revenus et dépenses.</p>
                      </div>
                   </div>
                   <div className="step-item">
                      <div className="step-num">03</div>
                      <div className="step-body">
                         <h3>Profitez du crédit</h3>
                         <p>Utilisez votre score de solvabilité pour accéder à des offres de crédit adaptées auprès de nos banques partenaires.</p>
                      </div>
                   </div>
                </div>
             </div>
             <div className="how-visual">
                <div className="how-image-mockup" />
             </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT SECTION ── */}
      <section className="about-section" id="about">
         <div className="container">
            <div className="about-card">
               <div className="about-grid">
                  <div className="about-content">
                     <h2 className="section-title">À propos de Kandjou Fintech</h2>
                     <p>Kandjou est une fintech guinéenne visionnaire née de la volonté de simplifier l'accès aux services financiers dans un paysage mobile-first. En tant que pionnier de l'Open Banking en Guinée, nous travaillons en étroite collaboration avec la BCRG pour bâtir un écosystème financier plus inclusif.</p>
                     <p>Notre mission est de donner le pouvoir aux utilisateurs sur leurs données financières, tout en offrant aux institutions les outils nécessaires pour évaluer les risques avec une précision sans précédent.</p>
                     <div className="about-kpis">
                        <div className="kpi">
                           <h3>1.2M</h3>
                           <p>Comptes liés</p>
                        </div>
                        <div className="kpi">
                           <h3>45+</h3>
                           <p>Partenaires IMF</p>
                        </div>
                     </div>
                  </div>
                  <div className="about-image">
                     <img src="/register_branding.png" alt="Team" />
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer" id="footer">
         <div className="container">
            <div className="footer-top">
               <div className="footer-brand">
                  <img src={logoKandjou} alt="Kandjou" className="footer-logo" />
                  <p>L'excellence financière pour chaque Guinéen.</p>
               </div>
               <div className="footer-links">
                  <div className="footer-col">
                     <h4>Produit</h4>
                     <ul>
                        <li>Dashboard</li>
                        <li>Transactions</li>
                        <li>Credit Scoring</li>
                     </ul>
                  </div>
                  <div className="footer-col">
                     <h4>Légal</h4>
                     <ul>
                        <li>Conditions</li>
                        <li>Confidentialité</li>
                        <li>Règlement BCRG</li>
                     </ul>
                  </div>
               </div>
            </div>
            <div className="footer-bottom">
               <p>© 2026 Kandjou Fintech. Tous droits réservés. Immatriculé à Conakry, Guinée.</p>
            </div>
         </div>
      </footer>

      <style>{`
        .landing-wrapper { background: #fff; color: #1E293B; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
        
        /* Hero */
        .hero-section { padding: 8rem 0; background: radial-gradient(circle at top right, #F0FDF4 0%, #fff 40%); overflow: hidden; }
        .hero-container { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 4rem; align-items: center; }
        .hero-badge { display: inline-flex; align-items: center; gap: 10px; background: #DCFCE7; color: #166534; padding: 0.6rem 1.2rem; border-radius: 99px; font-weight: 800; font-size: 0.85rem; margin-bottom: 2rem; }
        .hero-title { font-size: 4rem; font-weight: 950; line-height: 1.1; margin-bottom: 1.5rem; letter-spacing: -2px; }
        .text-gradient { background: linear-gradient(to right, #006233, #10B981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-subtitle { font-size: 1.25rem; color: #64748B; line-height: 1.6; margin-bottom: 2.5rem; max-width: 550px; }
        .hero-actions { display: flex; gap: 1rem; margin-bottom: 3rem; }
        .btn-primary { background: #1E293B; color: #fff; border: none; padding: 1.2rem 2rem; border-radius: 16px; font-weight: 700; font-size: 1.1rem; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: 0.2s; }
        .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(0,0,0,0.1); }
        .btn-secondary { background: #fff; color: #1E293B; border: 2px solid #E2E8F0; padding: 1.2rem 2rem; border-radius: 16px; font-weight: 700; font-size: 1.1rem; cursor: pointer; transition: 0.2s; }
        
        .hero-stats { display: flex; align-items: center; gap: 2rem; }
        .stat-item { display: flex; flex-direction: column; }
        .stat-item strong { font-size: 1.5rem; font-weight: 900; color: #1E293B; }
        .stat-item span { font-size: 0.85rem; color: #94A3B8; font-weight: 600; }
        .stat-divider { width: 1px; height: 30px; background: #E2E8F0; }

        .hero-visual { position: relative; }
        .floating-card { background: #fff; border-radius: 24px; padding: 1.5rem; box-shadow: 0 30px 60px rgba(0,0,0,0.1); border: 1px solid #F1F5F9; position: absolute; z-index: 10; transition: 0.3s; }
        .balance-card { top: 0; left: -10%; width: 280px; }
        .score-card { bottom: 10%; right: 0; width: 220px; }
        .card-top { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-weight: 700; font-size: 0.85rem; color: #64748B; }
        .balance-card h3 { font-size: 1.8rem; font-weight: 950; color: #1E293B; margin: 0.5rem 0; }
        .card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; }
        .op-icons img { height: 20px; margin-right: 6px; }
        .card-footer span { font-size: 0.75rem; color: #10B981; font-weight: 800; }

        .score-flex { display: flex; align-items: baseline; gap: 10px; margin-top: 0.5rem; }
        .score-val { font-size: 2.5rem; font-weight: 950; color: #006233; }
        .score-val span { font-size: 1rem; color: #94A3B8; }
        .score-label { background: #DCFCE7; color: #166534; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 800; }

        /* Features */
        .features-section { padding: 8rem 0; background: #F8FAFC; }
        .section-header { text-align: center; max-width: 700px; margin: 0 auto 5rem; }
        .section-title { font-size: 2.5rem; font-weight: 950; color: #1E293B; letter-spacing: -1px; margin-bottom: 1.5rem; }
        .section-subtitle { font-size: 1.1rem; color: #64748B; line-height: 1.6; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; }
        .feature-card { background: #fff; padding: 3rem 2rem; border-radius: 32px; border: 1.5px solid #F1F5F9; transition: 0.3s; }
        .feature-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
        .feat-icon { width: 64px; height: 64px; background: #F0FDF4; color: #006233; border-radius: 18px; display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; }
        .feature-card h3 { font-size: 1.3rem; font-weight: 900; margin-bottom: 1rem; color: #1E293B; }
        .feature-card p { color: #64748B; line-height: 1.6; font-size: 0.95rem; }

        /* How it works */
        .how-section { padding: 8rem 0; }
        .how-wrapper { display: grid; grid-template-columns: 1fr 1fr; gap: 6rem; align-items: center; }
        .steps-list { display: flex; flex-direction: column; gap: 2.5rem; margin-top: 3rem; }
        .step-item { display: flex; gap: 2rem; }
        .step-num { font-size: 3rem; font-weight: 950; color: #E2E8F0; line-height: 1; }
        .step-body h3 { font-size: 1.4rem; font-weight: 900; color: #1E293B; margin-bottom: 0.5rem; }
        .step-body p { color: #64748B; font-weight: 600; line-height: 1.6; }
        .how-image-mockup { height: 500px; background: #F1F5F9; border-radius: 40px; border: 8px solid #fff; box-shadow: 0 40px 80px rgba(0,0,0,0.1); }

        /* About */
        .about-section { padding: 6rem 0; }
        .about-card { background: #1E293B; border-radius: 40px; padding: 4rem; color: #fff; overflow: hidden; position: relative; }
        .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
        .about-content h2 { color: #fff; }
        .about-content p { font-size: 1.1rem; color: #94A3B8; line-height: 1.7; margin-bottom: 1.5rem; }
        .about-kpis { display: flex; gap: 3rem; margin-top: 3rem; }
        .kpi h3 { font-size: 2.5rem; font-weight: 950; color: #10B981; margin-bottom: 0.5rem; }
        .kpi p { font-size: 0.9rem; font-weight: 700; color: #94A3B8; margin: 0; }
        .about-image img { width: 100%; border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); }

        /* Footer */
        .footer { padding: 6rem 0 3rem; background: #F8FAFC; border-top: 1px solid #E2E8F0; }
        .footer-top { display: flex; justify-content: space-between; margin-bottom: 4rem; }
        .footer-brand p { color: #64748B; font-weight: 600; margin-top: 1rem; max-width: 250px; }
        .footer-logo { height: 35px; }
        .footer-links { display: flex; gap: 6rem; }
        .footer-col h4 { font-size: 0.9rem; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #1E293B; margin-bottom: 1.5rem; }
        .footer-col ul { list-style: none; padding: 0; margin: 0; }
        .footer-col li { margin-bottom: 0.8rem; color: #64748B; font-weight: 600; cursor: pointer; font-size: 0.95rem; }
        .footer-bottom { padding-top: 3rem; border-top: 1px solid #E2E8F0; text-align: center; }
        .footer-bottom p { color: #94A3B8; font-size: 0.9rem; font-weight: 600; }

        @media (max-width: 1024px) {
           .hero-container, .how-wrapper, .about-grid { grid-template-columns: 1fr; text-align: center; }
           .hero-title { font-size: 3rem; }
           .hero-subtitle, .section-header { margin: 1.5rem auto; }
           .hero-actions { justify-content: center; }
           .hero-stats { justify-content: center; }
           .hero-visual { height: 400px; margin-top: 4rem; }
           .footer-top { flex-direction: column; gap: 3rem; text-align: center; }
           .footer-brand { align-items: center; display: flex; flex-direction: column; }
           .footer-links { justify-content: center; gap: 3rem; }
        }
      `}</style>
    </div>
  );
}
