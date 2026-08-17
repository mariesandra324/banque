import axios from "axios";

const API_URL = "http://localhost:8080/api/utilisateurs";

const authHeader = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
});

export const getUtilisateurs = () =>
    axios.get(API_URL, authHeader());
    console.log("Réponse backend :");

export const createUtilisateur = (data) =>
    axios.post(API_URL, data, authHeader());

export const updateUtilisateur = (id, data) =>
    axios.put(`${API_URL}/${id}`, data, authHeader());

export const deleteUtilisateur = (id) =>
    axios.delete(`${API_URL}/${id}`, authHeader());

export const getUtilisateurById = (id) =>
    axios.get(`${API_URL}/${id}`, authHeader());