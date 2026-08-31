import api from "./api";

export const getPermissions = () =>
    api.get("/permissions");

export const getPermission = (id) =>
    api.get(`/permissions/${id}`);

export const createPermission = (permission) =>
    api.post("/permissions", permission);

export const updatePermission = (id, permission) =>
    api.put(`/permissions/${id}`, permission);

export const deletePermission = (id) =>
    api.delete(`/permissions/${id}`);