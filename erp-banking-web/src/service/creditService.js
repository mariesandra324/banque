import api from '../api/axios'; 
export const getDemandesCredit = async () => {
  const response = await api.get('/demandes-credit');
  return response.data;
};

export const getCredits = async () => {
  const response = await api.get('/credits');
  return response.data;
};

export const approuverDemande = async (id) => {
  const response = await api.put(`/demandes-credit/${id}/ACCEPTER`);
  return response.data;
};

export const rejeterDemande = async (id) => {
  const response = await api.put(`/demandes-credit/${id}/REJETER`);
  return response.data;
};

export const creerDemandeCredit = async (donnees) => {
  const response = await api.post('/demandes-credit', donnees, {
    headers: {
      ...(donnees instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' })
    }
  });
  console.log('creerDemandeCredit');
  return response.data;
};

export const creerCredit = async (donnees) => {
  const response = await api.post('/credits', donnees);
  return response.data;
};