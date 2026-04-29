import { useState } from "react";
import MainLayout from "../components/MainLayout";

export default function RiskDashboard() {
  const [config, setConfig] = useState({
    min_balance: 500000,
    min_activity_score: 40,
    high_risk_threshold: 30,
    auto_approve_threshold: 80,
  });

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto py-6 space-y-8">
        <header>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Politique de risque</h1>
          <p className="text-gray-500 text-sm font-medium">Configuration des seuils d'éligibilité et monitoring</p>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Score moyen portefeuille", val: "68/100", icon: "📊" },
            { label: "Clients à risque", val: "12", icon: "⚠️", color: "text-red-500" },
            { label: "Auto-approuvés", val: "86%", icon: "✅", color: "text-green-600" },
            { label: "Alertes actives", val: "2", icon: "🔴", color: "text-red-500" },
          ].map((s, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{s.icon}</span>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
              </div>
              <p className={`text-2xl font-black ${s.color || "text-gray-900"}`}>{s.val}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration seuils */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Configuration des seuils</h3>
            <div className="space-y-5">
              {[
                { label: "Solde minimum consolidé (GNF)", key: "min_balance", desc: "Seuil minimal de liquidité" },
                { label: "Score d'activité minimal", key: "min_activity_score", desc: "Fréquence minimale sur 90j" },
                { label: "Seuil de risque élevé", key: "high_risk_threshold", desc: "Déclenche un audit manuel" },
                { label: "Seuil auto-approbation", key: "auto_approve_threshold", desc: "Validation sans agent" },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-gray-700">{item.label}</span>
                    <input
                      type="number"
                      value={config[item.key]}
                      onChange={e => setConfig({ ...config, [item.key]: e.target.value })}
                      className="w-28 text-right text-sm font-black bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#2D6A4F]"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full py-3 bg-[#2D6A4F] text-white rounded-xl text-xs font-bold hover:bg-[#1A3A2A] transition-all">
              Enregistrer les paramètres
            </button>
          </div>

          {/* Alertes */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Alertes actives</h3>
            <div className="space-y-3">
              {[
                { type: "HIGH", msg: "Pic d'activité suspect sur 622***456", time: "14:20", color: "border-red-100 bg-red-50" },
                { type: "MEDIUM", msg: "Solde consolidé faible : 664***012", time: "13:05", color: "border-yellow-100 bg-yellow-50" },
              ].map((a, i) => (
                <div key={i} className={`p-4 rounded-xl border ${a.color}`}>
                  <div className="flex items-start gap-3">
                    <span className={`w-2 h-2 rounded-full mt-1.5 ${a.type === "HIGH" ? "bg-red-500" : "bg-yellow-500"}`} />
                    <div>
                      <p className="text-xs font-bold text-gray-700">{a.msg}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{a.time} • Priorité {a.type}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Distribution graphique */}
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-8 mb-4">Distribution du risque</h3>
            <div className="h-32 flex items-end gap-1.5 px-2">
              {[40, 25, 60, 85, 30, 45, 90, 75, 55, 65, 40, 30, 50, 70, 80].map((h, i) => (
                <div key={i} className="flex-1 rounded-t transition-all"
                  style={{
                    height: `${h}%`,
                    background: h > 70 ? "#2D6A4F" : h < 35 ? "#EF4444" : "#D97706",
                    opacity: 0.6,
                  }} />
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[9px] text-gray-400 font-bold">Faible</span>
              <span className="text-[9px] text-gray-400 font-bold">Critique</span>
            </div>
          </div>
        </div>

        {/* Info algorithme */}
        <div className="p-5 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-4">
          <span className="text-lg">ℹ️</span>
          <div>
            <p className="text-xs font-bold text-gray-800 mb-1">Algorithme de scoring V4.2 actif</p>
            <p className="text-[10px] text-gray-500">Les critères incluent le ratio d'utilisation Orange vs MTN et l'ancienneté des comptes.</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
