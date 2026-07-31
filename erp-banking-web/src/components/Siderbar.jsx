import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ArrowLeftRight,
  Landmark,
  FileText,
  Settings,UserCog
} from "lucide-react";
import "../styles/sidebar.css";
import { useAuth } from "../hooks/useAuth";

function Sidebar() {
  const { user } = useAuth();
  const role = user?.role;

  const hasAccess = (allowedRoles) => {
    return allowedRoles.includes(role);
  };

  return (
    <aside className="sidebar">
      <NavLink to="/dashboard">
        <LayoutDashboard size={18} />
        Tableau de bord
      </NavLink>

      {hasAccess(["ADMIN", "AGENT", "GESTIONNAIRE", "COMPTABLE"]) && (
        <NavLink to="/clients" className={({ isActive }) => isActive ? "active" : ""}>
          <Users size={18} />
          Clients
        </NavLink>
      )}

      {hasAccess(["ADMIN"]) && (
        <NavLink to="/utilisateurs" className={({ isActive }) => isActive ? "active" : ""}>
          <UserCog size={18} />
          Utilisateurs
        </NavLink>
      )}

      <NavLink to="/comptes">
        <CreditCard size={18} />
        Comptes
      </NavLink>

      <NavLink to="/transactions">
        <ArrowLeftRight size={18} />
        Transactions
      </NavLink>

      <NavLink to="/credits">
        <Landmark size={18} />
        Crédits
      </NavLink>

      {/* Seuls les ADMINS ou COMPTABLES accèdent aux rapports financiers */}
      {hasAccess(["ADMIN", "COMPTABLE"]) && (
        <NavLink to="/rapports">
          <FileText size={18} />
          Rapports
        </NavLink>
      )}

      <NavLink to="/parametres">
        <Settings size={18} />
        Paramètres
      </NavLink>
    </aside>
  );
}

export default Sidebar;