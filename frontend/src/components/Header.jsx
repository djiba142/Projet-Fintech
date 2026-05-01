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
    <header className="header">
      <div className="header-container">
        {/* LOGO */}
        <div className="logo-wrap" onClick={() => navigate("/")}>
          <img src={logoKandjou} alt="Kandjou Logo" className="logo-img" />
        </div>

        {/* NAV DESKTOP */}
        <nav className={`nav ${isMenuOpen ? 'mobile-open' : ''}`}>
          <span className="nav-link" onClick={() => navigate("/")}>Accueil</span>
          <span className="nav-link" onClick={() => scrollTo("features")}>Fonctionnalités</span>
          <span className="nav-link" onClick={() => scrollTo("how-it-works")}>Comment ça marche ?</span>
          <span className="nav-link" onClick={() => scrollTo("about")}>À propos</span>
          <span className="nav-link" onClick={() => scrollTo("footer")}>Contact</span>
        </nav>

        {/* ACTIONS */}
        <div className="header-actions">
          {!isAuthenticated ? (
            <>
              <button className="btn-login" onClick={() => navigate("/login")}>Connexion</button>
              <button className="btn-register" onClick={() => navigate("/register")}>Créer un compte</button>
            </>
          ) : (
            <div className="user-area">
              <button className="btn-dash" onClick={() => navigate("/dashboard")}>
                <LayoutDashboard size={18} /> Dashboard
              </button>
              <div className="profile-wrap">
                <button className="avatar-btn" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                  <div className="avatar-icon"><User size={20} /></div>
                  <ChevronDown size={14} />
                </button>
                {isProfileOpen && (
                  <div className="header-dropdown">
                    <div className="drop-user">
                       <strong>{user?.fullname}</strong>
                       <span>{user?.role}</span>
                    </div>
                    <div className="drop-divider" />
                    <button className="drop-item" onClick={() => navigate("/profile")}><User size={16} /> Profil</button>
                    <button className="drop-item" onClick={() => navigate("/settings")}><Settings size={16} /> Paramètres</button>
                    <div className="drop-divider" />
                    <button className="drop-logout" onClick={logout}><LogOut size={16} /> Déconnexion</button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <button className="mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <style>{`
        .header {
          height: 80px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          position: sticky;
          top: 0;
          zIndex: 1000;
          display: flex;
          align-items: center;
        }
        .header-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo-wrap { cursor: pointer; }
        .logo-img { height: 35px; }
        .nav { display: flex; gap: 2.5rem; }
        .nav-link {
          font-size: 0.9rem;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          transition: 0.2s;
        }
        .nav-link:hover { color: #006233; }
        .header-actions { display: flex; align-items: center; gap: 1.5rem; }
        .btn-login { background: none; border: none; font-size: 0.9rem; font-weight: 700; color: #1E293B; cursor: pointer; }
        .btn-register {
          background: #006233;
          color: #fff;
          border: none;
          padding: 0.8rem 1.5rem;
          borderRadius: 12px;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 10px 20px rgba(0, 98, 51, 0.2);
        }
        .user-area { display: flex; align-items: center; gap: 1rem; }
        .btn-dash {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #F1F5F9;
          border: none;
          padding: 0.6rem 1rem;
          borderRadius: 10px;
          font-size: 0.85rem;
          font-weight: 700;
          color: #1E293B;
          cursor: pointer;
        }
        .profile-wrap { position: relative; }
        .avatar-btn { display: flex; align-items: center; gap: 6px; background: none; border: none; cursor: pointer; }
        .avatar-icon {
          width: 36px;
          height: 36px;
          borderRadius: 10px;
          background: #006233;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .header-dropdown {
          position: absolute;
          top: 120%;
          right: 0;
          width: 220px;
          background: #fff;
          borderRadius: 16px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          border: 1px solid #F1F5F9;
          padding: 0.8rem;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .drop-user { padding: 0.5rem 0.8rem; display: flex; flex-direction: column; }
        .drop-divider { height: 1px; background: #F1F5F9; margin: 4px 0; }
        .drop-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0.7rem 0.8rem;
          borderRadius: 10px;
          border: none;
          background: none;
          font-size: 0.85rem;
          font-weight: 600;
          color: #475569;
          text-align: left;
          cursor: pointer;
        }
        .drop-logout {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0.7rem 0.8rem;
          borderRadius: 10px;
          border: none;
          background: #FFF1F2;
          font-size: 0.85rem;
          font-weight: 700;
          color: #E11D48;
          text-align: left;
          cursor: pointer;
          margin-top: 4px;
        }
        .mobile-toggle { display: none; background: none; border: none; cursor: pointer; }

        @media (max-width: 1024px) {
          .nav { display: none; }
          .nav.mobile-open {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 80px;
            left: 0;
            right: 0;
            background: #fff;
            padding: 2rem;
            border-bottom: 1px solid #F1F5F9;
          }
          .mobile-toggle { display: block; }
        }
      `}</style>
    </header>
  );
}
