import api from "./api";

export const getInteretsMensuels = () =>
  api.get("/comptes/interets-mensuels");

export const updateInteretsMensuels = (parametres) =>
  api.put("/comptes/interets-mensuels", parametres);
