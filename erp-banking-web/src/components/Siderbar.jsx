import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ArrowLeftRight,
  Landmark,
  FileText,
  Settings
} from "lucide-react";
import "../styles/sidebar.css";

function Sidebar() {
  // Récupération du rôle stocké lors du Login (Sprint 1)
  const role = localStorage.getItem("role");

  // Helper pour filtrer l'accès de façon sécurisée
  const hasAccess = (allowedRoles) => {
    return allowedRoles.includes(role);
  };

  return (
    <aside className="sidebar">
      <NavLink to="/dashboard">
        <LayoutDashboard size={18} />
        Tableau de bord
      </NavLink>

      {/* Seuls les AGENTS ou ADMINS gèrent les clients (Sprint 2) */}
      {/* {hasAccess(["AGENT", "ADMIN"]) && ( */}
        <NavLink to="/clients" className={({ isActive }) => isActive ? "active" : ""}>
          <Users size={18} />
          Clients
        </NavLink>
      {/* )} */}

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

      {/* Seuls les ADMINS ou AGENTS accèdent aux rapports de l'ERP */}
      {hasAccess(["ADMIN", "AGENT"]) && (
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