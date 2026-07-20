import { Bell, Search, UserCircle, Menu, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/navbar.css";

function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();

  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.clear();
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
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Rechercher..." />
        </div>
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

        {/* Profil Utilisateur */}
        <div className="user-profile">
          <UserCircle size={32} className="avatar-icon" />
          <div className="user-details">
            <span className="user-email" title={email}>{email}</span>
            <span className="user-role">{role}</span>
          </div>
        </div>

        {/* Séparateur visuel vertical avant déconnexion */}
        <div className="divider"></div>

        {/* Bouton de Déconnexion */}
        <button className="logout-btn" onClick={logout} title="Se déconnecter">
          <LogOut className="icon logout-icon" size={20} />
        </button>
      </div>
    </header>
  );
}

export default Navbar;