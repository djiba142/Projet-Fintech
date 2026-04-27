import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, XAxis, YAxis, Tooltip
} from "recharts";
import MainLayout from "../components/MainLayout";

const API = "http://localhost:8000";

const RADAR_DATA = [
  { s: "Solde",    A: 85 }, { s: "Activité", A: 70 }, { s: "Régular.", A: 90 },
  { s: "Ancienneté",A: 60 }, { s: "Multi-op", A: 75 },
];
const TREND_DATA = [{ n: "S1", v: 20 }, { n: "S2", v: 45 }, { n: "S3", v: 28 }, { n: "S4", v: 60 }, { n: "S5", v: 45 }];
const AUDIT_LOGS = [
  { heure: "14:32:05", action: "Analyse", cible: "224622***456", resultat: "88 / ELIGIBLE" },
  { heure: "13:10:22", action: "OTP Envoyé", cible: "224664***012", resultat: "Validé" },
];

function detectMSISDN(input) {
  const parts = input.split(/[\s,;|]+/).map(p => p.replace(/\D/g, "")).filter(p => p.length >= 3);
  let orange = null, mtn = null;
  for (const p of parts) {
    const clean = p.startsWith("224") ? p.slice(3) : p;
    if (/^62[2-5]\d{6}$/.test(clean) && !orange) orange = "224" + clean;
    if (/^664\d{6}$/.test(clean) && !mtn) mtn = "224" + clean;
  }
  return { orange, mtn };
}

function maskMSISDN(msisdn) {
  if (!msisdn || msisdn.length < 6) return msisdn;
  return msisdn.slice(0, 6) + "***" + msisdn.slice(-3);
}

