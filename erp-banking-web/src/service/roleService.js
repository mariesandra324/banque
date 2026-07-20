import api from "./api";

export const getRoles = () =>
    api.get("/roles");

export const getRole = (id) =>
    api.get(`/roles/${id}`);

export const createRole = (role) =>
    api.post("/roles", role);

export const updateRole = (id, role) =>
    api.put(`/roles/${id}`, role);

export const deleteRole = (id) =>
    api.delete(`/roles/${id}`);