import api from './api';

const authService = {
  login: async ({ email, motDePasse }) => {
    const response = await api.post('/auth/login', { email, motDePasse });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('email', response.data.email);
      localStorage.setItem('role', response.data.role);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      return {
        email: localStorage.getItem('email'),
        role: localStorage.getItem('role')
      };
    }
  },

  getToken: () => {
    return localStorage.getItem('token');
  }
};

export default authService;