export default function AgentDashboard() {
  const [inputValue, setInputValue] = useState("");
  const [detected, setDetected] = useState({ orange: null, mtn: null });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("idle"); 
  const [otpCode, setOtpCode] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    setDetected(detectMSISDN(inputValue));
    setError("");
  }, [inputValue]);

  const handleStartAnalysis = async () => {
    if (!detected.orange && !detected.mtn) return setError("Numéro Orange (622-625) ou MTN (664) requis.");
    if (!consent) return setError("Consentement requis.");
    setLoading(true);
    try {
      const resp = await fetch(`${API}/m3/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ msisdn_orange: detected.orange, msisdn_mtn: detected.mtn }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.detail);
      setSessionId(data.session_id);
      setStep("otp");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API}/m3/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, code: otpCode }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.detail);
      
      const resM1 = await fetch(`${API}/m1/aggregate/${detected.orange || detected.mtn}`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      const dataM1 = await resM1.json();
      if (!resM1.ok) throw new Error(dataM1.detail);
      setResults(dataM1);
      setStep("result");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleDownloadPDF = async () => {
    if (!results) return;
    setLoading(true);
    try {
      const resp = await fetch(`${API}/export-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: results.kyc.fullname,
          report_id: results.report_id,
          msisdn_primary: detected.orange || detected.mtn,
          credit_analysis: results.credit_analysis,
          consolidation: results.consolidation
        }),
      });
      if (!resp.ok) throw new Error("Erreur PDF");
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Kandjou_Rapport_${results.report_id}.pdf`;
      a.click();
    } catch (e) { setError("Erreur lors de la génération du PDF."); }
    finally { setLoading(false); }
  };

  const score = results?.credit_analysis?.score ?? 88;
  const col = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <MainLayout>
      <div style={s.page}>
        <style>{`
          @media screen { .print-header { display: none !important; } }
          @media print {
            body { background: white !important; color: black !important; }
            .print-header { display: flex !important; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; color: black !important; }
            button { display: none !important; }
            .recharts-responsive-container { filter: invert(1); }
          }
        `}</style>
        {/* En-tête pour l'impression */}
        <div className="print-header">
          <span style={{ fontSize: "2rem", color: "#000" }}>◈</span>
          <div style={{ textAlign: "right" }}>
            <h1 style={{ margin: 0, fontSize: "1.2rem" }}>KANDJOU FINTECH</h1>
            <p style={{ margin: 0, fontSize: "0.7rem", color: "#64748b" }}>Rapport de Solvabilité Certifié — Guinée 2026</p>
          </div>
        </div>

        <div style={s.header}>
          <div>
            <h1 style={s.title}>Analyse de Crédit</h1>
            <p style={s.subtitle}>Agrégation en temps réel Orange & MTN</p>
          </div>
          {step !== "idle" && <button onClick={() => {setStep("idle"); setResults(null);}} style={s.btnReset}>Nouveau Dossier</button>}
        </div>

        {step === "idle" && (
          <div style={s.searchSection}>
            <div style={s.searchBox}>
              <input 
                type="text" 
                placeholder="Ex: 622010203 ou 664998877..." 
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                style={s.input}
              />
              <div style={s.opStatus}>
                <img src="/orange.png" style={{...s.opLogo, opacity: detected.orange ? 1 : 0.2}} />
                <img src="/mtn.png" style={{...s.opLogo, opacity: detected.mtn ? 1 : 0.2}} />
              </div>
            </div>
            <label style={s.consentLabel}>
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
              J'ai obtenu le consentement explicite du client
            </label>
            <button onClick={handleStartAnalysis} disabled={loading} style={s.btnAction}>
              {loading ? "Chargement..." : "DÉMARRER L'ANALYSE"}
            </button>
            {error && <p style={s.error}>{error}</p>}
          </div>
        )}

        {step === "otp" && (
          <div style={s.otpSection}>
            <h2 style={s.otpTitle}>Saisie du code OTP</h2>
            <p style={s.otpDesc}>Le client a reçu un code sur son mobile.</p>
            <input 
              type="text" 
              maxLength={6}
              value={otpCode}
              onChange={e => setOtpCode(e.target.value)}
              style={s.otpInput}
              placeholder="000000"
            />
            <button onClick={handleVerifyOTP} disabled={loading || otpCode.length < 6} style={s.btnAction}>
              VÉRIFIER LE CODE
            </button>
            <button onClick={() => setStep("idle")} style={s.btnBack}>Annuler</button>
            {error && <p style={s.error}>{error}</p>}
          </div>
        )}

        {step === "result" && results && (
          <div style={s.resultPage}>
            {/* Header Institutionnel */}
            <div style={s.resHeader}>
              <div>
                <h1 style={s.resTitle}>RAPPORT D'ÉVALUATION DE CRÉDIT</h1>
                <p style={s.resSubtitle}>ID Dossier: {results.report_id} • Statut: Analyse Certifiée</p>
              </div>
              <button onClick={() => setStep("idle")} style={s.btnNewDossier}>NOUVEAU DOSSIER</button>
            </div>

            <div style={s.resGrid}>
              {/* Colonne Gauche: KYC & Score */}
              <div style={s.resCol1}>
                {/* KYC Profile */}
                <div style={s.kycCard}>
                  <div style={s.avatarLarge}>
                    <svg width="40" height="40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h2 style={s.clientName}>{results.kyc.fullname}</h2>
                    <p style={s.clientMeta}>ID: {results.kyc.id_card} • {results.kyc.nationality}</p>
                    <p style={s.clientMeta}>Orange: {results.msisdn_orange || "N/A"} • MTN: {results.msisdn_mtn || "N/A"}</p>
                    <div style={s.kycBadge}>KYC VÉRIFIÉ (M3 VAULT)</div>
                  </div>
                </div>

                {/* Global Score Gauge */}
                <div style={s.scoreCardBig}>
                  <h3 style={s.cardLabel}>KANDJOU FINTECH SCORE</h3>
                  <div style={{...s.gauge, borderTopColor: results.credit_analysis.score >= 70 ? "#10B981" : "#ef4444", borderRightColor: results.credit_analysis.score >= 70 ? "#10B981" : "#1e293b"}}>
                    <span style={s.scoreValue}>{results.credit_analysis.score}</span>
                    <span style={s.scoreMax}>/100</span>
                  </div>
                  <div style={{...s.statusBadge, background: results.credit_analysis.score >= 70 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: results.credit_analysis.score >= 70 ? "#10B981" : "#ef4444"}}>
                    {results.credit_analysis.status} - RISQUE {results.credit_analysis.risk_level}
                  </div>
                </div>

                {/* Recommandation & PDF */}
                <div style={s.recCard}>
                  <h3 style={s.cardLabel}>RECOMMANDATION</h3>
                  <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", padding: "0.8rem", borderRadius: "8px", marginBottom: "1rem", color: "#f59e0b", fontSize: "0.8rem", fontWeight: "bold" }}>
                    ⚠️ Profil à surveiller. Analyse complémentaire recommandée avant décision de crédit.
                  </div>
                  <p style={s.recText}>{results.credit_analysis.recommendation}</p>
                  <button onClick={handleDownloadPDF} style={s.btnPdf}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{marginRight:8}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    TÉLÉCHARGER LE PDF CERTIFIÉ
                  </button>
                </div>

                {/* QR Verification Card */}
                <div style={s.verifyCard}>
                  <div style={s.qrBox}>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://kandjou.gn/verify/${results.report_id}`} 
                      alt="QR Code" 
                      style={s.qrImg} 
                    />
                  </div>
                  <div>
                    <h4 style={s.verifyTitle}>AUTHENTICITÉ CERTIFIÉE</h4>
                    <p style={s.verifyDesc}>Scannez pour vérifier l'intégrité du rapport sur le registre public Kandjou.</p>
                    <code style={s.verifyCode}>{results.report_id}</code>
                  </div>
                </div>
              </div>

              {/* Colonne Droite: Graphiques & Détails */}
              <div style={s.resCol2}>
                <div style={s.detailsGrid}>
                  <div style={s.assetsCard}>
                    <h3 style={s.cardLabel}>RÉSUMÉ DES AVOIRS CONSOLIDÉS</h3>
                    <div style={s.assetRow}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><img src="/orange.png" width="16" /> Orange Money</span>
                      <strong>{results.consolidation.orange_balance?.toLocaleString()} GNF</strong>
                    </div>
                    <div style={s.assetRow}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><img src="/mtn.png" width="16" /> MTN MoMo</span>
                      <strong>{results.consolidation.mtn_balance?.toLocaleString()} GNF</strong>
                    </div>
                    <div style={s.assetTotal}>
                      <span>Total Liquidité</span>
                      <span style={s.totalValue}>{results.consolidation.total_balance?.toLocaleString()} GNF</span>
                    </div>
                  </div>

                  <div style={s.radarCard}>
                    <h3 style={s.cardLabel}>RADAR DE SOLVABILITÉ</h3>
                    <div style={s.chartBox}>
                      <ResponsiveContainer width="100%" height={200}>
                        <RadarChart data={RADAR_DATA}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="s" tick={{fill: "#94a3b8", fontSize: 10}} />
                          <Radar name="Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Historique / Activité */}
                <div style={s.activityCard}>
                  <h3 style={s.cardLabel}>FLUX TRANSACTIONNELS (3 DERNIERS MOIS)</h3>
                  <div style={s.chartBoxLarge}>
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={TREND_DATA}>
                        <XAxis dataKey="n" hide />
                        <Tooltip contentStyle={{background: "#1e293b", border: "none", borderRadius: 8}} />
                        <Bar dataKey="v" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

