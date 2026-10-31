import api from "./api";

export const getMonGuichet = () => api.get("/caisse/mon-guichet");
export const getPositionCash = () => api.get("/caisse/position-cash");
export const ouvrirSession = (data) => api.post("/caisse/ouvrir-session", data);
export const fermerSession = (data) => api.post("/caisse/fermer-session", data);
export const creerDemandeTransfert = (data) => api.post("/caisse/demande-transfert", data);
export const getMesDemandesTransfert = () => api.get("/caisse/mes-demandes-transfert");
export const getDemandesTransfertEnAttente = () => api.get("/caisse/demandes-transfert/en-attente");
export const getDemandesTransfert = () => api.get("/caisse/demandes-transfert");
export const traiterDemandeTransfert = (id, data) => api.post(`/caisse/demandes-transfert/${id}/traiter`, data);
export const enregistrerComptage = (data) => api.post("/caisse/comptage", data);
export const getMesComptages = () => api.get("/caisse/mes-comptages");
export const getClotures = () => api.get("/caisse/clotures");
export const validerCloture = (sessionId) => api.post(`/caisse/clotures/${sessionId}/valider`);
export const rejeterCloture = (sessionId, motifRejet) =>
  api.post(`/caisse/clotures/${sessionId}/rejeter`, { motifRejet });

export default {
  getMonGuichet,
  getPositionCash,
  ouvrirSession,
  fermerSession,
  creerDemandeTransfert,
  getMesDemandesTransfert,
  getDemandesTransfertEnAttente,
  getDemandesTransfert,
  traiterDemandeTransfert,
  enregistrerComptage,
  getMesComptages,
  getClotures,
  validerCloture,
  rejeterCloture,
};
