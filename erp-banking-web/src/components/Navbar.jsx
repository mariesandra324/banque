import { Bell, UserCircle, Menu, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import GlobalSearch from "./GlobalSearch";
import "../styles/navbar.css";

function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle-btn" onClick={toggleSidebar}>
          <Menu className="icon" size={22} />
        </button>
        <h2 className="navbar-brand"> ERP Banking</h2>
      </div>

      <div className="navbar-center">
        <GlobalSearch />
      </div>

      <div className="navbar-right">
        {/* Zone des icônes d'action */}
        <div className="action-icons">
          <div className="notification">
            <Bell className="icon" size={20} />
            <span className="badge">3</span>
          </div>
        </div>

        {/* Séparateur visuel vertical */}
        <div className="divider"></div>

        {/* Profil Utilisateur : clic → page Paramètres */}
        <button
          className="user-profile"
          onClick={() => navigate("/parametres")}
          title="Paramètres"
        >
          <UserCircle size={32} className="avatar-icon" />
        </button>

        {/* Séparateur visuel vertical avant déconnexion */}
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
