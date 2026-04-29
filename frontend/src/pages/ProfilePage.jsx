import { useState } from "react";
import MainLayout from "../components/MainLayout";

export default function ProfilePage() {
  const user = JSON.parse(localStorage.getItem("kandjou_user") || "{}");
  const [consents, setConsents] = useState({
    creditRural: true,
    finadev: false,
    bcrg: true,
  });

  const toggleConsent = (key) => {
    setConsents(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: "4rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 900, color: "#1E293B", letterSpacing: "-1px" }}>Mon profil</h1>
          <p style={{ color: "#64748B", fontWeight: 600, fontSize: "0.95rem" }}>Gérez vos informations et vos autorisations</p>
        </div>

        {/* Profile Card with Tabs */}
        <div style={{ background: "#fff", borderRadius: 32, boxShadow: "0 10px 40px rgba(0,0,0,0.03)", border: "1px solid #f1f5f9", overflow: "hidden" }}>
          {/* Top Section with Avatar */}
          <div style={{ padding: "3rem", display: "flex", alignItems: "center", gap: "2.5rem", borderBottom: "1px solid #F1F5F9" }}>
            <div style={{ position: "relative" }}>
               <div style={{ width: 120, height: 120, background: "linear-gradient(135deg, #2D6A4F, #40916C)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "3rem", fontWeight: 900, boxShadow: "0 15px 30px rgba(45,106,79,0.2)" }}>
                  {user.fullname?.charAt(0) || "K"}
               </div>
               <div style={{ position: "absolute", bottom: 5, right: 5, width: 32, height: 32, background: "#10B981", border: "4px solid #fff", borderRadius: "50%" }} />
            </div>
            <div>
              <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "#1E293B", marginBottom: "4px" }}>{user.fullname || "Kadiatou Bah"}</h2>
              <p style={{ fontSize: "1rem", color: "#64748B", fontWeight: 600 }}>Commerçante — Marché Madina, Conakry</p>
              <p style={{ fontSize: "0.9rem", color: "#2D6A4F", fontWeight: 700, marginTop: "8px" }}>{user.username || "+224 622 12 34 56"}</p>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "2rem", padding: "0 3rem", borderBottom: "1px solid #F1F5F9" }}>
            {["Informations", "Comptes liés", "Sécurité"].map((tab, i) => (
              <button key={tab} style={{ 
                padding: "1.5rem 0", background: "none", border: "none", 
                borderBottom: i === 0 ? "3px solid #2D6A4F" : "3px solid transparent",
                color: i === 0 ? "#1E293B" : "#94A3B8", fontWeight: 800, fontSize: "0.9rem", cursor: "pointer"
              }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content: Informations */}
          <div style={{ padding: "3rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
            {[
              { label: "Email", value: user.email || "kadiatou.bah@email.com" },
              { label: "Date d'inscription", value: "15/03/2024" },
              { label: "Pièce d'identité", value: "CNI — 8023456789" },
              { label: "Adresse", value: "Madina, Commune de Matam, Conakry" },
            ].map((info, i) => (
              <div key={i}>
                <p style={{ fontSize: "0.7rem", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: "8px" }}>{info.label}</p>
                <p style={{ fontSize: "1rem", fontWeight: 700, color: "#334155" }}>{info.value}</p>
              </div>
            ))}
          </div>
          
          <div style={{ padding: "0 3rem 3rem" }}>
            <button style={{ 
              padding: "1.2rem 2.5rem", borderRadius: 16, border: "2px solid #F1F5F9", 
              background: "#fff", color: "#64748B", fontWeight: 800, fontSize: "0.9rem", cursor: "pointer"
            }}>
              Modifier mes informations
            </button>
          </div>
        </div>

        {/* Data Sharing Section (Keep this as it's important for the project) */}
        <div style={{ marginTop: "3rem", background: "#fff", padding: "2.5rem", borderRadius: 32, boxShadow: "0 10px 40px rgba(0,0,0,0.03)", border: "1px solid #f1f5f9" }}>
          <h2 style={{ fontSize: "0.8rem", fontWeight: 800, color: "#1E293B", textTransform: "uppercase", letterSpacing: 2, marginBottom: "1rem" }}>Partage de données & Confidentialité</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
             <p style={{ fontSize: "0.9rem", color: "#64748B", fontWeight: 500, lineHeight: 1.6 }}>
                Contrôlez quelles institutions peuvent consulter vos données financières. Vos données ne sont partagées qu'avec votre consentement explicite, conformément au règlement BCRG n°001/2019.
             </p>
             <div style={{ background: "#F0FDF4", padding: "1.5rem", borderRadius: 24, border: "1px solid #DCFCE7" }}>
                <p style={{ fontSize: "0.8rem", color: "#166534", fontWeight: 700 }}>
                   🛡️ Votre score de solvabilité est actuellement partagé avec 2 institutions de microfinance.
                </p>
             </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
