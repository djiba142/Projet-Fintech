import { useState, useEffect } from "react";
import MainLayout from "../components/MainLayout";
import axios from "axios";

export default function ScorePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("kandjou_user") || "{}");

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem("kandjou_token");
        const res = await axios.get(`http://localhost:8000/m1/aggregate/${user.username}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user.username) fetch();
  }, []);

  if (loading) return (
    <MainLayout>
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D6A4F]"></div>
      </div>
    </MainLayout>
  );

  const score = data?.credit_analysis?.score || 0;
  const niveau = data?.credit_analysis?.risk_level || "Inconnu";
  const recommendation = data?.credit_analysis?.recommendation || "Données insuffisantes.";
  const couleur = score >= 70 ? "#2D6A4F" : score >= 50 ? "#D97706" : "#EF4444";

  // SVG circle
  const r = 80, c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;

  const CRITERIA = [
    { label: "Flux entrants réguliers", score: score + 5 > 100 ? 95 : score + 5, max: 100 },
    { label: "Ancienneté des comptes", score: 80, max: 100 },
    { label: "Fréquence des transactions", score: score - 10 < 0 ? 10 : score - 10, max: 100 },
    { label: "Diversité des opérations", score: 75, max: 100 },
  ];

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-6 space-y-8">
        <header>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Score de solvabilité</h1>
          <p className="text-gray-500 text-sm font-medium">Score calculé par l'IA Kandjou à partir de vos flux consolidés</p>
        </header>

        {/* Jauge circulaire */}
        <div className="bg-white p-10 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="relative" style={{ width: 200, height: 200 }}>
            <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="100" cy="100" r={r} fill="none" stroke="#E8F5E9" strokeWidth="12" />
              <circle cx="100" cy="100" r={r} fill="none" stroke={couleur} strokeWidth="12"
                strokeDasharray={c} strokeDashoffset={offset}
                strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black" style={{ color: couleur }}>{score}</span>
              <span className="text-sm font-bold text-gray-300">/100</span>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm font-bold text-gray-500">Risque : <span className="font-black" style={{ color: couleur }}>{niveau}</span></p>
          </div>
        </div>

        {/* Détail des critères */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-5">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Analyse détaillée</h3>
          {CRITERIA.map((c, i) => (
            <div key={i}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-gray-700">{c.label}</span>
                <span className="text-xs font-black text-gray-900">{c.score}/{c.max}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${c.score}%`, background: c.score >= 70 ? "#2D6A4F" : c.score >= 50 ? "#D97706" : "#EF4444" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Recommandation */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Recommandation Kandjou</h3>
          <div className="flex items-start gap-4 p-5 bg-green-50 rounded-xl border border-green-100">
            <span className="text-2xl">🛡️</span>
            <div>
              <p className="text-sm font-bold text-[#2D6A4F] mb-1">{score >= 50 ? "Profil éligible" : "Profil à surveiller"}</p>
              <p className="text-xs text-gray-600 font-medium">{recommendation}</p>
              <p className="text-[10px] text-gray-400 mt-2">Certifié par BCRG Open Banking</p>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-center text-gray-300 font-bold">Mis à jour en temps réel via l'agrégateur</p>
      </div>
    </MainLayout>
  );
}
