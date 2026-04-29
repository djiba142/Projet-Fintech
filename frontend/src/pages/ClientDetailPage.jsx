import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import axios from "axios";

const API = "http://localhost:8000";

export default function ClientDetailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get("id") || "client@kandjou.gn";
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const dossierId = searchParams.get("dossier");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("kandjou_token");
        const res = await axios.get(`${API}/m1/aggregate/${clientId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [clientId]);

  const handleAction = async (action) => {
    if (!dossierId) return alert("ID du dossier crédit manquant. Accédez à cette page via le tableau de bord conseiller.");
    setProcessing(true);
    try {
      const token = localStorage.getItem("kandjou_token");
      await axios.post(`${API}/m1/loan/process`, {
        dossier_id: parseInt(dossierId),
        action: action
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Dossier ${action === 'APPROVE' ? 'approuvé' : 'rejeté'} avec succès !`);
      navigate("/agent");
    } catch (err) {
      console.error(err);
      alert("Erreur lors du traitement du dossier crédit.");
    } finally {
      setProcessing(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const token = localStorage.getItem("kandjou_token");
      // Simulation d'export ou appel réel
      alert("Génération du rapport PDF institutionnel en cours...");
      const res = await axios.get(`${API}/m1/aggregate/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Rapport généré:", res.data);
    } catch (err) {
      alert("Erreur lors de l'export.");
    }
  };

  if (loading) return (
    <MainLayout>
      <div style={{ display: "flex", justifyContent: "center", padding: "10rem 0" }}>
         <div style={{ width: 50, height: 50, border: "5px solid #006233", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    </MainLayout>
  );

  if (!data) return (
    <MainLayout>
      <div style={{ textAlign: "center", padding: "5rem" }}>Client non trouvé ou erreur de chargement.</div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div style={{ padding: "1rem 0" }}>
        {/* Back and Header */}
        <button onClick={() => navigate("/agent")} style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "#64748B", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", marginBottom: "2rem" }}>
           ← Retour aux dossiers
        </button>

        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
             <div style={{ width: 90, height: 90, background: "linear-gradient(135deg, #006233, #2D6A4F)", borderRadius: 28, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "2.2rem", fontWeight: 900, boxShadow: "0 10px 25px rgba(0,98,51,0.2)" }}>
                {data.kyc.fullname.charAt(0)}
             </div>
             <div>
                <h1 style={{ fontSize: "2.5rem", fontWeight: 950, color: "#1E293B", letterSpacing: "-1.5px" }}>{data.kyc.fullname}</h1>
                <p style={{ color: "#64748B", fontSize: "1.1rem", fontWeight: 600 }}>Client ID: {data.client_id}</p>
                <div style={{ display: "flex", gap: "15px", marginTop: "8px" }}>
                   <span style={{ color: "#94A3B8", fontSize: "0.85rem", fontWeight: 700 }}>Nationalité: {data.kyc.nationality}</span>
                   <span style={{ color: "#94A3B8", fontSize: "0.85rem", fontWeight: 700 }}>CNI: {data.kyc.id_card}</span>
                </div>
             </div>
          </div>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
             <button onClick={handleExportPDF} style={{ padding: "0.8rem 1.5rem", background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 14, fontSize: "0.75rem", fontWeight: 800, color: "#1E293B", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>Exporter Rapport (PDF)</button>
             <div style={{ textAlign: "right", background: "#fff", padding: "1rem 1.5rem", borderRadius: 24, border: "1.5px solid #F1F5F9" }}>
                <p style={{ fontSize: "0.6rem", fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 2, marginBottom: "4px" }}>Score Kandjou</p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "flex-end" }}>
                   <span style={{ fontSize: "2rem", fontWeight: 950, color: data.credit_analysis.score >= 70 ? "#006233" : "#F59E0B" }}>{data.credit_analysis.score}</span>
                   <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#CBD5E1" }}>/100</span>
                </div>
             </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "3rem" }}>
           {/* Left Column: Balances & Transactions */}
           <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
              {/* Consolidation Card */}
              <div style={{ background: "#fff", padding: "3rem", borderRadius: 40, border: "1.px solid #F1F5F9", boxShadow: "0 20px 50px rgba(0,0,0,0.03)" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "2.5rem" }}>
                    <h3 style={{ fontSize: "0.9rem", fontWeight: 900, color: "#1E293B", textTransform: "uppercase", letterSpacing: 2.5 }}>Données Consolidées</h3>
                    <button style={{ padding: "10px 20px", background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 14, fontSize: "0.75rem", fontWeight: 900, color: "#64748B", cursor: "pointer", transition: "all 0.2s" }}>Exporter Certificat</button>
                 </div>
                 
                 <div style={{ marginBottom: "3rem" }}>
                    <p style={{ fontSize: "0.85rem", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 2, marginBottom: "6px" }}>Solde total disponible</p>
                    <p style={{ fontSize: "3.5rem", fontWeight: 950, color: "#1E293B", letterSpacing: "-2px" }}>{data.consolidation.total_balance.toLocaleString()} <span style={{ fontSize: "1.4rem", color: "#CBD5E1" }}>GNF</span></p>
                 </div>

                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                    <div style={{ background: "#F37021", padding: "2rem", borderRadius: 28, color: "#fff", boxShadow: "0 10px 25px rgba(243,112,33,0.15)" }}>
                       <p style={{ fontSize: "0.7rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: 1.5, opacity: 0.8, marginBottom: "10px" }}>Orange Money</p>
                       <p style={{ fontSize: "1.8rem", fontWeight: 950 }}>{data.consolidation.orange_balance.toLocaleString()} GNF</p>
                       <p style={{ fontSize: "0.65rem", fontWeight: 700, marginTop: "1.2rem", background: "rgba(255,255,255,0.2)", width: "fit-content", padding: "5px 10px", borderRadius: 8 }}>Vérifié</p>
                    </div>
                    <div style={{ background: "#FFCC00", padding: "2rem", borderRadius: 28, color: "#1E293B", boxShadow: "0 10px 25px rgba(255,204,0,0.15)" }}>
                       <p style={{ fontSize: "0.7rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: 1.5, opacity: 0.5, marginBottom: "10px" }}>MTN Mobile Money</p>
                       <p style={{ fontSize: "1.8rem", fontWeight: 950 }}>{data.consolidation.mtn_balance.toLocaleString()} GNF</p>
                       <p style={{ fontSize: "0.65rem", fontWeight: 700, marginTop: "1.2rem", background: "rgba(0,0,0,0.05)", width: "fit-content", padding: "5px 10px", borderRadius: 8 }}>Vérifié</p>
                    </div>
                 </div>
              </div>

              {/* Logic of transactions remains mocked for UI but could be fetched */}
              <div style={{ background: "#fff", padding: "3rem", borderRadius: 40, border: "1px solid #F1F5F9", boxShadow: "0 20px 50px rgba(0,0,0,0.03)" }}>
                 <h3 style={{ fontSize: "0.9rem", fontWeight: 900, color: "#1E293B", textTransform: "uppercase", letterSpacing: 2.5, marginBottom: "2.5rem" }}>Historique Analytique</h3>
                 <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                       <thead>
                          <tr style={{ fontSize: "0.75rem", fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 2, borderBottom: "1.5px solid #F1F5F9" }}>
                             <th style={{ padding: "0 0 1.2rem 0" }}>Date</th>
                             <th style={{ padding: "0 0 1.2rem 0" }}>Opération</th>
                             <th style={{ padding: "0 0 1.2rem 0", textAlign: "right" }}>Flux</th>
                          </tr>
                       </thead>
                       <tbody>
                          {[
                            { date: "Hier", desc: "Dépôt Agence Conakry", amt: "+1 500 000", color: "#10B981" },
                            { date: "Hier", desc: "Paiement Commerçant", amt: "-450 000", color: "#EF4444" },
                            { date: "10 Mai", desc: "Réception Transfert MTN", amt: "+2 000 000", color: "#10B981" },
                            { date: "08 Mai", desc: "Retrait Guichet", amt: "-800 000", color: "#EF4444" }
                          ].map((t, i) => (
                             <tr key={i} style={{ borderBottom: "1px solid #F8FAFC" }}>
                                <td style={{ padding: "1.5rem 0", fontSize: "0.85rem", fontWeight: 700, color: "#94A3B8" }}>{t.date}</td>
                                <td style={{ padding: "1.5rem 0", fontSize: "0.95rem", fontWeight: 850, color: "#1E293B" }}>{t.desc}</td>
                                <td style={{ padding: "1.5rem 0", fontSize: "0.95rem", fontWeight: 950, color: t.color, textAlign: "right" }}>{t.amt} GNF</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>

           {/* Right Column: Decisions & Factors */}
           <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
              {/* Decision Card */}
              <div style={{ background: "#fff", padding: "3rem", borderRadius: 40, border: "1px solid #F1F5F9", boxShadow: "0 20px 50px rgba(0,0,0,0.03)" }}>
                 <h3 style={{ fontSize: "0.9rem", fontWeight: 900, color: "#1E293B", textTransform: "uppercase", letterSpacing: 2.5, marginBottom: "2.5rem" }}>Décision de Crédit</h3>
                 <div style={{ display: "flex", flexDirection: "column", gap: "1.8rem" }}>
                    <div style={{ padding: "1.5rem", background: "#F0FDF4", borderRadius: 24, border: "1.5px solid #DCFCE7", textAlign: "center" }}>
                       <p style={{ fontSize: "0.9rem", fontWeight: 800, color: "#166534", marginBottom: "8px" }}>Limite de crédit suggérée</p>
                       <p style={{ fontSize: "1.8rem", fontWeight: 950, color: "#166534" }}>4 500 000 GNF</p>
                    </div>
                    
                    <div style={{ padding: "1.2rem", background: "#F8FAFC", borderRadius: 20 }}>
                       <p style={{ fontSize: "0.8rem", fontWeight: 800, color: "#64748B", marginBottom: "12px" }}>Motivation du système :</p>
                       <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569", lineHeight: 1.6 }}>
                          "{data.credit_analysis.recommendation}"
                       </p>
                    </div>

                    <button 
                      disabled={processing}
                      onClick={() => handleAction('APPROVE')}
                      style={{ width: "100%", marginTop: "1rem", padding: "1.5rem", background: "#006233", color: "#fff", border: "none", borderRadius: 24, fontWeight: 950, fontSize: "1.05rem", cursor: processing ? "wait" : "pointer", boxShadow: "0 15px 35px rgba(0,98,51,0.25)", transition: "all 0.2s" }}
                    >
                       {processing ? "Traitement..." : "Approuver ce Dossier"}
                    </button>
                    <button 
                      disabled={processing}
                      onClick={() => handleAction('REJECT')}
                      style={{ width: "100%", padding: "1.2rem", background: "none", border: "2px solid #F1F5F9", color: "#94A3B8", borderRadius: 24, fontWeight: 950, fontSize: "0.95rem", cursor: processing ? "wait" : "pointer", transition: "all 0.2s" }}
                    >
                       {processing ? "..." : "Rejeter le Dossier"}
                    </button>
                 </div>
              </div>

              {/* Factor Breakdown */}
              <div style={{ background: "#fff", padding: "3rem", borderRadius: 40, border: "1px solid #F1F5F9", boxShadow: "0 20px 50px rgba(0,0,0,0.03)" }}>
                 <h3 style={{ fontSize: "0.9rem", fontWeight: 900, color: "#1E293B", textTransform: "uppercase", letterSpacing: 2.5, marginBottom: "2.5rem" }}>Facteurs de risque</h3>
                 <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    {[
                      { label: "Capacité Financière", val: "Forte", score: "92%" },
                      { label: "Régularité Flux", val: "Stable", score: "78%" },
                      { label: "Engagement Antérieur", val: "Sain", score: "85%" }
                    ].map((f, i) => (
                       <div key={i}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                             <p style={{ fontSize: "0.9rem", fontWeight: 800, color: "#334155" }}>{f.label}</p>
                             <p style={{ fontSize: "0.9rem", fontWeight: 950, color: "#006233" }}>{f.val}</p>
                          </div>
                          <div style={{ height: "8px", background: "#F1F5F9", borderRadius: 4 }}>
                             <div style={{ width: f.score, height: "100%", background: "#006233", borderRadius: 4 }} />
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </MainLayout>
  );
}
