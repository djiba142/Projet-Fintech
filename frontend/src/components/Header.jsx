import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logoKandjou from "../assets/logo_kandjou.png";
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  ChevronDown,
  LayoutDashboard,
  Settings,
  Bell
} from "lucide-react";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  return (
    <header style={S.header}>
      <div style={S.container}>
        {/* LOGO */}
        <div style={S.logoWrap} onClick={() => navigate("/")}>
          <img src={logoKandjou} alt="Kandjou Logo" style={S.logoImg} />
        </div>

        {/* NAV DESKTOP */}
        <nav style={S.nav}>
          <span style={S.navLink} onClick={() => navigate("/")}>Accueil</span>
          <span style={S.navLink} onClick={() => scrollTo("features")}>Fonctionnalités</span>
          <span style={S.navLink} onClick={() => scrollTo("how-it-works")}>Comment ça marche ?</span>
          <span style={S.navLink} onClick={() => scrollTo("about")}>À propos</span>
          <span style={S.navLink} onClick={() => scrollTo("footer")}>Contact</span>
        </nav>

        {/* ACTIONS */}
        <div style={S.actions}>
          {!isAuthenticated ? (
            <>
              <button style={S.btnLogin} onClick={() => navigate("/login")}>Connexion</button>
              <button style={S.btnRegister} onClick={() => navigate("/register")}>Créer un compte</button>
            </>
          ) : (
            <div style={S.userArea}>
              <button style={S.btnDash} onClick={() => navigate("/dashboard")}>
                <LayoutDashboard size={18} /> Dashboard
              </button>
              <div style={S.profileWrap}>
                <button style={S.avatarBtn} onClick={() => setIsProfileOpen(!isProfileOpen)}>
                  <div style={S.avatar}><User size={20} /></div>
                  <ChevronDown size={14} />
                </button>
                {isProfileOpen && (
                  <div style={S.dropdown}>
                    <div style={S.dropUser}>
                       <strong>{user?.fullname}</strong>
                       <span>{user?.role}</span>
                    </div>
                    <div style={S.dropDivider} />
                    <button style={S.dropItem} onClick={() => navigate("/profile")}><User size={16} /> Profil</button>
                    <button style={S.dropItem} onClick={() => navigate("/settings")}><Settings size={16} /> Paramètres</button>
                    <div style={S.dropDivider} />
                    <button style={S.dropLogout} onClick={logout}><LogOut size={16} /> Déconnexion</button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <button style={S.mobileToggle} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}

const S = {
  header: {
    height: "80px",
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    display: "flex",
    alignItems: "center"
  },
  container: {
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "0 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  logoWrap: { cursor: "pointer" },
  logoImg: { height: "35px" },
  nav: {
    display: "flex",
    gap: "2.5rem",
    "@media (max-width: 1024px)": { display: "none" }
  },
  navLink: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#475569",
    cursor: "pointer",
    transition: "0.2s"
  },
  actions: { display: "flex", alignItems: "center", gap: "1.5rem" },
  btnLogin: {
    background: "none",
    border: "none",
    fontSize: "0.9rem",
    fontWeight: 700,
    color: "#1E293B",
    cursor: "pointer"
  },
  btnRegister: {
    background: "#006233",
    color: "#fff",
    border: "none",
    padding: "0.8rem 1.5rem",
    borderRadius: "12px",
    fontSize: "0.9rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(0, 98, 51, 0.2)"
  },
  userArea: { display: "flex", alignItems: "center", gap: "1rem" },
  btnDash: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#F1F5F9",
    border: "none",
    padding: "0.6rem 1rem",
    borderRadius: "10px",
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#1E293B",
    cursor: "pointer"
  },
  profileWrap: { position: "relative" },
  avatarBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "none",
    border: "none",
    cursor: "pointer"
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "#006233",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  dropdown: {
    position: "absolute",
    top: "120%",
    right: 0,
    width: "220px",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    border: "1px solid #F1F5F9",
    padding: "0.8rem",
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  dropUser: {
    padding: "0.5rem 0.8rem",
    display: "flex",
    flexDirection: "column"
  },
  dropDivider: { height: "1px", background: "#F1F5F9", margin: "4px 0" },
  dropItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0.7rem 0.8rem",
    borderRadius: "10px",
    border: "none",
    background: "none",
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#475569",
    textAlign: "left",
    cursor: "pointer"
  },
  dropLogout: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0.7rem 0.8rem",
    borderRadius: "10px",
    border: "none",
    background: "#FFF1F2",
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#E11D48",
    textAlign: "left",
    cursor: "pointer",
    marginTop: "4px"
  },
  mobileToggle: {
    display: "none",
    "@media (max-width: 1024px)": { display: "block", background: "none", border: "none", cursor: "pointer" }
  }
};
