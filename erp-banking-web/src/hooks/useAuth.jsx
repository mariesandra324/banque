import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../service/authService';
import api from '../service/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken();
      if (token) {
        // Configure le token par défaut pour toutes les requêtes axios dans ton service api
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          // Récupère les infos fraîches de l'utilisateur (rôle et permissions)
          const userData = await authService.getCurrentUser();
          setUser(userData);
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
          authService.logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    setUser(data.user);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);