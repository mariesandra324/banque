import api from './api';

const authService = {
  login: async ({ email, motDePasse }) => {
    const response = await api.post('/auth/login', { email, motDePasse });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('email', response.data.email);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('codeGuichet', response.data.codeGuichet);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('codeGuichet');
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch {
      return {
        email: localStorage.getItem('email'),
        role: localStorage.getItem('role'),
        codeGuichet: localStorage.getItem('codeGuichet')
      };
    }
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  getBootstrapStatus: async () => {
    const response = await api.get('/auth/bootstrap/status');
    return response.data;
  },

  startBootstrap: async (request) => {
    const response = await api.post('/auth/bootstrap/start', request);
    return response.data;
  },

  verifyBootstrap: async (request) => {
    const response = await api.post('/auth/bootstrap/verify', request);
    const data = response.data;
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('email', data.email);
      localStorage.setItem('role', data.role);
      localStorage.setItem('codeGuichet', data.codeGuichet || '');
    }
    return data;
  },

  updateProfil: async ({ nom, prenom }) => {
    const response = await api.put('/utilisateurs/me/profil', { nom, prenom });
    return response.data;
  },

  changePassword: async ({ ancienMotDePasse, nouveauMotDePasse, confirmationMotDePasse }) => {
    const response = await api.put('/utilisateurs/me/mot-de-passe', {
      ancienMotDePasse,
      nouveauMotDePasse,
      confirmationMotDePasse,
    });
    return response.data;
  }
};

export default authService;