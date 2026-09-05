import api from "./api";

const carteService = {

  create: async (data) => {
    const response = await api.post("/cartes", data);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get("/cartes");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/cartes/${id}`);
    return response.data;
  },

  getByCompteId: async (compteId) => {
    const response = await api.get(`/cartes/compte/${compteId}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/cartes/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/cartes/${id}`);
  }
};

export default carteService;