import api from "./api";

export const getMonGuichet = () => api.get("/caisse/mon-guichet");
export const ouvrirSession = (data) => api.post("/caisse/ouvrir-session", data);
export const fermerSession = (data) => api.post("/caisse/fermer-session", data);
export const creerDemandeTransfert = (data) => api.post("/caisse/demande-transfert", data);
export const getMesDemandesTransfert = () => api.get("/caisse/mes-demandes-transfert");
export const getDemandesTransfertEnAttente = () => api.get("/caisse/demandes-transfert/en-attente");
export const traiterDemandeTransfert = (id, data) => api.post(`/caisse/demandes-transfert/${id}/traiter`, data);
export const enregistrerComptage = (data) => api.post("/caisse/comptage", data);
export const getMesComptages = () => api.get("/caisse/mes-comptages");

export default {
  getMonGuichet,
  ouvrirSession,
  fermerSession,
  creerDemandeTransfert,
  getMesDemandesTransfert,
  getDemandesTransfertEnAttente,
  traiterDemandeTransfert,
  enregistrerComptage,
  getMesComptages,
};
