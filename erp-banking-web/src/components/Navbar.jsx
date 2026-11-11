import { UserCircle, Menu, LogOut, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import GlobalSearch from "./GlobalSearch";
import NotificationBell from "./NotificationBell";
import logoIS from "../assets/logo.png";
import "../styles/navbar.css";

function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === 'dark';

  const handleLogout = () => {
    if (!window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      return;
    }

    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle-btn" onClick={toggleSidebar} aria-label="Ouvrir ou fermer le menu">
          <Menu className="icon" size={22} />
        </button>

        {/* Marque : même identité que la page de connexion */}
        <button
          type="button"
          className="navbar-brand"
          onClick={() => navigate("/dashboard")}
          aria-label="Isalosys Bank, retour au tableau de bord"
        >
          <span className="navbar-logo">
            <img src={logoIS} alt="" />
          </span>
          <span className="navbar-brand-text">
            <span className="navbar-brand-name">Isalosys Bank</span>
            <span className="navbar-brand-tag">Plateforme de gestion bancaire</span>
          </span>
        </button>
      </div>

      <div className="navbar-center">
        <GlobalSearch />
      </div>

      <div className="navbar-right">
        {/* Zone des icônes d'action */}
        <div className="action-icons">
          <NotificationBell />
        </div>

        <div className="divider"></div>

        {/* Bouton Mode Sombre / Mode Clair */}
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={darkMode ? "Passer au mode clair" : "Passer au mode sombre"}
        >
          {darkMode ? (
            <Moon className="icon theme-icon" size={20} />
          ) : (
            <Sun className="icon theme-icon" size={20} />
          )}
        </button>

        {/* Profil Utilisateur : clic → page Paramètres */}
        <button
          className="user-profile"
          onClick={() => navigate("/parametres")}
          title="Paramètres"
        >
          <UserCircle size={32} className="avatar-icon" />
        </button>

        <div className="divider"></div>

        {/* Bouton de Déconnexion */}
        <button className="logout-btn" onClick={handleLogout} title="Se déconnecter">
          <LogOut className="icon logout-icon" size={20} />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
