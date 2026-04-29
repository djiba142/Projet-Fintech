import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import {
  ArrowLeft,
  Search,
  Filter,
  ChevronRight,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw
} from "lucide-react";
import axios from "axios";

const API = "http://localhost:8000";

export default function TransactionsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialOpFilter = searchParams.get("filter") || "all";

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtres
  const [opFilter, setOpFilter] = useState(initialOpFilter);
  const [typeFilter, setTypeFilter] = useState("all"); // all, CREDIT, DEBIT
  const [dateFilter, setDateFilter] = useState("all"); // all, today, 7j, 30j
  const [search, setSearch] = useState("");

  const user = JSON.parse(localStorage.getItem("kandjou_user") || "{}");

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("kandjou_token");
      const res = await axios.get(`${API}/m1/transactions/${user.username}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data.transactions || []);
    } catch (err) {
      setError("Impossible de charger l'historique.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.username) fetchTransactions();
    else navigate("/login");
  }, []);

  // Logique de filtrage dynamique
  const filtered = useMemo(() => {
    return data.filter(t => {
      // Filtre Opérateur
      if (opFilter !== "all" && t.op.toLowerCase() !== opFilter.toLowerCase()) return false;

      // Filtre Type
      if (typeFilter !== "all" && t.type !== typeFilter) return false;

      // Filtre Date (simplifié pour le mock)
      if (dateFilter === "today") {
        const today = new Date().toISOString().split('T')[0];
        if (!t.date.startsWith(today)) return false;
      } else if (dateFilter === "7j") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        if (new Date(t.date) < sevenDaysAgo) return false;
      }

      // Recherche
      if (search && !t.desc.toLowerCase().includes(search.toLowerCase()) && !t.id.toLowerCase().includes(search.toLowerCase())) return false;

      return true;
    });
  }, [data, opFilter, typeFilter, dateFilter, search]);

  const stats = useMemo(() => {
    const totalIn = filtered.filter(t => t.type === "CREDIT").reduce((acc, t) => acc + t.amount, 0);
    const totalOut = filtered.filter(t => t.type === "DEBIT").reduce((acc, t) => acc + t.amount, 0);
    return { totalIn, totalOut };
  }, [filtered]);

  return (
    <MainLayout>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        {/* Header avec bouton Retour */}
        <header style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <button onClick={() => navigate("/dashboard")} style={{
            width: 40, height: 40, background: "#fff", border: "1px solid #E2E8F0",
            borderRadius: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <ArrowLeft size={18} color="#64748B" />
          </button>
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#1E293B", letterSpacing: "-1px" }}>Historique des transactions</h1>
            <p style={{ color: "#64748B", fontSize: "0.85rem", fontWeight: 600 }}>Gérez et analysez vos flux Orange et MTN</p>
          </div>

          <button onClick={fetchTransactions} style={{
            marginLeft: "auto", background: "#fff", border: "1px solid #E2E8F0", padding: "0.6rem 1rem",
            borderRadius: 12, fontSize: "0.75rem", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8
          }}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Actualiser
          </button>
        </header>

        {/* Zone de filtres avancée */}
        <div style={{
          background: "#fff", borderRadius: 20, padding: "1.5rem",
          marginBottom: "2rem", border: "1px solid #E2E8F0",
          boxShadow: "0 4px 12px rgba(0,0,0,0.02)"
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.2rem" }}>

            {/* Opérateur */}
            <div>
              <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", marginBottom: 8 }}>Opérateur</label>
              <div style={{ display: "flex", gap: 6 }}>
                {["all", "orange", "mtn"].map(op => (
                  <button key={op} onClick={() => setOpFilter(op)} style={{
                    flex: 1, padding: "8px", borderRadius: 10, fontSize: "0.7rem", fontWeight: 800,
                    textTransform: "capitalize", cursor: "pointer", border: "1px solid",
                    background: opFilter === op ? "#1E293B" : "#F8FAFC",
                    color: opFilter === op ? "#fff" : "#64748B",
                    borderColor: opFilter === op ? "#1E293B" : "#E2E8F0"
                  }}>{op === "all" ? "Tous" : op}</button>
                ))}
              </div>
            </div>

            {/* Type de flux */}
            <div>
              <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", marginBottom: 8 }}>Flux</label>
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  { id: "all", label: "Tous" },
                  { id: "CREDIT", label: "Entrées" },
                  { id: "DEBIT", label: "Sorties" }
                ].map(t => (
                  <button key={t.id} onClick={() => setTypeFilter(t.id)} style={{
                    flex: 1, padding: "8px", borderRadius: 10, fontSize: "0.7rem", fontWeight: 800,
                    cursor: "pointer", border: "1px solid",
                    background: typeFilter === t.id ? "#1E293B" : "#F8FAFC",
                    color: typeFilter === t.id ? "#fff" : "#64748B",
                    borderColor: typeFilter === t.id ? "#1E293B" : "#E2E8F0"
                  }}>{t.label}</button>
                ))}
              </div>
            </div>

            {/* Période */}
            <div>
              <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", marginBottom: 8 }}>Période</label>
              <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={{
                width: "100%", padding: "8px", borderRadius: 10, fontSize: "0.75rem", fontWeight: 700,
                background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#1E293B", outline: "none"
              }}>
                <option value="all">Historique complet</option>
                <option value="today">Aujourd'hui</option>
                <option value="7j">Derniers 7 jours</option>
                <option value="30j">Derniers 30 jours</option>
              </select>
            </div>

            {/* Recherche */}
            <div>
              <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", marginBottom: 8 }}>Recherche rapide</label>
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                <input type="text" placeholder="Référence, marchand..." value={search} onChange={(e) => setSearch(e.target.value)} style={{
                  width: "100%", padding: "8px 12px 8px 34px", borderRadius: 10, fontSize: "0.75rem", fontWeight: 700,
                  background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#1E293B", outline: "none"
                }} />
              </div>
            </div>

          </div>
        </div>

        {/* Résumé des Flux sur la sélection */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ background: "#ECFDF5", padding: "1.2rem", borderRadius: 16, border: "1px solid #D1FAE5" }}>
            <p style={{ fontSize: "0.6rem", fontWeight: 900, color: "#065F46", textTransform: "uppercase", letterSpacing: 1 }}>Total Entrées</p>
            <p style={{ fontSize: "1.4rem", fontWeight: 950, color: "#065F46" }}>+{stats.totalIn.toLocaleString()} <span style={{ fontSize: "0.8rem", opacity: 0.6 }}>GNF</span></p>
          </div>
          <div style={{ background: "#FEF2F2", padding: "1.2rem", borderRadius: 16, border: "1px solid #FEE2E2" }}>
            <p style={{ fontSize: "0.6rem", fontWeight: 900, color: "#991B1B", textTransform: "uppercase", letterSpacing: 1 }}>Total Sorties</p>
            <p style={{ fontSize: "1.4rem", fontWeight: 950, color: "#991B1B" }}>-{stats.totalOut.toLocaleString()} <span style={{ fontSize: "0.8rem", opacity: 0.6 }}>GNF</span></p>
          </div>
        </div>

        {/* Liste des Transactions */}
        {loading ? (
          <div style={{ padding: "5rem 0", textAlign: "center" }}>
            <div style={{ width: 30, height: 30, border: "3px solid #1E293B", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
            <p style={{ marginTop: "1rem", color: "#94A3B8", fontSize: "0.8rem", fontWeight: 700 }}>Chargement des données...</p>
          </div>
        ) : error ? (
          <div style={{ background: "#FEF2F2", padding: "3rem", borderRadius: 20, textAlign: "center", color: "#991B1B", border: "1px solid #FEE2E2" }}>
            <p style={{ fontWeight: 800 }}>{error}</p>
            <button onClick={fetchTransactions} style={{ marginTop: "1rem", background: "#991B1B", color: "#fff", border: "none", padding: "0.6rem 1.2rem", borderRadius: 10, fontWeight: 800, cursor: "pointer" }}>Réessayer</button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: "#fff", padding: "5rem 0", borderRadius: 20, textAlign: "center", border: "1px solid #E2E8F0" }}>
            <p style={{ color: "#94A3B8", fontSize: "0.9rem", fontWeight: 700 }}>Aucune transaction ne correspond à vos filtres.</p>
            <button onClick={() => { setOpFilter("all"); setTypeFilter("all"); setDateFilter("all"); setSearch(""); }} style={{ marginTop: "1rem", color: "#1E293B", fontWeight: 800, fontSize: "0.8rem", background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}>Réinitialiser les filtres</button>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                  <th style={{ padding: "1.2rem", textAlign: "left", fontSize: "0.65rem", fontWeight: 900, color: "#94A3B8", textTransform: "uppercase" }}>Détails</th>
                  <th style={{ padding: "1.2rem", textAlign: "left", fontSize: "0.65rem", fontWeight: 900, color: "#94A3B8", textTransform: "uppercase" }}>Opérateur</th>
                  <th style={{ padding: "1.2rem", textAlign: "right", fontSize: "0.65rem", fontWeight: 900, color: "#94A3B8", textTransform: "uppercase" }}>Montant</th>
                  <th style={{ padding: "1.2rem", textAlign: "center", fontSize: "0.65rem", fontWeight: 900, color: "#94A3B8", textTransform: "uppercase" }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx, idx) => (
                  <tr key={tx.id} style={{ borderBottom: idx === filtered.length - 1 ? "none" : "1px solid #F1F5F9", transition: "background 0.2s" }} className="hover:bg-slate-50">

                    {/* Date & Description */}
                    <td style={{ padding: "1.2rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: 12,
                          background: tx.type === "CREDIT" ? "#DCFCE7" : "#FEE2E2",
                          display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                          {tx.type === "CREDIT" ? <ArrowDownLeft size={20} color="#166534" /> : <ArrowUpRight size={20} color="#991B1B" />}
                        </div>
                        <div>
                          <p style={{ fontSize: "0.85rem", fontWeight: 800, color: "#1E293B", marginBottom: 2 }}>{tx.desc}</p>
                          <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "#94A3B8" }}>
                            {new Date(tx.date).toLocaleDateString()} • {tx.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Opérateur */}
                    <td style={{ padding: "1.2rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <img
                          src={tx.op === "ORANGE" ? "/orange.png" : "/mtn.png"}
                          alt={tx.op}
                          style={{ height: 20, width: 20, borderRadius: 4, objectFit: "cover" }}
                        />
                        <span style={{
                          fontSize: "0.65rem", fontWeight: 950, padding: "4px 8px", borderRadius: 6,
                          background: tx.op === "ORANGE" ? "#FFF7ED" : "#FEFCE8",
                          color: tx.op === "ORANGE" ? "#EA580C" : "#A16207",
                          border: `1px solid ${tx.op === "ORANGE" ? "#FFEDD5" : "#FEF9C3"}`
                        }}>{tx.op}</span>
                      </div>
                    </td>

                    {/* Montant avec Couleur */}
                    <td style={{ padding: "1.2rem", textAlign: "right" }}>
                      <p style={{
                        fontSize: "1rem", fontWeight: 950,
                        color: tx.type === "CREDIT" ? "#16A34A" : "#EF4444"
                      }}>
                        {tx.type === "CREDIT" ? "+" : "-"}{tx.amount.toLocaleString()}
                        <span style={{ fontSize: "0.65rem", opacity: 0.5, marginLeft: 4 }}>GNF</span>
                      </p>
                    </td>

                    {/* Statut */}
                    <td style={{ padding: "1.2rem", textAlign: "center" }}>
                      <span style={{
                        fontSize: "0.65rem", fontWeight: 900, padding: "4px 10px", borderRadius: 20,
                        background: tx.status === "SUCCESS" ? "#F0FDF4" : "#FFFBEB",
                        color: tx.status === "SUCCESS" ? "#15803D" : "#B45309",
                        border: `1px solid ${tx.status === "SUCCESS" ? "#DCFCE7" : "#FEF3C7"}`
                      }}>{tx.status === "SUCCESS" ? "Complété" : "En attente"}</span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <footer style={{ marginTop: "2.5rem", textAlign: "center", paddingBottom: "2rem" }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#CBD5E1", textTransform: "uppercase", letterSpacing: 2 }}>
            Historique consolidé • Données certifiées Orange & MTN
          </p>
        </footer>

      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </MainLayout>
  );
}
