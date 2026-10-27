import { NavLink } from "react-router-dom";
import {LayoutDashboard, Users, CreditCard,ArrowLeftRight,Landmark,FileText,Settings,UserCog,Smartphone,Calculator,ScrollText,Store,ArrowDownUp} from "lucide-react";
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

      {hasAccess(["ADMIN"]) && (
        <NavLink to="/utilisateurs" className={({ isActive }) => isActive ? "active" : ""}>
          <UserCog size={18} />
          Utilisateurs
        </NavLink>
      )}

      {hasAccess(["ADMIN", "AGENT"]) && (
        <NavLink to="/clients" className={({ isActive }) => isActive ? "active" : ""}>
          <Users size={18} />
          Clients
        </NavLink>
      )}

      {hasAccess(["ADMIN"]) && (
        <NavLink to="/acces-mobile" className={({ isActive }) => isActive ? "active" : ""}>
          <Smartphone size={18} />
          Accès mobiles
        </NavLink>
      )}

      {hasAccess(["AGENT"]) && (
        <NavLink to="/mon-guichet" className={({ isActive }) => isActive ? "active" : ""}>
          <Store size={18} />
          Mon Guichet
        </NavLink>
      )}

      {hasAccess(["GESTIONNAIRE", "ADMIN"]) && (
        <NavLink to="/transferts-coffre" className={({ isActive }) => isActive ? "active" : ""}>
          <ArrowDownUp size={18} />
          Transferts vers coffre
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

      {hasAccess(["ADMIN", "GESTIONNAIRE"]) && (
      <NavLink to="/credits">
        <Landmark size={18} />
        Crédits
      </NavLink>)}

      {hasAccess(["ADMIN", "COMPTABLE"]) && (
        <NavLink to="/comptabilite" className={({ isActive }) => isActive ? "active" : ""}>
          <Calculator size={18} />
          Comptabilité
        </NavLink>
      )}

      {hasAccess(["ADMIN", "COMPTABLE"]) && (
        <NavLink to="/rapports">
          <FileText size={18} />
          Rapports
        </NavLink>
      )}

      {hasAccess(["ADMIN", "COMPTABLE"]) && (
        <NavLink to="/audit" className={({ isActive }) => isActive ? "active" : ""}>
          <ScrollText size={18} />
          Audit
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
