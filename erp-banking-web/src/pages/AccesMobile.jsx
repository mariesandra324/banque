import { useEffect, useState } from 'react';
import { clientService } from '../service/clientService';
import ClientMobileTable from '../features/client/ClientMobileTable';
import { useAuth } from '../hooks/useAuth';

const AccesMobile = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [accesMobiles, setAccesMobiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 5000);
  };

  const loadAccesMobiles = async () => {
    try {
      setLoading(true);
      const data = await clientService.getAllAccesMobile();
      setAccesMobiles(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Erreur API accès mobiles :', err);
      setError(err.message ?? 'Erreur inconnue lors de la récupération des accès mobiles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAccesMobiles();
  }, []);

  const handleUpdateStatut = async (acces, nouveauStatut) => {
    const verbe = nouveauStatut === 'ACTIVE' ? 'Accepter' : nouveauStatut === 'REFUSEE' ? 'Refuser' : 'Bloquer';

    if (!window.confirm(
      `${verbe} la demande d'accès mobile de ${acces.clientNom} ${acces.clientPrenom} ?`
    )) return;

    try {
      await clientService.updateStatutAccesMobile(acces.id, nouveauStatut);
      showNotification('Statut de l\'accès mobile modifié avec succès.');
      loadAccesMobiles();
    } catch (err) {
      console.error('Erreur modification statut accès mobile :', err);
      setError(err.message || 'Impossible de modifier le statut.');
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Chargement des accès mobiles...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>Erreur : {error}</div>;

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: '20px', margin: 0, color: 'var(--heading)' }}>Accès mobiles</h1>
        {isAdmin && <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Seul l'administrateur peut accepter ou refuser une demande d'inscription (revenu déclaré).</span>}
      </div>

      {notification && (
        <div style={{ marginBottom: '18px', padding: '12px 16px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #d1fae5' }}>
          {notification}
        </div>
      )}

      <ClientMobileTable
        accesMobiles={accesMobiles}
        isAdmin={isAdmin}
        onUpdateStatut={handleUpdateStatut}
      />
    </div>
  );
};

export default AccesMobile;