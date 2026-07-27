import api from "./api";

export const getComptes = () =>
    api.get("/comptes");

export const getCompte = (id) =>
    api.get(`/comptes/${id}`);

export const createCompte = (compte) =>
    api.post("/comptes", compte);

export const previewNumero = (clientId, typeCompte) =>
    api.get(`/comptes/preview?clientId=${clientId}&typeCompte=${encodeURIComponent(typeCompte)}`);

export const updateCompte = (id, compte) =>
    api.put(`/comptes/${id}`, compte);

export const deleteCompte = (id) =>
    api.delete(`/comptes/${id}`);