import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { clientService } from '../service/clientService';
import { getComptes } from '../service/compteService';
import ClientForm from '../features/client/ClientForm';
import ClientTable from '../features/client/ClientTable';
import ClientMobileModal from '../features/client/ClientMobileModal';
import { useAuth } from '../hooks/useAuth';
import { extraireMessageErreur } from '../utils/messageErreur';

// Le comptable est un rôle de consultation : il ne peut pas créer de client.
const ROLES_AUTORISES_A_CREER = ['ADMIN', 'AGENT', 'GESTIONNAIRE'];

const Clients = () => {
  const { user } = useAuth();
  const peutCreerClient = ROLES_AUTORISES_A_CREER.includes(user?.role);

  const [clients, setClients] = useState([]);
  const [comptes, setComptes] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const [vue, setVue] = useState('liste'); // 'liste' par défaut
  const [clientEnEdition, setClientEnEdition] = useState(null);
  const [clientMobileCible, setClientMobileCible] = useState(null);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 5000);
  };

  const loadClients = async () => {
    try {
      setLoading(true);
      const [data, comptesResponse] = await Promise.all([
        clientService.getAllClients(),
        getComptes().then((response) => response.data).catch(() => []),
      ]);
      setClients(data);
      setComptes(Array.isArray(comptesResponse) ? comptesResponse : []);
      setError(null);
    } catch (err) {
      console.error('Erreur API clients :', err);
      setError(extraireMessageErreur(err, 'Erreur inconnue lors de la récupération des clients.'));
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

  const handleMobileSuccess = () => {
    showNotification("Accès mobile créé avec succès pour le client.");
    setClientMobileCible(null);
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
      setError(extraireMessageErreur(err, 'Impossible de supprimer le client.'));
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Chargement depuis la base de données...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>Erreur : {error}</div>;

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: '20px', margin: 0, color: 'var(--heading)' }}>Clients</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {vue === 'liste' && (
            <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Rechercher par nom ou n° de compte..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 34px', borderRadius: '6px', border: '1px solid var(--input-border)', fontSize: '13px', boxSizing: 'border-box', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)' }}
              />
            </div>
          )}

          {vue === 'liste' ? (
            peutCreerClient && (
              <button
                onClick={handleOpenAdd}
                style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
              >
                + Ajouter un client
              </button>
            )
          ) : (
            <button
              onClick={handleVoirListe}
              style={{ backgroundColor: 'var(--card-bg)', color: '#2563eb', padding: '10px 16px', borderRadius: '6px', border: '1px solid #2563eb', cursor: 'pointer', fontWeight: '500' }}
            >
              Voir la liste des clients
            </button>
          )}
        </div>
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
          comptes={comptes}
          recherche={recherche}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onCreateMobile={setClientMobileCible}
        />
      )}

      {clientMobileCible && (
        <ClientMobileModal
          client={clientMobileCible}
          onClose={() => setClientMobileCible(null)}
          onSuccess={handleMobileSuccess}
        />
      )}
    </div>
  );
};

export default Clients;
