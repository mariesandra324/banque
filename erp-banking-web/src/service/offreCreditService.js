import api from "../api/axios";

const offreCreditService = {

    // Récupérer toutes les offres
    getAll: async () => {
        const response = await api.get("/offres-credit");
        console.log("REPONSE API OFFRES :", response.data);
        return response.data;
    },

    // Récupérer une offre par ID
    getById: async (id) => {
        const response = await api.get(`/offres-credit/${id}`);
        return response.data;
    },

    // Récupérer les offres d'un client
    getByClientId: async (clientId) => {
        const response = await api.get(
            `/offres-credit/client/${clientId}`
        );
        return response.data;
    },

    // Récupérer les offres d'une demande
    getByDemandeCreditId: async (demandeCreditId) => {
        const response = await api.get(
            `/offres-credit/demande/${demandeCreditId}`
        );
        return response.data;
    },

    // Créer une offre
    creer: async (offre) => {
        const response = await api.post(
            "/offres-credit",
            offre
        );
        return response.data;
    },

    // Modifier le statut
    updateStatut: async (id, statut) => {
        const response = await api.put(
            `/offres-credit/${id}/statut/${statut}`
        );
        return response.data;
    },

    // Accepter une offre
    accepter: async (id) => {
        const response = await api.put(
            `/offres-credit/${id}/accepter`
        );
        return response.data;
    },

    // Supprimer une offre
    supprimer: async (id) => {
        await api.delete(`/offres-credit/${id}`);
    }
};

export default offreCreditService;