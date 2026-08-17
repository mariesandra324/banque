import { useState, useEffect } from 'react';
import { clientService } from '../service/clientService';
import ClientForm from '../features/client/ClientForm';
import ClientTable from '../features/client/ClientTable';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const [vue, setVue] = useState('liste'); // 'liste' par défaut
  const [clientEnEdition, setClientEnEdition] = useState(null);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 5000);
  };

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getAllClients();
      setClients(data);
      setError(null);
    } catch (err) {
      console.error('Erreur API clients :', err);
      setError(err.message ?? 'Erreur inconnue lors de la récupération des clients.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadClients();
  }, []);

  const handleOpenAdd = () => {
    setClientEnEdition(null);
    setVue('form');
  };

  const handleOpenEdit = (client) => {
    setClientEnEdition(client);
    setVue('form');
  };

  const handleVoirListe = () => {
    setClientEnEdition(null);
    setVue('liste');
  };

  const handleCancel = () => {
    setClientEnEdition(null);
    setVue('liste');
  };

  const handleSuccess = () => {
    showNotification(clientEnEdition ? 'Client modifié avec succès.' : 'Client ajouté avec succès.');
    setClientEnEdition(null);
    setVue('liste');
    loadClients();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce client ?')) return;
    try {
      await clientService.deleteClient(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      showNotification('Client supprimé avec succès.');
    } catch (err) {
      console.error('Erreur suppression client :', err);
      setError(err.message || 'Impossible de supprimer le client.');
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Chargement depuis la base de données...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>Erreur : {error}</div>;

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: '20px', margin: 0, color: '#1f2937' }}>Clients</h1>

        {vue === 'liste' ? (
          <button
            onClick={handleOpenAdd}
            style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
          >
            + Ajouter un client
          </button>
        ) : (
          <button
            onClick={handleVoirListe}
            style={{ backgroundColor: 'white', color: '#2563eb', padding: '10px 16px', borderRadius: '6px', border: '1px solid #2563eb', cursor: 'pointer', fontWeight: '500' }}
          >
            Voir la liste des clients
          </button>
        )}
      </div>

      {notification && (
        <div style={{ marginBottom: '18px', padding: '12px 16px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #d1fae5' }}>
          {notification}
        </div>
      )}

      {vue === 'form' ? (
        <ClientForm
          client={clientEnEdition}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      ) : (
        <ClientTable
          clients={clients}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Clients;
