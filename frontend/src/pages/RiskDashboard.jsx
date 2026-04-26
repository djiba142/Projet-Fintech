import { useState } from "react";
import MainLayout from "../components/MainLayout";

function LineChart({ data }) {
  const W = 600, H = 160, PAD = { top: 16, right: 20, bottom: 32, left: 36 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const maxY = 100, minY = 0;

  const pts = data.map((d, i) => ({
    x: PAD.left + (i / (data.length - 1)) * innerW,
    y: PAD.top + innerH - ((d.score - minY) / (maxY - minY)) * innerH,
    ...d
  }));

  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${pts[pts.length - 1].x} ${PAD.top + innerH} L ${pts[0].x} ${PAD.top + innerH} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0, 20, 40, 60, 80].map(v => {
        const y = PAD.top + innerH - (v / maxY) * innerH;
        return (
          <g key={v}>
            <line x1={PAD.left} y1={y} x2={PAD.left + innerW} y2={y} stroke="rgba(255,255,255,0.05)" />
            <text x={PAD.left - 8} y={y} textAnchor="end" dominantBaseline="central" fill="#475569" fontSize="10">{v}</text>
          </g>
        );
      })}
      <path d={areaD} fill="url(#areaGrad)" />
      <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#3b82f6" />
      ))}
      {pts.map((p, i) => (
        <text key={i} x={p.x} y={PAD.top + innerH + 18} textAnchor="middle" fill="#475569" fontSize="11">{p.jour}</text>
      ))}
    </svg>
  );
}

export default function RiskDashboard() {
  const [threshold, setThreshold] = useState(65);
  const WEEK_DATA = [
    { jour: "Lun", score: 45 }, { jour: "Mar", score: 52 }, { jour: "Mer", score: 48 },
    { jour: "Jeu", score: 62 }, { jour: "Ven", score: 58 }, { jour: "Sam", score: 70 }, { jour: "Dim", score: 75 }
  ];

  const estimEligibles = Math.round(100 - threshold * 0.72 + 5);
  const sliderColor = threshold >= 75 ? "#ef4444" : threshold >= 55 ? "#f59e0b" : "#22c55e";

  return (
    <MainLayout>
      <div style={s.page}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Supervision des Risques</h1>
            <p style={s.subtitle}>Politiques de crédit et seuils d'approbation</p>
          </div>
        </div>

        <div style={s.kpiGrid}>
          <div style={s.kpiCard}>
            <div style={s.kpiIcon}>📊</div>
            <div style={s.kpiValue}>1,284</div>
            <div style={s.kpiLabel}>TOTAL SCORINGS</div>
          </div>
          <div style={s.kpiCard}>
            <div style={s.kpiIcon}>✓</div>
            <div style={s.kpiValue}>68%</div>
            <div style={s.kpiLabel}>APPROBATION</div>
          </div>
          <div style={s.kpiCard}>
            <div style={s.kpiIcon}>↗</div>
            <div style={s.kpiValue}>4.2M GNF</div>
            <div style={s.kpiLabel}>VOLUME CRÉDIT</div>
          </div>
        </div>

        <div style={s.chartCard}>
          <h2 style={s.sectionTitle}>ÉVOLUTION SOLVABILITÉ (MOYENNE HEBDOMADAIRE)</h2>
          <div style={{ marginTop: "1.5rem" }}>
            <LineChart data={WEEK_DATA} />
          </div>
        </div>

        <div style={s.thresholdGrid}>
          <div style={s.sliderCard}>
            <div style={s.sliderHeader}>
              <h2 style={s.sectionTitle}>GESTIONNAIRE DE SEUILS</h2>
            </div>
            <div style={s.sliderLabelRow}>
              <div>
                <p style={s.sliderName}>Seuil de Scoring Minimal</p>
                <p style={s.sliderDesc}>Détermine l'éligibilité automatique des dossiers</p>
              </div>
              <div style={{ ...s.sliderValue, color: sliderColor }}>{threshold}</div>
            </div>
            <div style={s.sliderTrackWrap}>
              <div style={s.sliderTrackBg}>
                <div style={{ ...s.sliderFill, width: `${threshold}%`, background: sliderColor }} />
              </div>
              <input type="range" min="0" max="100" value={threshold} onChange={e => setThreshold(Number(e.target.value))} style={s.sliderInput} />
            </div>
            <div style={s.sliderTooltip}>
              Les dossiers avec un score inférieur à <strong>{threshold}</strong> seront rejetés.
            </div>
          </div>

          <div style={s.impactCard}>
            <p style={s.impactLabel}>IMPACT ESTIMÉ</p>
            <div style={{ ...s.impactValue, color: sliderColor }}>{estimEligibles}%</div>
            <p style={s.impactSubLabel}>Taux d'éligibilité du portfolio</p>
            <div style={s.miniGauge}>
              <div style={{ ...s.miniGaugeFill, width: `${estimEligibles}%`, background: sliderColor }} />
            </div>
            <p style={{ ...s.impactWarning, color: sliderColor }}>
              {threshold >= 75 ? "POLITIQUE STRICTE" : threshold >= 55 ? "POLITIQUE MODÉRÉE" : "POLITIQUE AGRESSIVE"}
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

const s = {
  page: { padding: "2rem", color: "#fff" },
  header: { marginBottom: "1.5rem" },
  title: { fontSize: "1.5rem", fontWeight: "900", margin: 0 },
  subtitle: { color: "#64748b", fontSize: "0.85rem" },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" },
  kpiCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1.2rem" },
  kpiIcon: { color: "#3b82f6", fontSize: "1.2rem", marginBottom: "0.5rem" },
  kpiValue: { fontSize: "1.8rem", fontWeight: "900" },
  kpiLabel: { fontSize: "0.65rem", fontWeight: "bold", color: "#475569", letterSpacing: "1px" },
  sectionTitle: { fontSize: "0.7rem", fontWeight: "bold", color: "#475569", letterSpacing: "1px" },
  chartCard: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "1.5rem", marginBottom: "1.5rem" },
  thresholdGrid: { display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem" },
  sliderCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.5rem" },
  sliderHeader: { marginBottom: "1.5rem" },
  sliderLabelRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  sliderName: { fontSize: "0.9rem", fontWeight: "bold", margin: 0 },
  sliderDesc: { fontSize: "0.75rem", color: "#64748b", margin: 0 },
  sliderValue: { fontSize: "2.5rem", fontWeight: "900" },
  sliderTrackWrap: { position: "relative", height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px" },
  sliderTrackBg: { height: "100%", borderRadius: "4px", overflow: "hidden" },
  sliderFill: { height: "100%", transition: "width 0.1s" },
  sliderInput: { position: "absolute", top: "-6px", left: 0, width: "100%", opacity: 0, cursor: "pointer" },
  sliderTooltip: { marginTop: "1.5rem", padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", fontSize: "0.8rem", color: "#94a3b8" },
  impactCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.5rem", textAlign: "center" },
  impactLabel: { fontSize: "0.65rem", fontWeight: "bold", color: "#475569", letterSpacing: "1px", marginBottom: "1rem" },
  impactValue: { fontSize: "3.5rem", fontWeight: "900", marginBottom: "0.5rem" },
  impactSubLabel: { fontSize: "0.75rem", color: "#64748b", marginBottom: "1rem" },
  miniGauge: { height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden", marginBottom: "1rem" },
  miniGaugeFill: { height: "100%", transition: "width 0.3s" },
  impactWarning: { fontSize: "0.7rem", fontWeight: "bold" }
};
