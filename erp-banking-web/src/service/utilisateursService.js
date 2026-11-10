import axios from "axios";
import { API_BASE } from "../config";

const API_URL = `${API_BASE}/utilisateurs`;

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

export const bloquerUtilisateur = (id) =>
    axios.patch(`${API_URL}/${id}/bloquer`, {}, authHeader());

export const debloquerUtilisateur = (id) =>
    axios.patch(`${API_URL}/${id}/debloquer`, {}, authHeader());

export const getUtilisateurById = (id) =>
    axios.get(`${API_URL}/${id}`, authHeader());