import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { translations } from "../i18n";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [lang, setLang] = useState(localStorage.getItem("kandjou_lang") || "FR");
  const [showLang, setShowLang] = useState(false);

  const t = translations[lang];

  const changeLang = async (code) => {
    setLang(code);
    localStorage.setItem("kandjou_lang", code);
    setShowLang(false);
    
    // Notify other components
    window.dispatchEvent(new Event("languageChange"));

    // Sync with backend if logged in
    const userRaw = localStorage.getItem("kandjou_user");
    if (userRaw) {
      const user = JSON.parse(userRaw);
      try {
        await fetch("http://localhost:8000/m3/auth/update-language", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: user.username, language: code })
        });
      } catch (err) {
        console.error("Failed to sync language:", err);
      }
    }
  };

  const scrollTo = (id) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          const offset = 80;
          window.scrollTo({ top: el.offsetTop - offset, behavior: "smooth" });
        }
      }, 300);
    } else {
      const el = document.getElementById(id);
      if (el) {
        const offset = 80;
        window.scrollTo({ top: el.offsetTop - offset, behavior: "smooth" });
      }
    }
  };

  const languages = [
    { code: "FR", name: "Français" },
    { code: "EN", name: "Anglais" },
    { code: "ZH", name: "Chinois" },
    { code: "AR", name: "Arabe" },
    { code: "NK", name: "N'ko" }
  ];

  return (
    <header style={s.header}>
      <div style={s.logoWrap} onClick={() => navigate("/")}>
        <img src="/logo_kandjou.png" alt="Kandjou Logo" style={s.logoImg} />
      </div>

      <nav style={s.nav}>
        {[
          { label: t.navHome, id: "hero" },
          { label: t.navFeatures, id: "features" },
          { label: t.navHow, id: "how-it-works" },
          { label: t.navAbout, id: "about" },
          { label: t.navContact, id: "footer" }
        ].map((item) => (
          <button 
            key={item.id} 
            onClick={() => scrollTo(item.id)}
            style={s.navLink}
            onMouseOver={(e) => e.target.style.color = "#2D6A4F"}
            onMouseOut={(e) => e.target.style.color = "#666"}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div style={s.actions}>
        <div style={s.langWrapper}>
          <button style={s.langBtn} onClick={() => setShowLang(!showLang)}>
            🌐 {lang} ▾
          </button>
          {showLang && (
            <div style={s.langDropdown}>
              {languages.map((l) => (
                <div 
                  key={l.code} 
                  style={s.langItem}
                  onClick={() => changeLang(l.code)}
                  onMouseOver={(e) => e.target.style.background = "#F0FFF4"}
                  onMouseOut={(e) => e.target.style.background = "transparent"}
                >
                  {l.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => navigate("/login")} style={s.btnSec}>{t.login}</button>
        <button onClick={() => navigate("/register")} style={s.btnPrim}>{t.register}</button>
      </div>
    </header>
  );
}

const s = {
  header: { background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.8rem 4rem", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", borderBottom: "1px solid #F1F5F9", position: "sticky", top: 0, zIndex: 1000, fontFamily: "'Plus Jakarta Sans', sans-serif" },
  logoWrap: { display: "flex", alignItems: "center", cursor: "pointer" },
  logoImg: { height: 50, objectFit: "contain" },
  nav: { display: "flex", gap: "2rem" },
  navLink: { background: "none", border: "none", color: "#666", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" },
  actions: { display: "flex", alignItems: "center", gap: "1.2rem" },
  langWrapper: { position: "relative" },
  langBtn: { background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "0.6rem 1rem", fontSize: "0.8rem", fontWeight: 800, cursor: "pointer", color: "#475569" },
  langDropdown: { position: "absolute", top: "110%", right: 0, background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, boxShadow: "0 10px 25px rgba(0,0,0,0.05)", minWidth: 140, overflow: "hidden", zIndex: 1100 },
  langItem: { padding: "0.8rem 1.2rem", fontSize: "0.85rem", fontWeight: 600, color: "#475569", cursor: "pointer", transition: "all 0.2s" },
  btnSec: { background: "transparent", border: "none", color: "#2D6A4F", fontSize: "0.85rem", fontWeight: 800, cursor: "pointer", padding: "0.6rem 1rem" },
  btnPrim: { background: "#2D6A4F", border: "none", color: "#fff", borderRadius: 12, padding: "0.7rem 1.5rem", fontSize: "0.85rem", fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 20px rgba(45,106,79,0.15)", transition: "all 0.2s" },
};
