import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Lock, Phone } from "lucide-react";

const COMPTES_TEST = [
  { role: "Agent de Crédit", username: "agent@kandjou.gn", password: "agent123", target: "/agent" },
  { role: "Administrateur",  username: "admin@kandjou.gn",  password: "admin123", target: "/admin" },
  { role: "Analyste Risque", username: "risk@kandjou.gn",   password: "risk123",  target: "/risk"  },
];

import axios from "axios";

const API_M3 = "http://localhost:8000/m3";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_M3}/auth/login`, {
        username: form.username,
        password: form.password
      });
      
      const { token, role, fullname } = res.data;
      
      // Stockage conforme à App.jsx
      localStorage.setItem("gn_user", JSON.stringify({ 
        username: form.username, 
        role: role,
        fullname: fullname,
        token: token 
      }));

      const map = { 
        "Agent de Crédit": "/agent", 
        "Administrateur": "/admin", 
        "Analyste Risque": "/risk" 
      };
      
      navigate(map[role] || "/");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.detail || "Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Lueurs de fond (Glows) */}
      <div style={styles.glowBlue} />
      <div style={styles.glowIndigo} />

      {/* Bouton Retour */}
      <button onClick={() => navigate('/')} style={styles.backBtn}>
        <ArrowLeft size={16} /> RETOUR À L'ACCUEIL
      </button>

      <div style={styles.card}>
        <div style={styles.header}>
          <div style={{ fontSize: "3rem", color: "#3b82f6", marginBottom: "0.5rem" }}>◈</div>
          <h1 style={styles.title}>KANDJOU</h1>
          <p style={styles.subtitle}>Intelligence de Crédit</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Utilisateur</label>
            <div style={styles.inputWrap}>
              <User size={16} style={styles.icon} />
              <input 
                type="text" 
                placeholder="email@kandjou.gn"
                value={form.username} 
                onChange={e => setForm({...form, username: e.target.value})} 
                style={styles.input} 
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Mot de passe</label>
            <div style={styles.inputWrap}>
              <Lock size={16} style={styles.icon} />
              <input 
                type="password" 
                placeholder="••••••••"
                value={form.password} 
                onChange={e => setForm({...form, password: e.target.value})} 
                style={styles.input} 
              />
            </div>
          </div>

          <button type="submit" style={styles.loginBtn} disabled={loading}>
            {loading ? "CONNEXION..." : "SE CONNECTER"}
          </button>
        </form>

        <div style={styles.demoSection}>
          <p style={styles.demoTitle}>Accès Rapides (Démo)</p>
          <div style={styles.demoGrid}>
            {COMPTES_TEST.map((c, i) => (
              <button key={i} onClick={() => { setForm({username: c.username, password: c.password}); setError(""); }} style={styles.demoBtn}>
                {c.role}
              </button>
            ))}
          </div>
        </div>

        <p style={styles.footer}>Système Sécurisé • Kandjou 2026</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#0B1120",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    position: "relative",
    fontFamily: "Inter, sans-serif",
    color: "#fff",
    overflow: "hidden"
  },
  glowBlue: { position: "absolute", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)", top: "20%", left: "-10%", zIndex: 0, pointerEvents: "none" },
  glowIndigo: { position: "absolute", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)", bottom: "-10%", right: "-10%", zIndex: 0, pointerEvents: "none" },
  backBtn: {
    position: "absolute",
    top: "2rem",
    left: "2rem",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid #1E293B",
    borderRadius: "8px",
    padding: "0.6rem 1.2rem",
    color: "#94a3b8",
    fontSize: "0.7rem",
    fontWeight: "900",
    letterSpacing: "1px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
    transition: "all 0.2s",
    zIndex: 10
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    background: "rgba(21, 28, 44, 0.6)",
    backdropFilter: "blur(20px)",
    border: "1px solid #1E293B",
    borderRadius: "24px",
    padding: "3rem",
    textAlign: "center",
    zIndex: 1,
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
  },
  header: { marginBottom: "2.5rem" },
  logo: { width: "64px", height: "64px", marginBottom: "1rem" },
  title: { fontSize: "1.8rem", fontWeight: "900", letterSpacing: "2px" },
  subtitle: { fontSize: "0.8rem", color: "#64748b", marginTop: "0.5rem" },
  form: { display: "flex", flexDirection: "column", gap: "1.5rem" },
  inputGroup: { textAlign: "left" },
  label: { fontSize: "0.7rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase", marginBottom: "0.5rem", display: "block" },
  inputWrap: { position: "relative", display: "flex", alignItems: "center" },
  icon: { position: "absolute", left: "1rem", color: "#475569" },
  input: {
    width: "100%",
    background: "#0B1120",
    border: "1px solid #1E293B",
    borderRadius: "12px",
    padding: "0.8rem 1rem 0.8rem 2.8rem",
    color: "#fff",
    fontSize: "0.9rem",
    outline: "none"
  },
  loginBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "1rem",
    fontWeight: "900",
    cursor: "pointer",
    marginTop: "0.5rem",
    letterSpacing: "1px"
  },
  error: { color: "#ef4444", fontSize: "0.8rem", fontWeight: "bold", marginBottom: "1rem" },
  demoSection: { marginTop: "2.5rem", paddingTop: "2rem", borderTop: "1px solid #1E293B" },
  demoTitle: { fontSize: "0.7rem", fontWeight: "900", color: "#475569", textTransform: "uppercase", marginBottom: "1rem" },
  demoGrid: { display: "grid", gridTemplateColumns: "1fr", gap: "0.5rem" },
  demoBtn: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid #1E293B",
    borderRadius: "8px",
    padding: "0.6rem",
    color: "#94a3b8",
    fontSize: "0.75rem",
    fontWeight: "700",
    cursor: "pointer"
  },
  footer: { marginTop: "2rem", fontSize: "0.6rem", color: "#334155", fontWeight: "bold", textTransform: "uppercase" }
};
