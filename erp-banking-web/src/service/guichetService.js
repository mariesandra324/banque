import api from "./api";

export const getGuichets = () =>
  api.get("/guichets");

export const getGuichetsDisponibles = () =>
  api.get("/guichets/disponibles");

export const createGuichet = (guichet) =>
  api.post("/guichets", guichet);

export const updateGuichet = (id, guichet) =>
  api.put(`/guichets/${id}`, guichet);

export const deleteGuichet = (id) =>
  api.delete(`/guichets/${id}`);
