import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import Login from '../features/auth/Login';
import ForgotPassword from '../features/auth/ForgotPassword';
import Clients from '../pages/Clients';
import AccesMobile from '../pages/AccesMobile';
import Comptes from '../pages/Comptes';
import Credit from '../pages/Credit';
import Transactions from '../pages/Transactions';
import Utilisateurs from '../pages/Utilisateurs';
import DemandeCreditDetail from '../features/credit/DemandeCreditDetail';
import DemandeCreditForm from '../features/credit/DemandeCreditForm';
import CreditForm from '../features/credit/CreditForm';
import OffreCreditDetail from "../features/credit/OffreCreditDetail";
import Rapports from '../pages/Rapports';
import Audit from '../pages/Audit';
import Settings from '../features/settings/Settings';
import ClientDossier from '../pages/ClientDossier';
import Comptabilite from '../pages/Comptabilite';
import MonGuichet from '../pages/MonGuichet';
import TransfertsCoffre from '../pages/TransfertsCoffre';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const RoleRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />

      <Route
            path="/"
            element={
            <ProtectedRoute>
                <DashboardLayout />
            </ProtectedRoute>
            }
        >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route
              path="clients"
              element={
                <RoleRoute allowedRoles={["ADMIN", "AGENT", "GESTIONNAIRE", "COMPTABLE"]}>
                  <Clients />
                </RoleRoute>
              }
            />
            <Route path="clients/:id" element={<ClientDossier />} />
            <Route
              path="mon-guichet"
              element={
                <RoleRoute allowedRoles={["AGENT", "ADMIN"]}>
                  <MonGuichet />
                </RoleRoute>
              }
            />
            <Route
              path="transferts-coffre"
              element={
                <RoleRoute allowedRoles={["GESTIONNAIRE", "ADMIN"]}>
                  <TransfertsCoffre />
                </RoleRoute>
              }
            />
            <Route path="comptes" element={<Comptes />} />
            <Route
              path="acces-mobile"
              element={
                <RoleRoute allowedRoles={["ADMIN", "GESTIONNAIRE"]}>
                  <AccesMobile />
                </RoleRoute>
              }
            />
            <Route path="transactions" element={<Transactions />} />
            <Route path="utilisateurs" element={<Utilisateurs />} />
            <Route path="credits" element={<Credit />} />
            <Route path="credits/demandes/:id" element={<DemandeCreditDetail />} />
            <Route path="credits/demandes/nouvelle" element={<DemandeCreditForm />} />
            <Route path="credits/nouveau" element={<CreditForm />} />
            <Route path="credits/offres/:id" element={<OffreCreditDetail />}/>
            <Route
              path="comptabilite"
              element={
                <RoleRoute allowedRoles={["ADMIN", "COMPTABLE"]}>
                  <Comptabilite />
                </RoleRoute>
              }
            />
            <Route path="rapports" element={<Rapports />}/>
            <Route
              path="audit"
              element={
                <RoleRoute allowedRoles={["ADMIN", "COMPTABLE", "GESTIONNAIRE"]}>
                  <Audit />
                </RoleRoute>
              }
            />
            <Route path="parametres" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
