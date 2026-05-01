import { useState, useEffect } from "react";
import { 
  Play, 
  Zap, 
  Database, 
  UserPlus, 
  Activity, 
  CreditCard, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  Coins
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const S = {
  card: { background: "#fff", borderRadius: 28, padding: "2rem", border: "1px solid #E2E8F0", boxShadow: "0 10px 30px rgba(0,0,0,0.02)" },
  badge: (c) => ({ padding: "4px 10px", borderRadius: 8, background: c === 'ORANGE' ? '#FFF7ED' : '#EFF6FF', color: c === 'ORANGE' ? '#EA580C' : '#2563EB', fontSize: "0.65rem", fontWeight: 900 }),
  input: { width: "100%", padding: "12px", borderRadius: 12, border: "2px solid #F1F5F9", background: "#F8FAFC", fontSize: "0.9rem", fontWeight: 700, outline: "none", marginTop: 8 }
};

export default function AdminSimulation() {
  const { token } = useAuth();
  const [mockAccounts, setMockAccounts] = useState({ orange: [], mtn: [] });
  const [loading, setLoading] = useState(false);
  const [selectedAcc, setSelectedAcc] = useState({ msisdn: "", operator: "ORANGE" });
  const [depositAmount, setDepositAmount] = useState(100000);

  const fetchMocks = async () => {
    try {
      const res = await axios.get(`${API}/m3/admin/simulate/mock-accounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMockAccounts(res.data);
      if (res.data.orange.length > 0) setSelectedAcc({ msisdn: res.data.orange[0], operator: "ORANGE" });
    } catch (err) { console.error(err); }
  };

  useEffect(() => { if (token) fetchMocks(); }, [token]);

  const handleDeposit = async () => {
    try {
      setLoading(true);
      await axios.post(`${API}/m3/admin/simulate/deposit`, { ...selectedAcc, amount: depositAmount }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Injection de ${depositAmount.toLocaleString()} GNF réussie sur ${selectedAcc.msisdn}`);
    } catch (err) { alert("Erreur simulation"); }
    finally { setLoading(false); }
  };

  const handleActivity = async () => {
    try {
      setLoading(true);
      await axios.post(`${API}/m3/admin/simulate/generate-activity`, { ...selectedAcc, count: 15 }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`15 transactions historiques générées pour ${selectedAcc.msisdn}. Le score de crédit sera mis à jour.`);
    } catch (err) { alert("Erreur simulation"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ padding: "2rem", background: "#F8FAFC", minHeight: "100vh" }}>
      
      <header style={{ marginBottom: "2.5rem" }}>
         <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ padding: 10, background: "#1E293B", borderRadius: 14, color: "#fff" }}>
               <Zap size={24} />
            </div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 950, color: "#1E293B", margin: 0 }}>Centre de Simulation Flux</h1>
         </div>
         <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748B", fontWeight: 600 }}>Préparez vos jeux de données de test sans clés d'API réelles</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
         
         {/* SECTION 1: COMPTES DISPONIBLES */}
         <div style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
               <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900, color: "#1E293B" }}>Comptes de Test (Sandbox)</h3>
               <button onClick={fetchMocks} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}><RefreshCw size={18} /></button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
               {mockAccounts.orange.map(m => (
                  <div key={m} onClick={() => setSelectedAcc({msisdn: m, operator: 'ORANGE'})} style={{ padding: "12px 18px", borderRadius: 16, border: selectedAcc.msisdn === m ? "2px solid #EA580C" : "1px solid #F1F5F9", background: selectedAcc.msisdn === m ? "#FFF7ED" : "#fff", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                     <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <CreditCard size={18} color="#EA580C" />
                        <span style={{ fontWeight: 800, fontSize: "0.9rem" }}>{m}</span>
                     </div>
                     <span style={S.badge('ORANGE')}>ORANGE</span>
                  </div>
               ))}
               {mockAccounts.mtn.map(m => (
                  <div key={m} onClick={() => setSelectedAcc({msisdn: m, operator: 'MTN'})} style={{ padding: "12px 18px", borderRadius: 16, border: selectedAcc.msisdn === m ? "2px solid #2563EB" : "1px solid #F1F5F9", background: selectedAcc.msisdn === m ? "#EFF6FF" : "#fff", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                     <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <CreditCard size={18} color="#2563EB" />
                        <span style={{ fontWeight: 800, fontSize: "0.9rem" }}>{m}</span>
                     </div>
                     <span style={S.badge('MTN')}>MTN</span>
                  </div>
               ))}
            </div>
         </div>

         {/* SECTION 2: ACTIONS DE SIMULATION */}
         <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            
            {/* ACTION : DÉPÔT */}
            <div style={S.card}>
               <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
                  <Coins size={20} color="#10B981" />
                  <h4 style={{ margin: 0, fontWeight: 900 }}>Injection de Fonds (Dépôt)</h4>
               </div>
               <p style={{ fontSize: "0.75rem", color: "#64748B", marginBottom: "1.5rem" }}>Ajoutez du solde instantanément sur le compte sélectionné.</p>
               
               <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ fontSize: "0.7rem", fontWeight: 900, color: "#94A3B8" }}>MONTANT À INJECTER (GNF)</label>
                  <input type="number" style={S.input} value={depositAmount} onChange={e => setDepositAmount(Number(e.target.value))} />
               </div>

               <button 
                 onClick={handleDeposit}
                 disabled={loading || !selectedAcc.msisdn}
                 style={{ width: "100%", padding: "14px", borderRadius: 14, background: "#10B981", color: "#fff", border: "none", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
               >
                  {loading ? <RefreshCw className="animate-spin" /> : <PlusCircle size={20} />} Injecter les fonds
               </button>
            </div>

            {/* ACTION : ACTIVITÉ HISTORIQUE */}
            <div style={S.card}>
               <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
                  <Activity size={20} color="#7C3AED" />
                  <h4 style={{ margin: 0, fontWeight: 900 }}>Génération d'Activité (Historique)</h4>
               </div>
               <p style={{ fontSize: "0.75rem", color: "#64748B", marginBottom: "1.5rem" }}>Crée des dizaines de transactions passées pour tester le scoring de crédit.</p>
               
               <button 
                 onClick={handleActivity}
                 disabled={loading || !selectedAcc.msisdn}
                 style={{ width: "100%", padding: "14px", borderRadius: 14, background: "#7C3AED", color: "#fff", border: "none", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
               >
                  {loading ? <RefreshCw className="animate-spin" /> : <Play size={20} />} Générer 15 transactions
               </button>
            </div>

         </div>

      </div>

      <div style={{ marginTop: "3rem", padding: "2rem", borderRadius: 28, background: "#1E293B", color: "#fff" }}>
         <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1rem" }}>
            <ShieldCheck size={24} color="#10B981" />
            <h3 style={{ margin: 0 }}>Rappel Méthodologique</h3>
         </div>
         <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
            <div>
               <p style={{ fontWeight: 800, fontSize: "0.85rem", color: "#10B981", margin: "0 0 8px" }}>1. Inscription</p>
               <p style={{ fontSize: "0.75rem", color: "#94A3B8" }}>Créez un utilisateur 'Client' et liez-le à un des numéros Sandbox ci-dessus.</p>
            </div>
            <div>
               <p style={{ fontWeight: 800, fontSize: "0.85rem", color: "#10B981", margin: "0 0 8px" }}>2. Flux</p>
               <p style={{ fontSize: "0.75rem", color: "#94A3B8" }}>Utilisez les outils ci-dessus pour simuler ses dépôts et son activité historique.</p>
            </div>
            <div>
               <p style={{ fontWeight: 800, fontSize: "0.85rem", color: "#10B981", margin: "0 0 8px" }}>3. Crédit</p>
               <p style={{ fontSize: "0.75rem", color: "#94A3B8" }}>Connectez-vous en tant qu'Agent de Crédit pour analyser son score et décider.</p>
            </div>
         </div>
      </div>

    </div>
  );
}
