import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { AlertTriangle, CheckCircle2, BarChart3, Shield, Save, Info, TrendingDown, RefreshCcw } from "lucide-react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function RiskDashboard() {
  const { user, token } = useAuth();
  const [data, setData] = useState({
    kpis: { avg_score: 0, high_risk_percent: 0, credits_active: 0, defaults: 0, total_exposure: 0 },
    score_distribution: []
  });
  const [alerts, setAlerts] = useState([]);

  useEffect(() => { if (token) fetchRiskData(); }, [token]);

  const fetchRiskData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [resOverview, resAlerts, resThreshold] = await Promise.all([
        axios.get(`${API}/m1/risk/overview`, { headers }),
        axios.get(`${API}/m1/risk/alerts`, { headers }),
        axios.get(`${API}/m1/risk/threshold`, { headers })
      ]);
      setData(resOverview.data);
      setAlerts(resAlerts.data);
      if (resThreshold.data?.threshold) setThreshold(resThreshold.data.threshold);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/m1/risk/threshold`, { threshold: config.auto_approve_threshold }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Paramètres enregistrés avec succès !");
    } catch (err) { alert("Erreur lors de l'enregistrement"); }
    finally { setSaving(false); }
  };

  const kpis = [
    { label: "Score moyen portefeuille", val: `${data.kpis.avg_score}/100`, icon: <BarChart3 size={20} />, color: "#2563EB", bg: "#EFF6FF" },
    { label: "Part à haut risque", val: `${data.kpis.high_risk_percent}%`, icon: <AlertTriangle size={20} />, color: "#DC2626", bg: "#FEF2F2" },
    { label: "Crédits actifs", val: data.kpis.credits_active, icon: <CheckCircle2 size={20} />, color: "#059669", bg: "#F0FDF4" },
    { label: "Alertes actives", val: alerts.length, icon: <Shield size={20} />, color: "#DC2626", bg: "#FEF2F2" },
  ];

  const barData = data.score_distribution.map(d => d.count);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <RefreshCcw size={40} className="spin" color="#2563EB" />
      <p style={{ marginTop: "1rem", fontWeight: 700, color: "#64748B" }}>Chargement des données de risque...</p>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <>
      <div className="risk-page">
        {/* Header */}
        <div className="risk-header">
          <div>
            <h1 className="risk-title">Politique de Risque</h1>
            <p className="risk-subtitle">Configuration des seuils d'éligibilité et monitoring</p>
          </div>
        </div>

        {/* KPIs */}
        <div className="risk-kpi-row">
          {kpis.map((k, i) => (
            <div key={i} className="risk-kpi">
              <div className="risk-kpi-icon" style={{ color: k.color, background: k.bg }}>{k.icon}</div>
              <div>
                <span className="risk-kpi-label">{k.label}</span>
                <p className="risk-kpi-val" style={{ color: k.color }}>{k.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Two Columns */}
        <div className="risk-grid">
          {/* Left: Config */}
          <div className="risk-card">
            <h3 className="risk-card-title">Configuration des seuils</h3>
            <div className="risk-fields">
              {[
                { label: "Solde minimum consolidé (GNF)", key: "min_balance", desc: "Seuil minimal de liquidité" },
                { label: "Score d'activité minimal", key: "min_activity_score", desc: "Fréquence minimale sur 90j" },
                { label: "Seuil de risque élevé", key: "high_risk_threshold", desc: "Déclenche un audit manuel" },
                { label: "Seuil auto-approbation", key: "auto_approve_threshold", desc: "Validation sans agent" },
              ].map((item, i) => (
                <div key={i} className="risk-field">
                  <div className="risk-field-row">
                    <span className="risk-field-label">{item.label}</span>
                    <input
                      type="number"
                      value={config[item.key]}
                      onChange={e => setConfig({ ...config, [item.key]: parseInt(e.target.value) || 0 })}
                      className="risk-input"
                    />
                  </div>
                  <p className="risk-field-desc">{item.desc}</p>
                </div>
              ))}
            </div>
            <button className="risk-btn-save" onClick={handleSave} disabled={saving}>
              <Save size={16} /> {saving ? "Enregistrement..." : "Enregistrer les paramètres"}
            </button>
          </div>

          {/* Right: Alerts + Chart */}
          <div className="risk-right">
            <div className="risk-card">
              <h3 className="risk-card-title">Alertes actives</h3>
              <div className="risk-alerts">
                {alerts.map((a, i) => (
                  <div key={i} className={`risk-alert ${a.severity?.toLowerCase() || 'low'}`}>
                    <div className={`risk-alert-dot ${a.severity?.toLowerCase() || 'low'}`}></div>
                    <div>
                      <p className="risk-alert-msg">{a.details}</p>
                      <span className="risk-alert-meta">{new Date(a.created_at).toLocaleTimeString()} • {a.type}</span>
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && <p style={{ textAlign: "center", padding: "1rem", color: "#94A3B8", fontSize: "0.8rem" }}>Aucune alerte active.</p>}
              </div>

              <h3 className="risk-card-title" style={{ marginTop: "2rem" }}>Distribution du risque</h3>
              <div className="risk-bars">
                {barData.map((h, i) => (
                  <div key={i} className="risk-bar" style={{
                    height: `${h}%`,
                    background: h > 70 ? "#059669" : h < 35 ? "#EF4444" : "#F59E0B",
                  }}></div>
                ))}
              </div>
              <div className="risk-bars-legend">
                <span>Faible</span><span>Critique</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="risk-info">
          <Info size={20} />
          <div>
            <p className="risk-info-title">Algorithme de scoring V4.2 actif</p>
            <p className="risk-info-desc">Les critères incluent le ratio d'utilisation Orange vs MTN et l'ancienneté des comptes.</p>
          </div>
        </div>
      </div>

      <style>{`
        .risk-page { animation: riskFade .4s ease; color: #1A202C; }
        @keyframes riskFade { from{opacity:0;transform:translateY(5px);} to{opacity:1;transform:translateY(0);} }

        .risk-header { margin-bottom: 2rem; }
        .risk-title { font-size: 1.75rem; font-weight: 900; margin: 0; letter-spacing: -1px; }
        .risk-subtitle { margin: 4px 0 0; color: #718096; font-weight: 600; font-size: .9rem; }

        .risk-kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2.5rem; }
        .risk-kpi { background: #fff; padding: 1.5rem; border-radius: 20px; border: 1px solid #E2E8F0; display: flex; align-items: center; gap: 1.2rem; }
        .risk-kpi-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
        .risk-kpi-label { font-size: .65rem; font-weight: 900; color: #A0AEC0; text-transform: uppercase; letter-spacing: .5px; }
        .risk-kpi-val { font-size: 1.5rem; font-weight: 900; margin: 4px 0 0; }

        .risk-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem; }
        @media(max-width:1024px) { .risk-grid { grid-template-columns: 1fr; } .risk-kpi-row { grid-template-columns: 1fr 1fr; } }

        .risk-card { background: #fff; padding: 2rem; border-radius: 24px; border: 1px solid #E2E8F0; }
        .risk-card-title { font-size: .7rem; font-weight: 900; color: #A0AEC0; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 1.5rem; }

        .risk-fields { display: flex; flex-direction: column; gap: 1.5rem; }
        .risk-field-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
        .risk-field-label { font-size: .85rem; font-weight: 800; color: #2D3748; }
        .risk-input { width: 100px; text-align: right; font-size: .9rem; font-weight: 900; background: #F7FAFC; border: 2px solid #E2E8F0; border-radius: 12px; padding: .6rem .8rem; outline: none; transition: .2s; }
        .risk-input:focus { border-color: #2D6A4F; }
        .risk-field-desc { font-size: .7rem; color: #A0AEC0; margin: 0; }

        .risk-btn-save { margin-top: 2rem; width: 100%; padding: 1rem; background: #2D6A4F; color: #fff; border: none; border-radius: 14px; font-size: .85rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: .2s; }
        .risk-btn-save:hover { background: #1A3A2A; }
        .risk-btn-save:disabled { opacity: .6; cursor: not-allowed; }

        .risk-right { display: flex; flex-direction: column; gap: 1.5rem; }

        .risk-alerts { display: flex; flex-direction: column; gap: .8rem; }
        .risk-alert { display: flex; align-items: flex-start; gap: 12px; padding: 1rem 1.2rem; border-radius: 16px; border: 1px solid; }
        .risk-alert.high { background: #FEF2F2; border-color: #FECACA; }
        .risk-alert.medium { background: #FFFBEB; border-color: #FDE68A; }
        .risk-alert-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
        .risk-alert-dot.high { background: #EF4444; }
        .risk-alert-dot.medium { background: #F59E0B; }
        .risk-alert-msg { margin: 0; font-size: .85rem; font-weight: 800; color: #2D3748; }
        .risk-alert-meta { font-size: .7rem; color: #A0AEC0; font-weight: 700; }

        .risk-bars { height: 120px; display: flex; align-items: flex-end; gap: 4px; padding: 0 4px; }
        .risk-bar { flex: 1; border-radius: 4px 4px 0 0; opacity: .7; transition: .3s; }
        .risk-bar:hover { opacity: 1; }
        .risk-bars-legend { display: flex; justify-content: space-between; margin-top: 8px; }
        .risk-bars-legend span { font-size: .65rem; font-weight: 800; color: #A0AEC0; }

        .risk-info { margin-top: .5rem; padding: 1.5rem; background: #EFF6FF; border-radius: 20px; border: 1px solid #BFDBFE; display: flex; align-items: flex-start; gap: 1rem; color: #1E40AF; }
        .risk-info-title { margin: 0; font-size: .85rem; font-weight: 900; }
        .risk-info-desc { margin: 4px 0 0; font-size: .75rem; color: #3B82F6; font-weight: 600; }
      `}</style>
    </>
  );
}