const s = {
  page: { padding: "2rem", color: "#fff", background: "transparent", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", marginBottom: "2rem" },
  title: { fontSize: "1.5rem", fontWeight: "900", margin: 0 },
  subtitle: { color: "#64748b", fontSize: "0.85rem" },
  searchSection: { maxWidth: "600px", margin: "4rem auto", textAlign: "center" },
  searchBox: { background: "rgba(255,255,255,0.03)", border: "1px solid #1E293B", borderRadius: "16px", padding: "0.5rem 1rem", display: "flex", alignItems: "center", marginBottom: "1.5rem" },
  input: { background: "none", border: "none", color: "#fff", fontSize: "1.2rem", flex: 1, outline: "none", padding: "0.8rem" },
  opStatus: { display: "flex", gap: "0.8rem" },
  opLogo: { width: "48px", height: "32px", objectFit: "contain", background: "rgba(255,255,255,0.05)", borderRadius: "6px", padding: "4px" },
  consentLabel: { display: "flex", alignItems: "center", gap: "0.8rem", color: "#64748b", fontSize: "0.9rem", marginBottom: "2rem", cursor: "pointer" },
  btnAction: { width: "100%", background: "#3b82f6", color: "#fff", border: "none", padding: "1.2rem", borderRadius: "12px", fontWeight: "900", cursor: "pointer", letterSpacing: "1px" },
  error: { color: "#ef4444", marginTop: "1rem", fontSize: "0.9rem" },
  otpSection: { maxWidth: "400px", margin: "4rem auto", textAlign: "center" },
  otpInput: { background: "#0f172a", border: "2px solid #1E293B", color: "#fff", fontSize: "2rem", textAlign: "center", padding: "1rem", borderRadius: "12px", width: "100%", marginBottom: "1.5rem", letterSpacing: "10px" },
  btnBack: { background: "none", border: "none", color: "#64748b", marginTop: "1rem", cursor: "pointer" },
  
  resultPage: { background: "transparent", minHeight: "100vh", color: "#e2e8f0", animation: "fadeIn 0.5s ease-out" },
  resHeader: { borderBottom: "1px solid #1E293B", paddingBottom: "1rem", marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" },
  resTitle: { fontSize: "1.5rem", fontWeight: "bold", color: "#fff", letterSpacing: "1px", margin: 0 },
  resSubtitle: { color: "#64748b", fontSize: "0.8rem", marginTop: "0.25rem" },
  btnNewDossier: { background: "rgba(255,255,255,0.05)", border: "1px solid #1E293B", color: "#fff", padding: "0.6rem 1.2rem", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "0.8rem" },
  
  resGrid: { display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" },
  resCol1: { display: "flex", flexDirection: "column", gap: "1.5rem" },
  resCol2: { display: "flex", flexDirection: "column", gap: "1.5rem" },
  
  kycCard: { background: "#151C2C", border: "1px solid #1E293B", borderRadius: "16px", padding: "1.5rem", display: "flex", alignItems: "center", gap: "1.5rem" },
  avatarLarge: { width: "80px", height: "80px", borderRadius: "12px", background: "#1E293B", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" },
  clientName: { color: "#fff", fontSize: "1.2rem", margin: 0, fontWeight: "bold" },
  clientMeta: { color: "#64748b", fontSize: "0.8rem", margin: "0.25rem 0" },
  kycBadge: { background: "rgba(59,130,246,0.1)", color: "#3b82f6", fontSize: "0.7rem", padding: "0.2rem 0.6rem", borderRadius: "4px", fontWeight: "bold", border: "1px solid rgba(59,130,246,0.2)" },
  
  scoreCardBig: { background: "#151C2C", border: "1px solid #1E293B", borderRadius: "16px", padding: "2rem", textAlign: "center" },
  cardLabel: { color: "#64748b", fontSize: "0.7rem", fontWeight: "bold", letterSpacing: "2px", marginBottom: "1.5rem", textAlign: "left", textTransform: "uppercase" },
  gauge: { 
    width: "180px", height: "180px", borderRadius: "50%", margin: "0 auto", border: "8px solid #1E293B", 
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    boxShadow: "0 0 40px rgba(0,0,0,0.3)"
  },
  scoreValue: { fontSize: "3.5rem", fontWeight: "bold", color: "#fff" },
  scoreMax: { fontSize: "1rem", color: "#475569" },
  statusBadge: { marginTop: "1.5rem", padding: "0.5rem 1rem", borderRadius: "99px", fontSize: "0.8rem", fontWeight: "bold", letterSpacing: "1px" },
  
  recCard: { background: "#151C2C", border: "1px solid #1E293B", borderRadius: "16px", padding: "1.5rem" },
  recText: { color: "#94a3b8", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "1.5rem" },
  btnPdf: { width: "100%", background: "#0066FF", color: "#fff", border: "none", padding: "1rem", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" },
  
  verifyCard: { background: "rgba(30, 41, 59, 0.4)", border: "1px solid #1E293B", borderRadius: "16px", padding: "1.2rem", display: "flex", alignItems: "center", gap: "1rem", backdropFilter: "blur(10px)" },
  qrBox: { background: "#fff", padding: "4px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" },
  qrImg: { width: "60px", height: "60px" },
  verifyTitle: { fontSize: "0.7rem", fontWeight: "900", color: "#3b82f6", margin: 0, letterSpacing: "1px" },
  verifyDesc: { fontSize: "0.65rem", color: "#64748b", margin: "0.2rem 0", lineHeight: "1.4" },
  verifyCode: { fontSize: "0.6rem", color: "#475569", background: "#0B1120", padding: "2px 6px", borderRadius: "4px", fontFamily: "monospace" },
  
  detailsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" },
  assetsCard: { background: "#151C2C", border: "1px solid #1E293B", borderRadius: "16px", padding: "1.5rem" },
  assetRow: { display: "flex", justifyContent: "space-between", padding: "1rem", borderBottom: "1px solid #1E293B", fontSize: "0.9rem" },
  assetTotal: { display: "flex", justifyContent: "space-between", padding: "1.2rem 1rem", fontSize: "1rem", fontWeight: "bold" },
  totalValue: { color: "#3b82f6" },
  
  radarCard: { background: "#151C2C", border: "1px solid #1E293B", borderRadius: "16px", padding: "1.5rem" },
  chartBox: { background: "#0B1120", borderRadius: "12px", padding: "1rem", border: "1px dashed #1E293B" },
  
  activityCard: { background: "#151C2C", border: "1px solid #1E293B", borderRadius: "16px", padding: "1.5rem" },
  chartBoxLarge: { background: "#0B1120", borderRadius: "12px", padding: "1rem", border: "1px dashed #1E293B", minHeight: "150px" }
};
