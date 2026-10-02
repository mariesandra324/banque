import { useEffect, useState } from 'react';
import { getUtilisateurs, deleteUtilisateur } from '../service/utilisateursService';
import UtilisateurForm from '../features/utilisateurs/UtilisateurForm';
import UtilisateurTable from '../features/utilisateurs/UtilisateursTable';

const Utilisateurs = () => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const [vue, setVue] = useState('liste'); 
  const [utilisateurEnEdition, setUtilisateurEnEdition] = useState(null);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  };

  const loadUtilisateurs = async () => {
  try {
    setLoading(true);

    const response = await getUtilisateurs();

    console.log("response data:", response);

    setUtilisateurs(response.data.data);

    setError(null);

  } catch (err) {
    console.error('Erreur chargement utilisateurs :', err);
    setError(err.message || 'Erreur lors de la récupération des utilisateurs.');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUtilisateurs();
  }, []);

  const handleOpenAdd = () => {
    setUtilisateurEnEdition(null);
    setVue('form');
  };

  const handleOpenEdit = (utilisateur) => {
    setUtilisateurEnEdition(utilisateur);
    setVue('form');
  };

  const handleVoirListe = () => {
    setUtilisateurEnEdition(null);
    setVue('liste');
  };

  const handleCancel = () => {
    setUtilisateurEnEdition(null);
    setVue('liste');
  };

  const handleSuccess = () => {
    showNotification(utilisateurEnEdition ? 'Utilisateur modifié avec succès.' : 'Utilisateur créé avec succès.');
    setUtilisateurEnEdition(null);
    setVue('liste');
    loadUtilisateurs();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) return;
    try {
      await deleteUtilisateur(id);
      setUtilisateurs((prev) => prev.filter((u) => u.id !== id));
      showNotification('Utilisateur supprimé avec succès.');
    } catch (err) {
      console.error('Erreur suppression utilisateur :', err);
      setError(err.message || "Impossible de supprimer l'utilisateur.");
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Chargement des utilisateurs...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>Erreur : {error}</div>;
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: '20px', margin: 0, color: 'var(--heading)' }}>Utilisateurs</h1>

        {/* Bouton toujours visible, quelle que soit la vue */}
        {vue === 'liste' ? (
          <button
            onClick={handleOpenAdd}
            style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
          >
            + Ajouter un utilisateur
          </button>
        ) : (
          <button
            onClick={handleVoirListe}
            style={{ backgroundColor: 'var(--card-bg)', color: '#2563eb', padding: '10px 16px', borderRadius: '6px', border: '1px solid #2563eb', cursor: 'pointer', fontWeight: '500' }}
          >
            Voir la liste des utilisateurs
          </button>
        )}
      </div>

      {notification && (
        <div style={{ marginBottom: '18px', padding: '12px 16px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #d1fae5' }}>
          {notification}
        </div>
      )}

      {vue === 'form' ? (
        <UtilisateurForm
          utilisateur={utilisateurEnEdition}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      ) : (
        <UtilisateurTable
          utilisateurs={utilisateurs}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Utilisateurs;
