import api from './api';

const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data; // Doit retourner { token, user: { username, role, permissions } }
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async () => {
    // Optionnel : si tu as un endpoint de vérification de session / profil
    const response = await api.get('/auth/me');
    return response.data;
  },

  getToken: () => {
    return localStorage.getItem('token');
  }
};

export default authService;