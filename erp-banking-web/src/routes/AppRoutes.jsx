
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import Login from '../features/auth/Login';
import Clients from '../pages/Clients';
import Comptes from '../pages/Comptes';
import Credit from '../pages/Credit';
import Transactions from '../pages/Transactions';
import Utilisateurs from '../pages/Utilisateurs';
import DemandeCreditDetail from '../features/credit/DemandeCreditDetail';
import DemandeCreditForm from '../features/credit/DemandeCreditForm';
import CreditForm from '../features/credit/CreditForm';
import OffreCreditDetail from "../features/credit/OffreCreditDetail";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const RoleRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, user } = useAuth();

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
      {/* Route Publique : La page de Connexion */}
      <Route path="/login" element={<Login />} />

      {/* Routes Sécurisées : Accessibles uniquement si on a un token */}
      <Route
            path="/"
            element={
            <ProtectedRoute>
                <DashboardLayout />
            </ProtectedRoute>
            }
        >
            
            {/* Page d'accueil après connexion */}
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
            <Route path="comptes" element={<Comptes />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="utilisateurs" element={<Utilisateurs />} />
            <Route path="credits" element={<Credit />} />
            <Route path="credits/demandes/:id" element={<DemandeCreditDetail />} />
            <Route path="credits/demandes/nouvelle" element={<DemandeCreditForm />} />
            <Route path="credits/nouveau" element={<CreditForm />} />
            <Route path="/credits/offres/:id" element={<OffreCreditDetail />}/>
      </Route>

      {/* Si l'utilisateur tape une URL inconnue, on le redirige vers l'accueil (qui vérifiera s'il est connecté) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;