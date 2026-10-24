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