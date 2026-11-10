import api from "./api";
import { API_BASE } from "../config";

const API_URL = `${API_BASE}/clients`; 
const API_URL_MOBILE = `${API_BASE}/client-mobile`;

const getHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const extraireMessageErreur = async (response, messageParDefaut) => {
  try {
    const body = await response.json();
    return body?.message || messageParDefaut;
  } catch {
    return messageParDefaut;
  }
};
export const clientService = {
  // 1. Récupérer tous les clients (GET)
  getAllClients: async () => {
    const response = await api.get("/clients");
    return response.data;
  },

  // 2. Ajouter un client (POST)
  createClient: async (clientData) => {
    const token = localStorage.getItem("token");
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(clientData)
    });

    if (!response.ok) {
      throw new Error(await extraireMessageErreur(response, "Erreur lors de la création du client"));
    }
    return response.json();
  },

  // 3. MODIFIER un client (PUT) 
  updateClient: async (id, clientData) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT", 
      headers: getHeaders(),
      body: JSON.stringify(clientData)
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la modification du client");
    }
    return response.json();
  },

  // 4. Supprimer un client (DELETE)
  deleteClient: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(await extraireMessageErreur(response, "Erreur lors de la modification du client"));
    }
    return response.json();
  },

  // 5. Rechercher des clients par mot-clé (CIN, Téléphone, Email)
  searchClients: async (query) => {
    const response = await fetch(`${API_URL}/search?query=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la recherche des clients");
    }
    return response.json();
  },


  getClientById: async (id) => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  // 6. Créer l'accès mobile d'un client (POST /api/client-mobile/client/{clientId})
  createAccesMobile: async (clientId, data) => {
    const response = await fetch(`${API_URL_MOBILE}/client/${clientId}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(await extraireMessageErreur(response, "Erreur lors de la création de l'accès mobile"));
    }
    return response.json();
  },

  // 7. Lister tous les accès mobiles (GET /api/client-mobile)
  getAllAccesMobile: async () => {
    const response = await fetch(API_URL_MOBILE, {
      method: "GET",
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(await extraireMessageErreur(response, "Erreur lors de la récupération des accès mobiles"));
    }
    return response.json();
  },

  // 8. Modifier le statut d'un accès mobile (PATCH /api/client-mobile/{id}/statut/{statut})
  updateStatutAccesMobile: async (id, statut) => {
    const response = await fetch(`${API_URL_MOBILE}/${id}/statut/${statut}`, {
      method: "PATCH",
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(await extraireMessageErreur(response, "Erreur lors de la modification du statut"));
    }
    return response.json();
  }
  
};