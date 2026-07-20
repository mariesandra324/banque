
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import Login from '../features/auth/Login';
import Clients from '../pages/Clients';

// Un composant de garde ultra-simple pour le Sprint 1
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // Si aucun token n'est trouvé, on redirige immédiatement vers le Login
  if (!token) {
    return <Navigate to="/login" replace />;
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
            <Route path='dashboard' element={<Dashboard/>}/>
            <Route path="clients" element={<Clients />} />
      </Route>

      {/* Si l'utilisateur tape une URL inconnue, on le redirige vers l'accueil (qui vérifiera s'il est connecté) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;