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
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      const dataM1 = await resM1.json();
      setResults(dataM1);
      setStep("result");
    } catch (e) { setError(e.message); }
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
          <img src="/kandjou.png" alt="Logo" style={{ width: "60px" }} />
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
          </div>
        )}

        {step === "result" && (
          <div style={s.resultGrid}>
            <div style={s.scoreCard}>
              <p style={s.cardTitle}>KANDJOU SCORE</p>
              <div style={{...s.scoreCircle, borderColor: col}}>
                <span style={{...s.scoreValue, color: col}}>{score}</span>
                <span style={s.scoreMax}>/100</span>
              </div>
              <p style={{...s.status, color: col}}>{results?.credit_analysis?.status || "APPROUVÉ"}</p>
              <button onClick={() => window.print()} style={s.btnPDF}>Télécharger le PDF</button>
            </div>
            
            <div style={s.detailsCard}>
              <p style={s.cardTitle}>DÉTAILS DES AVOIRS</p>
              <div style={s.balanceRow}>
                <div>
                  <p style={s.balLabel}>Orange Money</p>
                  <p style={s.balValue}>{results?.consolidation?.orange_balance?.toLocaleString() || "0"} GNF</p>
                </div>
                <div>
                  <p style={s.balLabel}>MTN MoMo</p>
                  <p style={s.balValue}>{results?.consolidation?.mtn_balance?.toLocaleString() || "0"} GNF</p>
                </div>
              </div>
              <div style={s.radarWrap}>
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={RADAR_DATA}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="s" tick={{fill: "#64748b", fontSize: 10}} />
                      <Radar dataKey="A" stroke={col} fill={col} fillOpacity={0.3} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
            </div>

            <div style={s.auditCard}>
              <p style={s.cardTitle}>LOGS D'AUDIT LOCAUX</p>
              {AUDIT_LOGS.map((log, i) => (
                <div key={i} style={s.logRow}>
                  <span style={s.logTime}>{log.heure}</span>
                  <span style={s.logTarget}>{log.cible}</span>
                  <span style={s.logRes}>{log.resultat}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

const s = {
  page: { padding: "2rem", color: "#fff", background: "#0a1628", height: "100vh" },
  header: { display: "flex", justifyContent: "space-between", marginBottom: "2rem" },
  title: { fontSize: "1.5rem", fontWeight: "900", margin: 0 },
  subtitle: { color: "#64748b", fontSize: "0.85rem" },
  btnReset: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer" },
  searchSection: { maxWidth: "600px", margin: "4rem auto", textAlign: "center" },
  searchBox: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "0.5rem 1rem", display: "flex", alignItems: "center", marginBottom: "1.5rem" },
  input: { background: "none", border: "none", color: "#fff", fontSize: "1.2rem", flex: 1, outline: "none", padding: "0.8rem" },
  opStatus: { display: "flex", gap: "0.8rem" },
  opLogo: { width: "32px", height: "20px", objectFit: "contain" },
  consentLabel: { display: "flex", alignItems: "center", gap: "0.8rem", color: "#64748b", fontSize: "0.9rem", marginBottom: "2rem", cursor: "pointer" },
  btnAction: { width: "100%", background: "#3b82f6", color: "#fff", border: "none", padding: "1.2rem", borderRadius: "12px", fontWeight: "900", cursor: "pointer", letterSpacing: "1px" },
  error: { color: "#ef4444", marginTop: "1rem", fontSize: "0.9rem" },
  otpSection: { maxWidth: "400px", margin: "4rem auto", textAlign: "center" },
  otpInput: { background: "#0f172a", border: "2px solid #1e293b", color: "#fff", fontSize: "2rem", textAlign: "center", padding: "1rem", borderRadius: "12px", width: "100%", marginBottom: "1.5rem", letterSpacing: "10px" },
  btnBack: { background: "none", border: "none", color: "#64748b", marginTop: "1rem", cursor: "pointer" },
  resultGrid: { display: "grid", gridTemplateColumns: "1fr 1.5fr 1fr", gap: "1.5rem", height: "calc(100vh - 150px)" },
  scoreCard: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "20px", padding: "2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
  scoreCircle: { width: "160px", height: "160px", borderRadius: "50%", border: "10px solid", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", margin: "2rem 0" },
  scoreValue: { fontSize: "3.5rem", fontWeight: "900" },
  scoreMax: { fontSize: "0.8rem", opacity: 0.3 },
  status: { fontWeight: "900", letterSpacing: "2px", marginBottom: "2rem" },
  btnPDF: { background: "#fff", color: "#000", border: "none", padding: "0.8rem 1.5rem", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },
  detailsCard: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "20px", padding: "2rem" },
  balanceRow: { display: "flex", justifyContent: "space-between", marginBottom: "2rem" },
  balLabel: { fontSize: "0.7rem", color: "#475569", fontWeight: "bold" },
  balValue: { fontSize: "1.2rem", fontWeight: "bold" },
  radarWrap: { height: "250px" },
  auditCard: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "20px", padding: "1.5rem", overflow: "auto" },
  logRow: { display: "flex", justifyContent: "space-between", fontSize: "0.75rem", padding: "0.8rem 0", borderBottom: "1px solid rgba(255,255,255,0.03)" },
  logTime: { color: "#475569" },
  logTarget: { color: "#94a3b8", fontFamily: "monospace" },
  cardTitle: { fontSize: "0.7rem", fontWeight: "bold", color: "#475569", letterSpacing: "1px", marginBottom: "1rem" }
};
