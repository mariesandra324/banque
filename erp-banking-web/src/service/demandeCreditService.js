import api from "../api/axios"; 

const demandeCreditService = {

    // Récupérer toutes les demandes
    getAll: async () => {
        const response = await api.get("/demandes-credit"); 
        console.log("REPONSE API DEMANDES :", response.data);
        return response.data;
    },

    // Récupérer une demande par ID
    getById: async (id) => {
        const response = await api.get(`/demandes-credit/${id}`);
        return response.data;
    },

    // Récupérer les demandes d'un client
    getByClientId: async (clientId) => {
        const response = await api.get(`/demandes-credit/client/${clientId}`);
        return response.data;
    },

    // Récupérer les demandes selon le statut
    getByStatut: async (statut) => {
        const response = await api.get(`/demandes-credit/statut/${statut}`);
        return response.data;
    },

    // Créer une demande
    creer: async (demande) => {
        const response = await api.post("/demandes-credit", demande);
        return response.data;
    },

    // Modifier le statut
    updateStatut: async (id, statut, motif) => {
        const response = await api.put(
            `/demandes-credit/${id}/statut`,
            null,
            {
                params: {
                    statut: statut,
                    ...(motif ? { motif } : {})
                }
            }
        );
        return response.data;
    }
};

export default demandeCreditService;