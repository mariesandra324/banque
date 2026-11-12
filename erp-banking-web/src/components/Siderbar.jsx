import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Users, CreditCard, ArrowLeftRight, Landmark, FileText,
  Settings, UserCog, Smartphone, Calculator, ScrollText, Store, ArrowDownUp,
} from "lucide-react";
import "../styles/sidebar.css";
import { useAuth } from "../hooks/useAuth";

function Sidebar() {
  const { user } = useAuth();
  const role = user?.role;

  const hasAccess = (allowedRoles) => allowedRoles.includes(role);

  return (
    <aside className="sidebar">
      {/* ===== Menu principal ===== */}
      <nav className="sidebar-top">
        <NavLink to="/dashboard">
          <LayoutDashboard size={18} />
          <span>Tableau de bord</span>
        </NavLink>

        {hasAccess(["ADMIN"]) && (
          <NavLink to="/utilisateurs">
            <UserCog size={18} />
            <span>Utilisateurs</span>
          </NavLink>
        )}

        {hasAccess(["ADMIN", "AGENT"]) && (
          <NavLink to="/clients">
            <Users size={18} />
            <span>Clients</span>
          </NavLink>
        )}

        {hasAccess(["ADMIN"]) && (
          <NavLink to="/acces-mobile">
            <Smartphone size={18} />
            <span>Accès mobiles</span>
          </NavLink>
        )}

        {hasAccess(["AGENT"]) && (
          <NavLink to="/mon-guichet">
            <Store size={18} />
            <span>Mon Guichet</span>
          </NavLink>
        )}

        {hasAccess(["GESTIONNAIRE", "ADMIN"]) && (
          <NavLink to="/transferts-coffre">
            <ArrowDownUp size={18} />
            <span>Transferts vers coffre</span>
          </NavLink>
        )}

        <NavLink to="/comptes">
          <CreditCard size={18} />
          <span>Comptes</span>
        </NavLink>

        <NavLink to="/transactions">
          <ArrowLeftRight size={18} />
          <span>Transactions</span>
        </NavLink>

        {hasAccess(["ADMIN", "GESTIONNAIRE", "AGENT"]) && (
          <NavLink to="/credits">
            <Landmark size={18} />
            <span>Crédits</span>
          </NavLink>
        )}

        {hasAccess(["ADMIN", "COMPTABLE"]) && (
          <NavLink to="/comptabilite">
            <Calculator size={18} />
            <span>Comptabilité</span>
          </NavLink>
        )}

        {hasAccess(["ADMIN", "COMPTABLE"]) && (
          <NavLink to="/rapports">
            <FileText size={18} />
            <span>Rapports</span>
          </NavLink>
        )}

        {hasAccess(["ADMIN", "COMPTABLE", "GESTIONNAIRE"]) && (
          <NavLink to="/audit">
            <ScrollText size={18} />
            <span>Audit</span>
          </NavLink>
        )}
      </nav>

      {/* ===== Bas de la barre : Paramètres ===== */}
      <nav className="sidebar-bottom">
        <NavLink to="/parametres">
          <Settings size={18} />
          <span>Paramètres</span>
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
