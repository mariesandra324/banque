import axios from 'axios';

const API_URL = 'http://localhost:8080/api/transactions';

export const effectuerTransaction = async (transactionData) => {
    // transactionData = { type, montant, numeroCompteSource, numeroCompteDestination, description }
    const response = await axios.post(API_URL, transactionData);
    return response.data;
};

export const getHistoriqueCompte = async (numeroCompte) => {
    const response = await axios.get(`${API_URL}/historique/${numeroCompte}`);
    return response.data;
};

export const getAllTransactions = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

