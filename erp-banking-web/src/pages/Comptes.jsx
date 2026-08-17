import { useState, useEffect } from 'react';
import { getComptes, createCompte, updateCompte, deleteCompte } from '../service/compteService';
import { clientService } from '../service/clientService';
import CompteForm from '../features/compte/CompteForm';
import CompteTable from '../features/compte/CompteTable';

const Comptes = () => {
  const [comptes, setComptes] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // 'form' = formulaire affiché en premier (par défaut), 'liste' = tableau des comptes
  const [vue, setVue] = useState('form');
  const [compteEnEdition, setCompteEnEdition] = useState(null); // null = création, sinon = compte à éditer

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  };

  const loadClients = async () => {
    try {
      const data = await clientService.getAllClients();
      setClients(data);
    } catch (err) {
      console.error('Erreur chargement clients :', err);
    }
  };

  const loadComptes = async () => {
    try {
      setLoading(true);
      const response = await getComptes();
      setComptes(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur chargement comptes :', err);
      setError(err.message || 'Erreur lors de la récupération des comptes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await loadClients();
      await loadComptes();
    };
    fetchData();
  }, []);

  const voirListe = () => {
    setVue('liste');
  };

  const voirFormulaireAjout = () => {
    setCompteEnEdition(null);
    setVue('form');
  };

  const handleOpenEdit = (compte) => {
    setCompteEnEdition(compte);
    setVue('form');
  };

  const handleCancel = () => {
    setCompteEnEdition(null);
    setVue('liste');
  };

  const handleSubmit = async (payload) => {
    try {
      if (compteEnEdition) {
        await updateCompte(compteEnEdition.id, payload);
        showNotification('Compte modifié avec succès.');
      } else {
        await createCompte(payload);
        showNotification('Compte créé avec succès.');
      }
      setCompteEnEdition(null);
      setVue('liste');
      loadComptes();
    } catch (err) {
      console.error('Erreur sauvegarde compte :', err);
      setError(err.message || 'Impossible de sauvegarder le compte.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce compte ?')) return;
    try {
      await deleteCompte(id);
      setComptes(comptes.filter((compte) => compte.id !== id));
      showNotification('Compte supprimé avec succès.');
    } catch (err) {
      console.error('Erreur suppression compte :', err);
      setError(err.message || 'Impossible de supprimer le compte.');
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Chargement des comptes...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>Erreur : {error}</div>;
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: '20px', margin: 0, color: '#1f2937' }}>Comptes</h1>

        {vue === 'form' ? (
          <button
            onClick={voirListe}
            style={{ backgroundColor: 'white', color: '#2563eb', padding: '10px 16px', borderRadius: '6px', border: '1px solid #2563eb', cursor: 'pointer', fontWeight: '500' }}
          >
            Voir la liste des comptes
          </button>
        ) : (
          <button
            onClick={voirFormulaireAjout}
            style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
          >
            + Ajouter un compte
          </button>
        )}
      </div>

      {notification && (
        <div style={{ marginBottom: '18px', padding: '12px 16px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #d1fae5' }}>
          {notification}
        </div>
      )}

      {vue === 'form' ? (
        <CompteForm
          compte={compteEnEdition}
          clients={clients}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      ) : (
        <CompteTable
          comptes={comptes}
          clients={clients}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Comptes;
