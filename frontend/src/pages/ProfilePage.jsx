import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Smartphone, 
  Mail, 
  Shield, 
  LogOut, 
  ArrowLeft, 
  Edit3, 
  Save, 
  X, 
  Lock, 
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronRight,
  CreditCard,
  MapPin,
  Calendar,
  IdCard
} from "lucide-react";


export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("kandjou_user") || "{}"));
  const [activeTab, setActiveTab] = useState("Informations");
  
  // States
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullname: user.fullname || "",
    email: user.email || "",
    address: "Madina, Commune de Matam, Conakry",
    id_card: "CNI — 8023456789",
    reg_date: "15/03/2024"
  });
  
  const [securityData, setSecurityData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const updatedUser = { ...user, fullname: formData.fullname, email: formData.email };
      localStorage.setItem("kandjou_user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      setStatus({ type: "success", message: "Profil mis à jour avec succès !" });
      setLoading(false);
    }, 800);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setStatus({ type: "success", message: "Mot de passe modifié avec succès !" });
      setSecurityData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setLoading(false);
    }, 1000);
  };

  const getBackPath = () => {
    if (user.role === 'Administrateur') return '/admin';
    if (user.role === 'Agent de Crédit') return '/agent';
    if (user.role === 'Analyste Risque') return '/risk';
    if (user.role === 'Régulateur (BCRG)') return '/audit';
    return '/dashboard';
  };

  return (
    <>
      <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: "4rem" }}>
        
        {/* ── HEADER ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "2rem", color: "#64748B", cursor: "pointer" }} onClick={() => navigate(getBackPath())}>
          <ArrowLeft size={18} />
          <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>Retour</span>
        </div>

        {/* ── PROFILE CARD ── */}
        <div style={{ background: "#fff", borderRadius: "32px", overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", border: "1px solid #F1F5F9" }}>
          
          {/* Top Banner / Avatar Section */}
          <div style={{ padding: "3rem", display: "flex", alignItems: "center", gap: "2.5rem", borderBottom: "1px solid #F1F5F9" }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: 110, height: 110, borderRadius: "28px", background: "linear-gradient(135deg, #006233, #2D6A4F)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "2.5rem", fontWeight: 900 }}>
                {user.fullname?.charAt(0) || "K"}
              </div>
              <div style={{ position: "absolute", bottom: -5, right: -5, width: 32, height: 32, background: "#10B981", border: "4px solid #fff", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <CheckCircle size={16} />
              </div>
            </div>
            <div>
              <h1 style={{ fontSize: "2.2rem", fontWeight: 950, color: "#1E293B", letterSpacing: "-1.5px", marginBottom: "4px" }}>{user.fullname || "Utilisateur Kandjou"}</h1>
              <p style={{ color: "#64748B", fontWeight: 600, fontSize: "1rem" }}>{user.role === 'Administrateur' ? 'Administrateur Système' : 'Client Kandjou'} • {formData.address}</p>
              <p style={{ color: "#006233", fontWeight: 800, fontSize: "0.95rem", marginTop: "8px" }}>{user.username}</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: "flex", gap: "2.5rem", padding: "0 3rem", background: "#fff", borderBottom: "1px solid #F1F5F9" }}>
            {["Informations", "Comptes liés", "Sécurité"].map((tab) => (
              <button 
                key={tab} 
                onClick={() => { setActiveTab(tab); setIsEditing(false); }}
                style={{ 
                  padding: "1.5rem 0", background: "none", border: "none", 
                  borderBottom: activeTab === tab ? "3px solid #006233" : "3px solid transparent",
                  color: activeTab === tab ? "#1E293B" : "#94A3B8", 
                  fontWeight: 800, fontSize: "0.95rem", cursor: "pointer", transition: "all 0.2s"
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: "3rem" }}>
            
            {/* 1. INFORMATIONS TAB */}
            {activeTab === "Informations" && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", marginBottom: "3rem" }}>
                  {[
                    { label: "Email", value: user.email || "Non renseigné", icon: <Mail size={18} />, key: "email" },
                    { label: "Date d'inscription", value: formData.reg_date, icon: <Calendar size={18} /> },
                    { label: "Pièce d'identité", value: formData.id_card, icon: <IdCard size={18} /> },
                    { label: "Adresse locale", value: formData.address, icon: <MapPin size={18} /> },
                  ].map((item, i) => (
                    <div key={i}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                        <div style={{ color: "#94A3B8" }}>{item.icon}</div>
                        <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px" }}>{item.label}</label>
                      </div>
                      {isEditing && item.key === "email" ? (
                        <input 
                          type="email" 
                          value={formData.email} 
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          style={{ width: "100%", padding: "1rem", borderRadius: "14px", border: "2px solid #E2E8F0", outline: "none", fontWeight: 600 }}
                        />
                      ) : (
                        <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1E293B" }}>{item.value}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                  {isEditing ? (
                    <>
                      <button onClick={handleSaveProfile} style={{ padding: "1rem 2rem", background: "#006233", color: "#fff", border: "none", borderRadius: "14px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Save size={18} /> Enregistrer
                      </button>
                      <button onClick={() => setIsEditing(false)} style={{ padding: "1rem 2rem", background: "#F1F5F9", color: "#475569", border: "none", borderRadius: "14px", fontWeight: 800, cursor: "pointer" }}>
                        Annuler
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setIsEditing(true)} style={{ padding: "1rem 2rem", background: "#fff", color: "#1E293B", border: "2px solid #F1F5F9", borderRadius: "14px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Edit3 size={18} /> Modifier mes informations
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 2. COMPTES LIÉS TAB */}
            {activeTab === "Comptes liés" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {[
                  { op: "Orange Money Guinea", num: user.msisdn_orange || "+224 622 12 34 56", logo: "/orange.png" },
                  { op: "MTN Mobile Money", num: user.msisdn_mtn || "+224 664 12 34 56", logo: "/mtn.png" },
                ].map((acc, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 2rem", borderRadius: "24px", background: "#F8FAFC", border: "1px solid #F1F5F9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                      <img src={acc.logo} alt={acc.op} style={{ width: 48, height: 48, objectFit: "contain", borderRadius: "14px" }} />
                      <div>
                        <p style={{ fontWeight: 800, color: "#1E293B", margin: 0 }}>{acc.op}</p>
                        <p style={{ fontSize: "0.9rem", color: "#64748B", fontWeight: 600, margin: "4px 0 0" }}>{acc.num}</p>
                      </div>
                    </div>
                    <span style={{ padding: "6px 12px", borderRadius: "10px", background: "#F0FDF4", color: "#10B981", fontSize: "0.7rem", fontWeight: 900 }}>LIÉ</span>
                  </div>
                ))}
                <button onClick={() => alert("Fonctionnalité bientôt disponible")} style={{ marginTop: "1rem", width: "fit-content", background: "none", border: "2px dashed #CBD5E1", padding: "1rem 2rem", borderRadius: "14px", color: "#94A3B8", fontWeight: 800, cursor: "pointer" }}>
                  + Lier un nouveau compte
                </button>
              </div>
            )}

            {/* 3. SÉCURITÉ TAB */}
            {activeTab === "Sécurité" && (
              <form onSubmit={handleChangePassword} style={{ maxWidth: "500px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {[
                    { label: "Ancien mot de passe", key: "old" },
                    { label: "Nouveau mot de passe", key: "new" },
                    { label: "Confirmation", key: "confirm" },
                  ].map((field) => (
                    <div key={field.key} style={{ position: "relative" }}>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", marginBottom: "8px" }}>{field.label}</label>
                      <input 
                        type={showPasswords[field.key] ? "text" : "password"}
                        style={{ width: "100%", padding: "1rem", borderRadius: "14px", border: "2px solid #F1F5F9", outline: "none", fontWeight: 600 }}
                        required
                      />
                      <div 
                        onClick={() => setShowPasswords({...showPasswords, [field.key]: !showPasswords[field.key]})}
                        style={{ position: "absolute", right: "1rem", bottom: "0.8rem", color: "#CBD5E1", cursor: "pointer" }}
                      >
                        {showPasswords[field.key] ? <EyeOff size={18} /> : <Eye size={18} />}
                      </div>
                    </div>
                  ))}
                  <button type="submit" style={{ padding: "1.1rem", background: "#1E293B", color: "#fff", border: "none", borderRadius: "14px", fontWeight: 800, cursor: "pointer", marginTop: "1rem" }}>
                    Mettre à jour le mot de passe
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>

        {/* Status Notification */}
        {status.message && (
          <div style={{ 
            marginTop: "2rem", padding: "1.2rem", borderRadius: "16px", 
            background: status.type === "success" ? "#F0FDF4" : "#FEF2F2", 
            border: `1px solid ${status.type === "success" ? "#BBF7D0" : "#FECACA"}`,
            color: status.type === "success" ? "#166534" : "#991B1B",
            display: "flex", alignItems: "center", gap: "12px",
            animation: "slideIn 0.3s ease-out"
          }}>
            <CheckCircle size={20} />
            <span style={{ fontWeight: 700 }}>{status.message}</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
}
