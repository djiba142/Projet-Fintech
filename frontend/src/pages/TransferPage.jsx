import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import { ArrowLeft, CheckCircle, Smartphone, Send, Wallet, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";

const API = "http://localhost:8000";

export default function TransferPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Form, 2: Confirm, 3: Success
  const [loading, setLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balances, setBalances] = useState({ orange: 0, mtn: 0 });

  // Form State
  const [operator, setOperator] = useState("ORANGE");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("kandjou_user") || "{}");

  useEffect(() => {
    fetchBalances();
  }, []);

  const fetchBalances = async () => {
    setBalanceLoading(true);
    try {
      const token = localStorage.getItem("kandjou_token");
      const res = await axios.get(`${API}/m1/aggregate/${user.username}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBalances({
        orange: res.data.consolidation.orange_balance,
        mtn: res.data.consolidation.mtn_balance
      });
    } catch (err) {
      console.error("Erreur solde:", err);
    } finally {
      setBalanceLoading(false);
    }
  };

  const validateForm = () => {
    if (!recipient.match(/^(\+224|00224|224)?(62|66|61|65)[0-9]{7}$/)) {
      setError("Numéro de téléphone invalide (Format Guinée requis)");
      return false;
    }
    const val = parseInt(amount);
    if (!val || val <= 0) {
      setError("Le montant doit être supérieur à 0");
      return false;
    }
    const sourceBalance = operator === "ORANGE" ? balances.orange : balances.mtn;
    if (val > sourceBalance) {
      setError("Solde insuffisant sur ce compte");
      return false;
    }
    setError("");
    return true;
  };

  const handleNext = () => {
    if (validateForm()) setStep(2);
  };

  const handleTransfer = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("kandjou_token");
      await axios.post(`${API}/m1/transfer`, {
        operator,
        to_msisdn: recipient,
        amount: parseInt(amount),
        note: note || "Transfert via Kandjou"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStep(3);
      // Auto-redirect after a few seconds? No, let user click.
    } catch (err) {
      setError(err.response?.data?.detail || "Échec du transfert. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const currentBalance = operator === "ORANGE" ? balances.orange : balances.mtn;

  return (
    <MainLayout>
      <div style={{ maxWidth: 650, margin: "0 auto" }}>

        {/* Header */}
        <header style={{ marginBottom: "2.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          {step < 3 && (
            <button onClick={() => step === 2 ? setStep(1) : navigate("/dashboard")} style={{
              width: 40, height: 40, background: "#fff", border: "1px solid #E2E8F0",
              borderRadius: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <ArrowLeft size={18} color="#64748B" />
            </button>
          )}
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 950, color: "#1E293B", letterSpacing: "-1px" }}>
              {step === 3 ? "Transfert envoyé" : "Effectuer un transfert"}
            </h1>
            <p style={{ color: "#64748B", fontSize: "0.9rem", fontWeight: 600 }}>
              {step === 3 ? "Opération confirmée avec succès." : "Envoyez des fonds en toute simplicité."}
            </p>
          </div>
        </header>

        {error && (
          <div style={{ background: "#FEF2F2", color: "#991B1B", padding: "1rem", borderRadius: 12, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 10, fontSize: "0.85rem", fontWeight: 700, border: "1px solid #FEE2E2" }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* STEP 1: FORM */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Source Account Choice */}
            <section>
              <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", marginBottom: 12, letterSpacing: 1 }}>Compte source</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div onClick={() => setOperator("ORANGE")} style={{
                  padding: "1.2rem", borderRadius: 18, cursor: "pointer", transition: "all 0.2s",
                  border: operator === "ORANGE" ? "2px solid #F37021" : "2px solid #fff",
                  background: operator === "ORANGE" ? "#FFF7ED" : "#fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: 10
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <img src="/orange.png" alt="Orange" style={{ height: 24, borderRadius: 4 }} />
                    {operator === "ORANGE" && <CheckCircle size={16} color="#EA580C" />}
                  </div>
                  <p style={{ fontSize: "1.1rem", fontWeight: 900, color: "#1E293B" }}>{balances.orange.toLocaleString()} <span style={{ fontSize: "0.7rem", opacity: 0.5 }}>GNF</span></p>
                </div>

                <div onClick={() => setOperator("MTN")} style={{
                  padding: "1.2rem", borderRadius: 18, cursor: "pointer", transition: "all 0.2s",
                  border: operator === "MTN" ? "2px solid #FFCC00" : "2px solid #fff",
                  background: operator === "MTN" ? "#FEFCE8" : "#fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: 10
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <img src="/mtn.png" alt="MTN" style={{ height: 24, borderRadius: 4 }} />
                    {operator === "MTN" && <CheckCircle size={16} color="#A16207" />}
                  </div>
                  <p style={{ fontSize: "1.1rem", fontWeight: 900, color: "#1E293B" }}>{balances.mtn.toLocaleString()} <span style={{ fontSize: "0.7rem", opacity: 0.5 }}>GNF</span></p>
                </div>
              </div>
            </section>

            {/* Inputs */}
            <div style={{ background: "#fff", padding: "2rem", borderRadius: 24, border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", marginBottom: 10 }}>Numéro destinataire</label>
                  <div style={{ position: "relative" }}>
                    <Smartphone size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                    <input type="text" placeholder="Ex: 622 12 34 56" value={recipient} onChange={e => setRecipient(e.target.value)} style={{
                      width: "100%", padding: "14px 14px 14px 44px", borderRadius: 12, border: "1px solid #E2E8F0",
                      fontSize: "1rem", fontWeight: 700, background: "#F8FAFC"
                    }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", marginBottom: 10 }}>Montant à envoyer</label>
                  <div style={{ position: "relative" }}>
                    <Wallet size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                    <input type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} style={{
                      width: "100%", padding: "14px 60px 14px 44px", borderRadius: 12, border: "1px solid #E2E8F0",
                      fontSize: "1.4rem", fontWeight: 950, background: "#F8FAFC"
                    }} />
                    <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontWeight: 800, fontSize: "0.8rem", color: "#94A3B8" }}>GNF</span>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", marginBottom: 10 }}>Motif (optionnel)</label>
                  <input type="text" placeholder="Remboursement, Cadeau..." value={note} onChange={e => setNote(e.target.value)} style={{
                    width: "100%", padding: "14px", borderRadius: 12, border: "1px solid #E2E8F0",
                    fontSize: "0.95rem", fontWeight: 600, background: "#F8FAFC"
                  }} />
                </div>

              </div>
            </div>

            <button onClick={handleNext} style={{
              background: "#006233", color: "#fff", border: "none", padding: "1.2rem", borderRadius: 16,
              fontSize: "1rem", fontWeight: 800, cursor: "pointer", transition: "all 0.2s",
              boxShadow: "0 10px 20px rgba(0,98,51,0.15)"
            }}>
              Continuer vers la confirmation
            </button>
          </div>
        )}

        {/* STEP 2: CONFIRMATION */}
        {step === 2 && (
          <div style={{
            background: "#fff", padding: "2.5rem", borderRadius: 32, border: "1px solid #E2E8F0",
            boxShadow: "0 10px 40px rgba(0,0,0,0.05)"
          }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 900, textAlign: "center", marginBottom: "2rem" }}>Récapitulatif du transfert</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "1rem", borderBottom: "1px solid #F1F5F9" }}>
                <span style={{ color: "#94A3B8", fontWeight: 700, fontSize: "0.85rem" }}>De (Compte source)</span>
                <span style={{ fontWeight: 800, color: "#1E293B" }}>{operator === "ORANGE" ? "Orange Money" : "MTN MoMo"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "1rem", borderBottom: "1px solid #F1F5F9" }}>
                <span style={{ color: "#94A3B8", fontWeight: 700, fontSize: "0.85rem" }}>Destinataire</span>
                <span style={{ fontWeight: 800, color: "#1E293B" }}>{recipient}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "1rem", borderBottom: "1px solid #F1F5F9" }}>
                <span style={{ color: "#94A3B8", fontWeight: 700, fontSize: "0.85rem" }}>Motif</span>
                <span style={{ fontWeight: 800, color: "#1E293B" }}>{note || "N/A"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.5rem" }}>
                <span style={{ color: "#94A3B8", fontWeight: 700, fontSize: "0.85rem" }}>Montant à débiter</span>
                <span style={{ fontWeight: 950, fontSize: "1.6rem", color: "#1E293B" }}>{parseInt(amount).toLocaleString()} GNF</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "3rem" }}>
              <button onClick={() => setStep(1)} disabled={loading} style={{
                flex: 1, padding: "1rem", borderRadius: 14, border: "1px solid #E2E8F0",
                background: "#fff", fontWeight: 800, cursor: "pointer"
              }}>Modifier</button>

              <button onClick={handleTransfer} disabled={loading} style={{
                flex: 1.5, padding: "1rem", borderRadius: 14, border: "none",
                background: "#006233", color: "#fff", fontWeight: 800, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8
              }}>
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                Confirmer l'envoi
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 3 && (
          <div style={{
            background: "#fff", padding: "4rem 2rem", borderRadius: 40, border: "1px solid #E2E8F0",
            boxShadow: "0 20px 50px rgba(0,0,0,0.05)", textAlign: "center"
          }}>
            <div style={{
              width: 80, height: 80, background: "#ECFDF5", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 2rem"
            }}>
              <CheckCircle size={40} color="#10B981" />
            </div>
            <h2 style={{ fontSize: "2rem", fontWeight: 950, color: "#1E293B", marginBottom: "1rem" }}>C'est fait !</h2>
            <p style={{ color: "#64748B", fontWeight: 600, fontSize: "1rem", maxWidth: 400, margin: "0 auto 3rem" }}>
              Le transfert de **{parseInt(amount).toLocaleString()} GNF** vers **{recipient}** a été effectué avec succès.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <button onClick={() => navigate("/transactions")} style={{
                padding: "1.2rem", background: "#1E293B", color: "#fff", border: "none",
                borderRadius: 18, fontWeight: 800, cursor: "pointer", fontSize: "1rem"
              }}>Voir l'historique</button>
              <button onClick={() => navigate("/dashboard")} style={{
                padding: "1rem", background: "none", border: "none", color: "#64748B",
                fontWeight: 800, cursor: "pointer", fontSize: "0.9rem"
              }}>Retour au Dashboard</button>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}
