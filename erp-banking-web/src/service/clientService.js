// Remplace par l'URL de ton serveur Java (ex: Spring Boot tourne souvent sur le port 8080)
const API_URL = "http://localhost:8080/api/clients"; 

export const clientService = {
  // 1. Récupérer tous les clients (GET)
  getAllClients: async () => {
    const token = localStorage.getItem("token"); // Si ton API est sécurisée par JWT
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Enlève la ligne du dessous si ton API n'utilise pas de token de sécurité
        "Authorization": `Bearer ${token}` 
      }
    });
    
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des clients");
    }
    return response.json();
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
      throw new Error("Erreur lors de la création du client");
    }
    return response.json();
  },

  // 3. MODIFIER un client (PUT) 
  updateClient: async (id, clientData) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT", 
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(clientData)
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la modification du client");
    }
    return response.json();
  },

  // 4. Supprimer un client (DELETE)
  deleteClient: async (id) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la suppression du client");
    }
    return true;
  },

  // 5. Rechercher des clients par mot-clé (CIN, Téléphone, Email)
  searchClients: async (query) => {
    const token = localStorage.getItem("token"); 
    const response = await fetch(`${API_URL}/search?query=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la recherche des clients");
    }
    return response.json();
  }
};