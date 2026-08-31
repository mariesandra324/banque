import api from './api'; 

const RESOURCE = '/transactions';

export const effectuerTransaction = async (transactionData) => {
  const response = await api.post(RESOURCE, transactionData);
  return response.data;
};

export const getHistoriqueCompte = async (numeroCompte) => {
  const response = await api.get(`${RESOURCE}/historique/${numeroCompte}`);
  return response.data;
};

export const getAllTransactions = async () => {
  const response = await api.get(RESOURCE);
  return response.data;
};