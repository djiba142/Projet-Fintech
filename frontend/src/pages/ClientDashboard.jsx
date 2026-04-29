import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import axios from "axios";

const API = "http://localhost:8000";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const user = JSON.parse(localStorage.getItem("kandjou_user") || "{}");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("kandjou_token");
      const [resData, resTx] = await Promise.all([
        axios.get(`${API}/m1/aggregate/${user.username}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/m1/transactions/${user.username}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setData(resData.data);
      setTransactions(resTx.data.transactions.slice(0, 5));
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expirée. Veuillez vous reconnecter.");
      } else {
        setError("Erreur de synchronisation API");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.username) fetchData();
    else navigate("/login");
  }, []);

  const quickActions = [
    { label: "Transactions", icon: "📄", path: "/transactions" },
    { label: "Transfert", icon: "⇄", path: "/transfers" },
    { label: "Score Crédit", icon: "🛡️", path: "/score" },
    { label: "Mon Profil", icon: "👤", path: "/profile" },
  ];

  if (loading) return (
    <MainLayout>
      <div style={{ display: "flex", justifyContent: "center", padding: "10rem 0" }}>
        <div style={{ width: 40, height: 40, border: "4px solid #006233", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Header Section */}
        <header style={{ marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#1E293B", letterSpacing: "-1px" }}>
            Bonjour {user.fullname || "Kadiatou Bah"} 👋
          </h1>
          <p style={{ color: "#64748B", fontSize: "0.9rem", fontWeight: 500, marginTop: "0.2rem" }}>
            Voici la vue consolidée de vos comptes.
          </p>
        </header>

        {error ? (
          <div style={{ background: "#FEF2F2", padding: "2rem", borderRadius: 16, textAlign: "center", color: "#991B1B" }}>
            <p style={{ fontWeight: 700 }}>{error}</p>
            <button onClick={() => navigate("/login")} style={{ marginTop: "1rem", color: "#991B1B", fontWeight: 800, textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}>Se reconnecter</button>
          </div>
        ) : data && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

            {/* Total Balance Card */}
            <div style={{
              background: "#fff", borderRadius: 20, padding: "2.5rem",
              boxShadow: "0 10px 25px rgba(0,0,0,0.03)", border: "1px solid #E2E8F0",
              textAlign: "center", position: "relative"
            }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "#94A3B8", letterSpacing: 1.5, marginBottom: "0.5rem" }}>Solde total consolidé</p>
              <h2 style={{ fontSize: "3.5rem", fontWeight: 950, color: "#0F172A", letterSpacing: "-2.5px" }}>
                {data.consolidation.total_balance.toLocaleString()} <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "#64748B" }}>GNF</span>
              </h2>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: "1rem" }}>
                <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "#94A3B8" }}>Mis à jour : {new Date().toLocaleDateString()} - {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <button onClick={fetchData} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem" }}>🔄</button>
              </div>

              <div style={{ position: "absolute", top: 15, right: 20, opacity: 0.1, fontWeight: 900, fontSize: "0.6rem" }}>GN-CONNECT</div>
            </div>

            {/* Operator Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
              {/* Orange */}
              <div style={{
                background: "#F37021", padding: "1.8rem", borderRadius: 18, color: "#fff",
                boxShadow: "0 10px 20px rgba(243,112,33,0.2)", position: "relative", overflow: "hidden"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <img src="/orange.png" alt="Orange" style={{ height: 32, borderRadius: 8 }} />
                  <span style={{ fontSize: "0.6rem", fontWeight: 800, background: "rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: 6 }}>Actif</span>
                </div>
                <p style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.4rem", opacity: 0.9 }}>Orange Money Guinée</p>
                <p style={{ fontSize: "1.8rem", fontWeight: 950, marginBottom: "1rem" }}>{data.consolidation.orange_balance.toLocaleString()} <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>GNF</span></p>
                <button
                  onClick={() => navigate("/transactions?filter=orange")}
                  style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: "0.65rem", fontWeight: 800, padding: "8px 12px", borderRadius: 10, cursor: "pointer", width: "100%" }}
                >Voir détails</button>
              </div>

              {/* MTN */}
              <div style={{
                background: "#FFCC00", padding: "1.8rem", borderRadius: 18, color: "#1E293B",
                boxShadow: "0 10px 20px rgba(255,204,0,0.15)", position: "relative", overflow: "hidden"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <img src="/mtn.png" alt="MTN" style={{ height: 32, borderRadius: 8 }} />
                  <span style={{ fontSize: "0.6rem", fontWeight: 800, background: "rgba(0,0,0,0.05)", padding: "4px 8px", borderRadius: 6 }}>Actif</span>
                </div>
                <p style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.4rem", opacity: 0.8 }}>MTN Mobile Money</p>
                <p style={{ fontSize: "1.8rem", fontWeight: 950, marginBottom: "1rem" }}>{data.consolidation.mtn_balance.toLocaleString()} <span style={{ fontSize: "0.8rem", opacity: 0.5 }}>GNF</span></p>
                <button
                  onClick={() => navigate("/transactions?filter=mtn")}
                  style={{ background: "rgba(0,0,0,0.05)", border: "none", color: "#1E293B", fontSize: "0.65rem", fontWeight: 800, padding: "8px 12px", borderRadius: 10, cursor: "pointer", width: "100%" }}
                >Voir détails</button>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
              {quickActions.map(action => (
                <button key={action.label} onClick={() => navigate(action.path)} style={{
                  background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16,
                  padding: "1.5rem 0.5rem", display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 10, cursor: "pointer", transition: "all 0.2s",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                }} className="hover:border-green-500 hover:shadow-md">
                  <span style={{ fontSize: "1.8rem" }}>{action.icon}</span>
                  <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#64748B", textTransform: "uppercase", textAlign: "center" }}>{action.label}</span>
                </button>
              ))}
            </div>

            {/* Recent Transactions Section */}
            <section style={{ background: "#fff", borderRadius: 24, padding: "2rem", border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#1E293B" }}>Dernières Transactions</h3>
                <button onClick={() => navigate("/transactions")} style={{ background: "none", border: "none", color: "#006233", fontWeight: 800, fontSize: "0.75rem", cursor: "pointer", textDecoration: "underline" }}>Tout voir</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {transactions.length > 0 ? transactions.map(tx => (
                  <div key={tx.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", borderRadius: 16, background: "#F8FAFC", border: "1px solid #F1F5F9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
                        <img src={tx.op === "ORANGE" ? "/orange.png" : "/mtn.png"} alt={tx.op} style={{ height: 24, borderRadius: 4 }} />
                      </div>
                      <div>
                        <p style={{ fontSize: "0.85rem", fontWeight: 800, color: "#1E293B" }}>{tx.desc}</p>
                        <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "#94A3B8" }}>{new Date(tx.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p style={{
                      fontSize: "1rem", fontWeight: 950,
                      color: tx.type === "CREDIT" ? "#10B981" : "#EF4444"
                    }}>
                      {tx.type === "CREDIT" ? "+" : "-"} {tx.amount.toLocaleString()}
                    </p>
                  </div>
                )) : (
                  <p style={{ textAlign: "center", color: "#64748B", fontSize: "0.85rem", padding: "1rem" }}>Aucune transaction récente.</p>
                )}
              </div>
            </section>

            <p style={{ textAlign: "center", fontSize: "0.6rem", fontWeight: 800, color: "#CBD5E1", textTransform: "uppercase", letterSpacing: 2.5, marginTop: "1rem" }}>
              GN-CONNECT Secure Infrastructure • Plateforme Régulée
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
