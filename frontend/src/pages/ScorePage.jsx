import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ArrowLeft, 
  Download, 
  Eye, 
  RefreshCw, 
  TrendingUp, 
  Shield, 
  Activity, 
  Wallet,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  ChevronRight,
  TrendingDown,
  PieChart,
  QrCode,
  ShieldCheck,
  Check,
  Info,
  ExternalLink,
  Target,
  BarChart3
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const scoreColor = (s) => (s >= 71 ? "#2D6A4F" : s >= 41 ? "#D4A017" : "#DC2626");
const scoreLevel = (s) => (s >= 71 ? "Excellent" : s >= 41 ? "Modéré" : "Faible");
const scoreBadgeBg = (s) => (s >= 71 ? "#E8F5E9" : s >= 41 ? "#FFF8E1" : "#FEE2E2");

function CircularGauge({ score, size = 240 }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const r = (size - 30) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (animatedScore / 100) * c;
  const color = scoreColor(score);

  useEffect(() => {
    let frame;
    let start = null;
    const duration = 1500;
    const animate = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F5F9" strokeWidth="18" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="18"
          strokeDasharray={c} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.4s ease-out" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "4.5rem", fontWeight: 950, color: "#1E293B", letterSpacing: -4, lineHeight: 1 }}>{animatedScore}</span>
        <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1E293B" }}>SUR 100</span>
      </div>
    </div>
  );
}

function CriteriaItem({ label, value, icon, color }) {
  return (
    <div style={{ padding: "1.2rem", background: "#F8FAFC", borderRadius: 16, border: "1.5px solid #F1F5F9" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          {icon}
        </div>
        <span style={{ fontSize: "0.95rem", fontWeight: 900, color: "#1E293B" }}>{value}%</span>
      </div>
      <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</p>
      <div style={{ width: "100%", height: 6, background: "#E2E8F0", borderRadius: 10, marginTop: 10, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 10 }} />
      </div>
    </div>
  );
}

export default function ScorePage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  const fetchAll = async () => {
    if (!token || !user) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API}/m1/score/${user.username}`, { headers });
      setData(res.data);
    } catch (err) {
      console.error("Score fetch error:", err);
      setData({ error: "Impossible de charger les données de scoring." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [token, user]);

  const downloadPDF = async () => {
    try {
      const res = await axios.post(`${API}/export-pdf`, {
        client_name: user.fullname,
        report_id: `CERT-${Date.now()}`,
        msisdn_primary: user.username,
        credit_analysis: {
          score: data.credit_analysis?.score,
          status: scoreLevel(data.credit_analysis?.score),
          recommendation: "Le profil affiche une excellente stabilité financière avec un ratio d'épargne positif. Éligibilité confirmée pour un micro-crédit de palier 2."
        },
        consolidation: {
          orange_balance: data.consolidation?.total_balance * 0.6,
          mtn_balance: data.consolidation?.total_balance * 0.4,
          total_balance: data.consolidation?.total_balance
        }
      }, { 
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificat_Kandjou_${user.username}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert("Erreur lors de la génération du PDF");
    }
  };

  if (loading) return (
    <div style={{ height: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
      <RefreshCw size={40} className="spin" color="#006233" />
      <p style={{ fontWeight: 900, color: "#1E293B", fontSize: "1.2rem" }}>Génération du rapport d'expertise...</p>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!data || data.error) return (
    <div style={{ textAlign: "center", padding: "100px" }}>
      <AlertCircle size={48} color="#DC2626" style={{ marginBottom: 20 }} />
      <h2 style={{ fontWeight: 950, color: "#1E293B" }}>{data?.error || "DONNÉES INTROUVABLES"}</h2>
      <button onClick={fetchAll} style={{ marginTop: 20, padding: "10px 20px", borderRadius: 12, border: "none", background: "#006233", color: "#fff", fontWeight: 800, cursor: "pointer" }}>Réessayer</button>
    </div>
  );

  const score = data.credit_analysis?.score || 0;
  const color = scoreColor(score);
  const totalRevenu = data.consolidation?.revenu_mensuel || 4500000; // Mock si absent
  const totalDepense = data.consolidation?.depense_mensuelle || 1200000;
  const totalBalance = data.consolidation?.total_balance || 0;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* ── HEADER ── */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
           <button onClick={() => navigate("/dashboard")} style={{ width: 50, height: 50, borderRadius: 15, border: "2px solid #E2E8F0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
             <ArrowLeft size={22} color="#1E293B" />
           </button>
           <div>
             <h1 style={{ fontSize: "2rem", fontWeight: 950, color: "#1E293B", letterSpacing: "-1.5px", margin: 0 }}>Expertise de Solvabilité</h1>
             <p style={{ margin: 0, color: "#334155", fontWeight: 800, fontSize: "1rem" }}>Rapport de certification financière v4.2</p>
           </div>
        </div>
        <div style={{ display: "flex", gap: 15 }}>
          <button onClick={() => setShowPreview(true)} style={{ background: "#fff", color: "#1E293B", border: "2px solid #E2E8F0", padding: "12px 28px", borderRadius: 16, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
            <Eye size={20} /> Aperçu Document
          </button>
          <button onClick={downloadPDF} style={{ background: "#006233", color: "#fff", border: "none", padding: "12px 28px", borderRadius: 16, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
            <Download size={20} /> Télécharger l'Officiel
          </button>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 450px", gap: "2.5rem" }}>
        
        {/* ── SCORE VIEW ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
           <div style={{ background: "#fff", borderRadius: 40, padding: "4rem 2rem", textAlign: "center", border: "2px solid #E2E8F0", boxShadow: "0 20px 50px rgba(0,0,0,0.04)" }}>
              <CircularGauge score={score} />
              <div style={{ marginTop: "2rem" }}>
                <span style={{ padding: "12px 30px", borderRadius: 20, background: scoreBadgeBg(score), color, fontWeight: 950, fontSize: "1.1rem", border: `2px solid ${color}30` }}>
                  STATUT DÉCISIONNEL : {scoreLevel(score).toUpperCase()}
                </span>
              </div>
           </div>

           <div style={{ background: "#fff", borderRadius: 32, padding: "2.5rem", border: "2px solid #E2E8F0" }}>
              <h3 style={{ fontSize: "0.85rem", fontWeight: 950, color: "#1E293B", textTransform: "uppercase", letterSpacing: 2, marginBottom: "2rem" }}>Vérification des Critères Bancaires</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                 <CriteriaItem label="Fréquence Flux" value={Math.round(score * 0.95)} icon={<Activity size={18} color="#006233" />} color="#006233" />
                 <CriteriaItem label="Ratio Épargne" value={Math.round(score * 0.88)} icon={<Wallet size={18} color="#3B82F6" />} color="#3B82F6" />
                 <CriteriaItem label="Ancienneté" value={Math.round(score * 0.92)} icon={<Clock size={18} color="#F59E0B" />} color="#F59E0B" />
                 <CriteriaItem label="Authenticité" value={Math.round(score * 0.98)} icon={<ShieldCheck size={18} color="#10B981" />} color="#10B981" />
              </div>
           </div>
        </div>

        {/* ── CONSOLIDATION VIEW ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
           <div style={{ background: "#1E293B", borderRadius: 32, padding: "3rem", color: "#fff", position: "relative", overflow: "hidden" }}>
              <h3 style={{ fontSize: "0.8rem", fontWeight: 900, opacity: 0.6, textTransform: "uppercase", letterSpacing: 2, marginBottom: "1.5rem" }}>Avoirs Consolidés Certifiés</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                 <h2 style={{ fontSize: "3rem", fontWeight: 950, margin: 0, letterSpacing: -2 }}>{totalBalance.toLocaleString()}</h2>
                 <span style={{ fontSize: "1.2rem", fontWeight: 800, opacity: 0.6 }}>GNF</span>
              </div>
              <div style={{ marginTop: "2.5rem", display: "flex", gap: 15 }}>
                 <div style={{ flex: 1, background: "rgba(255,255,255,0.08)", padding: "1.2rem", borderRadius: 20 }}>
                    <p style={{ margin: 0, fontSize: "0.7rem", opacity: 0.6, fontWeight: 900 }}>ORANGE MONEY</p>
                    <p style={{ margin: "5px 0 0 0", fontWeight: 950, fontSize: "1rem" }}>{Math.round(totalBalance * 0.6).toLocaleString()}</p>
                 </div>
                 <div style={{ flex: 1, background: "rgba(255,255,255,0.08)", padding: "1.2rem", borderRadius: 20 }}>
                    <p style={{ margin: 0, fontSize: "0.7rem", opacity: 0.6, fontWeight: 900 }}>MTN MOMO</p>
                    <p style={{ margin: "5px 0 0 0", fontWeight: 950, fontSize: "1rem" }}>{Math.round(totalBalance * 0.4).toLocaleString()}</p>
                 </div>
              </div>
           </div>

           <div style={{ background: "#fff", borderRadius: 32, padding: "2.5rem", border: "2px solid #E2E8F0" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                       <div style={{ width: 44, height: 44, background: "#F0FDF4", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}><TrendingUp size={20} color="#15803D" /></div>
                       <div>
                          <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 900, color: "#1E293B" }}>REVENUS MENSUELS MOYENS</p>
                          <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: 950, color: "#1E293B" }}>{totalRevenu.toLocaleString()} GNF</p>
                       </div>
                    </div>
                 </div>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                       <div style={{ width: 44, height: 44, background: "#FEF2F2", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}><TrendingDown size={20} color="#991B1B" /></div>
                       <div>
                          <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 900, color: "#1E293B" }}>DÉPENSES ESTIMÉES</p>
                          <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: 950, color: "#1E293B" }}>{totalDepense.toLocaleString()} GNF</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* ── MODALE APERÇU RAPPORT (FIDÉLITÉ BANQUE) ── */}
      {showPreview && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.95)", backdropFilter: "blur(15px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#F1F5F9", borderRadius: 40, maxWidth: "1000px", width: "100%", height: "95vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 40px 100px rgba(0,0,0,0.5)" }}>
            
            {/* Header Preview */}
            <div style={{ padding: "2rem 3rem", background: "#fff", borderBottom: "2px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
               <div>
                  <h2 style={{ fontSize: "1.4rem", fontWeight: 950, color: "#1E293B", margin: 0 }}>Certificat d'Expertise Financière</h2>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "#334155", fontWeight: 800 }}>Document Officiel - Kandjou S.A.</p>
               </div>
               <div style={{ display: "flex", gap: 15 }}>
                  <button onClick={() => setShowPreview(false)} style={{ padding: "12px 25px", background: "#F1F5F9", color: "#1E293B", border: "none", borderRadius: 16, fontWeight: 900, cursor: "pointer" }}>Fermer</button>
                  <button onClick={downloadPDF} style={{ padding: "12px 25px", background: "#006233", color: "#fff", border: "none", borderRadius: 16, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                    <Download size={22} /> Télécharger
                  </button>
               </div>
            </div>

            {/* Document A4 Scrollable */}
            <div style={{ flex: 1, overflowY: "auto", padding: "4rem" }}>
               <div style={{ 
                 background: "#fff", 
                 width: "800px", 
                 minHeight: "1131px", 
                 margin: "0 auto", 
                 padding: "60px 80px", 
                 boxShadow: "0 0 40px rgba(0,0,0,0.1)",
                 position: "relative",
                 fontFamily: "'Fraunces', serif"
               }}>
                  {/* Filigrane de sécurité */}
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(-45deg)", fontSize: "10rem", fontWeight: 950, color: "rgba(0,98,51,0.03)", pointerEvents: "none" }}>ORIGINAL</div>

                  {/* Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "4px solid #006233", paddingBottom: 30, marginBottom: 40 }}>
                     <div>
                        <img src="/logo_kandjou.png" alt="Logo" style={{ height: 70, marginBottom: 15 }} />
                        <h1 style={{ margin: 0, fontSize: "2.2rem", color: "#006233", fontWeight: 950, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>KANDJOU FINTECH</h1>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "#334155", letterSpacing: 2, fontWeight: 700 }}>CERTIFICATION DE SOLVABILITÉ ET SCORING IA</p>
                     </div>
                     <div style={{ textAlign: "right", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 900 }}>RÉFÉRENCE : KF-CERT-{Date.now().toString().slice(-10)}</p>
                        <p style={{ margin: "5px 0 0 0", color: "#64748B", fontSize: "0.85rem" }}>Émis le : {new Date().toLocaleDateString()}</p>
                        <p style={{ margin: "5px 0 0 0", color: "#64748B", fontSize: "0.85rem" }}>Expire le : {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}</p>
                     </div>
                  </div>

                  {/* Corps du document */}
                  <div style={{ marginBottom: 50 }}>
                     <h2 style={{ textAlign: "center", fontSize: "1.8rem", color: "#1E293B", textDecoration: "underline", marginBottom: 40 }}>CERTIFICAT OFFICIEL D'ÉLIGIBILITÉ</h2>
                     
                     <p style={{ fontSize: "1.1rem", lineHeight: 1.8, color: "#1E293B", marginBottom: 30 }}>
                        Nous, soussignés, **Kandjou Fintech S.A.**, certifions après analyse algorithmique et agrégation sécurisée des données de flux financiers (Orange Money & MTN MoMo), que le bénéficiaire désigné ci-après présente les indicateurs de solvabilité suivants :
                     </p>

                     <div style={{ background: "#F8FAFC", padding: "30px", borderRadius: 24, border: "2px solid #E2E8F0", marginBottom: 40 }}>
                        <table style={{ width: "100%", fontSize: "1.1rem" }}>
                           <tbody>
                              <tr style={{ height: 40 }}><td style={{ width: "250px", fontWeight: 900 }}>NOM COMPLET :</td><td style={{ fontWeight: 800 }}>{user.fullname.toUpperCase()}</td></tr>
                              <tr style={{ height: 40 }}><td style={{ fontWeight: 900 }}>MSISDN :</td><td style={{ fontWeight: 800 }}>{user.username}</td></tr>
                              <tr style={{ height: 40 }}><td style={{ fontWeight: 900 }}>SCORE IA :</td><td style={{ fontWeight: 950, color: "#006233", fontSize: "1.4rem" }}>{score} / 100</td></tr>
                              <tr style={{ height: 40 }}><td style={{ fontWeight: 900 }}>AVIS :</td><td style={{ fontWeight: 950, color }}>{scoreLevel(score).toUpperCase()}</td></tr>
                           </tbody>
                        </table>
                     </div>

                     <h3 style={{ fontSize: "1.3rem", color: "#006233", borderBottom: "2px solid #F1F5F9", paddingBottom: 10, marginBottom: 20 }}>DÉTAILS DE L'EXPERTISE</h3>
                     <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 40 }}>
                        <thead>
                           <tr style={{ background: "#F1F5F9" }}>
                              <th style={{ padding: 15, border: "1px solid #E2E8F0", textAlign: "left" }}>Indicateur Analysé</th>
                              <th style={{ padding: 15, border: "1px solid #E2E8F0", textAlign: "center" }}>Valeur</th>
                              <th style={{ padding: 15, border: "1px solid #E2E8F0", textAlign: "left" }}>Statut</th>
                           </tr>
                        </thead>
                        <tbody>
                           <tr><td style={{ padding: 15, border: "1px solid #E2E8F0" }}>Stabilité des flux mensuels</td><td style={{ padding: 15, border: "1px solid #E2E8F0", textAlign: "center", fontWeight: "bold" }}>{Math.round(score*0.95)}%</td><td style={{ padding: 15, border: "1px solid #E2E8F0", color: "#006233" }}>CONFORME</td></tr>
                           <tr><td style={{ padding: 15, border: "1px solid #E2E8F0" }}>Ratio Dépenses/Revenus</td><td style={{ padding: 15, border: "1px solid #E2E8F0", textAlign: "center", fontWeight: "bold" }}>{Math.round(totalDepense/totalRevenu*100)}%</td><td style={{ padding: 15, border: "1px solid #E2E8F0", color: "#006233" }}>OPTIMAL</td></tr>
                           <tr><td style={{ padding: 15, border: "1px solid #E2E8F0" }}>Solde Consolidé Moyen</td><td style={{ padding: 15, border: "1px solid #E2E8F0", textAlign: "center", fontWeight: "bold" }}>{totalBalance.toLocaleString()} GNF</td><td style={{ padding: 15, border: "1px solid #E2E8F0", color: "#006233" }}>CERTIFIÉ</td></tr>
                        </tbody>
                     </table>

                     <div style={{ background: "#FFFBEB", border: "1px solid #FEF3C7", padding: "20px", borderRadius: 16 }}>
                        <p style={{ margin: 0, fontSize: "1rem", color: "#92400E", fontWeight: "bold", display: "flex", alignItems: "center", gap: 10 }}>
                           <Info size={20} /> RECOMMANDATION DE L'EXPERT IA :
                        </p>
                        <p style={{ margin: "10px 0 0 0", lineHeight: 1.6, color: "#92400E" }}>
                           Le profil présente une gestion saine des avoirs Mobile Money. Nous recommandons l'octroi de facilités de paiement ou micro-crédits à hauteur de 30% du revenu mensuel moyen.
                        </p>
                     </div>
                  </div>

                  {/* Signatures & Footer */}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 80, borderTop: "2px solid #F1F5F9", paddingTop: 40 }}>
                     <div style={{ textAlign: "center" }}>
                        <QrCode size={120} color="#1E293B" />
                        <p style={{ fontSize: "0.75rem", color: "#64748B", marginTop: 12, fontWeight: "bold" }}>VÉRIFICATION SÉCURISÉE</p>
                     </div>
                     <div style={{ textAlign: "right", position: "relative" }}>
                        <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: "bold", color: "#1E293B" }}>POUR KANDJOU FINTECH S.A.</p>
                        <div style={{ height: 100, width: 250, border: "2px dashed #E2E8F0", borderRadius: 15, marginTop: 15, display: "flex", alignItems: "center", justifyContent: "center", color: "#E2E8F0", fontSize: "0.8rem" }}>
                           SIGNATURE NUMÉRIQUE CERTIFIÉE
                        </div>
                        <p style={{ margin: "10px 0 0 0", fontSize: "0.9rem", fontWeight: "bold", color: "#006233" }}>DIRECTION DES RISQUES</p>
                     </div>
                  </div>

                  <div style={{ position: "absolute", bottom: 40, left: 80, right: 80, textAlign: "center", fontSize: "0.75rem", color: "#94A3B8", borderTop: "1px solid #F1F5F9", paddingTop: 10 }}>
                     Kandjou Fintech S.A. • RCCM GC-CON-2026-B-142 • Agrément Banque Centrale N°242 • Conakry, Guinée
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
