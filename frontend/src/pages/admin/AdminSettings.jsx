import { useState, useEffect } from "react";
import { 
  Settings, 
  Save, 
  RefreshCw, 
  ShieldCheck, 
  Bell, 
  Globe, 
  Database,
  Lock,
  Smartphone,
  ChevronRight,
  Zap
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ConfigGroup = ({ title, icon, children }) => (
  <div style={{ background: "#fff", borderRadius: 28, padding: "2rem", border: "1px solid #E2E8F0", marginBottom: "2rem" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "2rem", borderBottom: "1.5px solid #F1F5F9", paddingBottom: "1rem" }}>
       <div style={{ width: 40, height: 40, borderRadius: 12, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", color: "#1E293B" }}>
          {icon}
       </div>
       <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900, color: "#1E293B" }}>{title}</h3>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {children}
    </div>
  </div>
);

const SettingItem = ({ label, description, value, type = "text", onChange }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "2rem" }}>
    <div style={{ flex: 1 }}>
       <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#1E293B" }}>{label}</p>
       <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "#64748B", fontWeight: 600, lineHeight: 1.4 }}>{description}</p>
    </div>
    <div style={{ width: 240 }}>
       <input 
         type={type} 
         value={value}
         onChange={(e) => onChange(e.target.value)}
         style={{ width: "100%", padding: "10px 15px", borderRadius: 10, border: "2px solid #F1F5F9", background: "#F8FAFC", fontSize: "0.9rem", fontWeight: 700, outline: "none" }}
       />
    </div>
  </div>
);

export default function AdminSettings() {
  const { token } = useAuth();
  const [config, setConfig] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    try {
      const res = await axios.get(`${API}/m3/admin/config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConfig(res.data);
    } catch (err) {
      console.error("Fetch Config Error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchConfig();
  }, [token]);

  const updateConfig = async (key, value) => {
    try {
      await axios.post(`${API}/m3/admin/config`, { key, value }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchConfig();
    } catch (err) {
      alert("Erreur de sauvegarde");
    }
  };

  if (loading) return <div style={{ padding: "4rem", textAlign: "center", fontWeight: 900, color: "#1E293B" }}>Accès au registre de configuration...</div>;

  return (
    <div style={{ padding: "2rem", background: "#F8FAFC", minHeight: "100vh" }}>
      
      <header style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 950, color: "#1E293B", margin: 0 }}>Paramètres Globaux</h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748B", fontWeight: 600 }}>Configuration métier, technique et seuils de sécurité de la plateforme</p>
        </div>
        <button style={{ 
          padding: "10px 20px", borderRadius: 12, background: "#10B981", color: "#fff", 
          border: "none", fontWeight: 900, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" 
        }}>
          <Save size={18} /> Sauvegarder tout
        </button>
      </header>

      <div style={{ maxWidth: 900 }}>
        
        <ConfigGroup title="Plateforme & Fintech" icon={<Zap size={22} />}>
           <SettingItem 
             label="Devise Principale" 
             description="Unité monétaire utilisée pour tous les calculs de solde et transferts."
             value="GNF"
             onChange={() => {}}
           />
           <SettingItem 
             label="Seuil de Fraude (AML)" 
             description="Montant à partir duquel une alerte automatique est levée pour le BCRG."
             value="1,000,000"
             onChange={() => {}}
           />
        </ConfigGroup>

        <ConfigGroup title="Sécurité & Authentification" icon={<Lock size={22} />}>
           <SettingItem 
             label="Durée de Session (JWT)" 
             description="Temps d'expiration du jeton d'accès en minutes."
             value="60"
             onChange={() => {}}
           />
           <SettingItem 
             label="Tentatives Login Max" 
             description="Nombre d'échecs autorisés avant blocage temporaire de l'IP."
             value="5"
             onChange={() => {}}
           />
        </ConfigGroup>

        <ConfigGroup title="Notifications & Alertes" icon={<Bell size={22} />}>
           <SettingItem 
             label="Passerelle SMS Orange" 
             description="Clé API pour l'envoi des codes OTP Orange Money."
             value="OR_SEC_XXXX_2026"
             type="password"
             onChange={() => {}}
           />
           <SettingItem 
             label="Canal Support Admin" 
             description="Email de réception pour les alertes critiques système."
             value="sysadmin@kandjou.gn"
             onChange={() => {}}
           />
        </ConfigGroup>

      </div>

    </div>
  );
}
