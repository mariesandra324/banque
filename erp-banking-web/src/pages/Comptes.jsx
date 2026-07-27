import { useState, useEffect } from 'react';
import { getComptes, createCompte, updateCompte, deleteCompte, previewNumero } from '../service/compteService';
import { clientService } from '../service/clientService';

const Comptes = () => {
  const [comptes, setComptes] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCompteId, setCurrentCompteId] = useState(null);

  const [formData, setFormData] = useState({
    numeroCompte: '',
    typeCompte: '',
    solde: '0',
    statut: 'ACTIF',
    clientId: ''
  });

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

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentCompteId(null);
    setFormData({ numeroCompte: '', typeCompte: '', solde: '0', statut: 'ACTIF', clientId: '' });
    setFieldErrors({});
    setIsModalOpen(true);
  };

  // When creating a new account, preview generated numeroCompte when client and type are selected
  useEffect(() => {
    const fetchPreview = async () => {
      if (isEditing) return;
      const clientId = Number(formData.clientId);
      const type = formData.typeCompte;
      if (!clientId || !type) {
        setFormData((f) => ({ ...f, numeroCompte: '' }));
        return;
      }

      try {
        const resp = await previewNumero(clientId, type);
        setFormData((f) => ({ ...f, numeroCompte: resp.data.numeroCompte || '' }));
      } catch (err) {
        setFormData((f) => ({ ...f, numeroCompte: '' }));
        const msg = err.response?.data?.message || err.message || 'Impossible de générer le numéro de compte.';
        setError(msg);
      }
    };

    fetchPreview();
  }, [formData.clientId, formData.typeCompte, isEditing]);

  const handleOpenEditModal = (compte) => {
    setIsEditing(true);
    setCurrentCompteId(compte.id);
    setFormData({
      numeroCompte: compte.numeroCompte || '',
      typeCompte: compte.typeCompte || '',
      solde: compte.solde?.toString() ?? '0',
      statut: compte.statut || '',
      clientId: compte.clientId?.toString() || ''
    });
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFieldErrors({ ...fieldErrors, [name]: '' });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.typeCompte.trim()) {
      errors.typeCompte = 'Le type de compte est requis.';
    }
    if (!formData.clientId) {
      errors.clientId = 'Le client associé est requis.';
    }
    const soldeValue = Number(formData.solde.replace(',', '.'));
    if (formData.solde.toString().trim() === '' || Number.isNaN(soldeValue)) {
      errors.solde = 'Le solde doit être un nombre valide.';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const payload = {
      typeCompte: formData.typeCompte.trim(),
      solde: Number(formData.solde.replace(',', '.')),
      statut: formData.statut.trim(),
      clientId: Number(formData.clientId)
    };

    try {
      if (isEditing) {
        await updateCompte(currentCompteId, payload);
        showNotification('Compte modifié avec succès.');
      } else {
        await createCompte(payload);
        showNotification('Compte créé avec succès.');
      }
      setIsModalOpen(false);
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
        
        <button
          onClick={handleOpenAddModal}
          style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
        >
          + Ajouter un compte
        </button>
      </div>

      {notification && (
        <div style={{ marginBottom: '18px', padding: '12px 16px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #d1fae5' }}>
          {notification}
        </div>
      )}

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px', color: '#475569' }}>Numéro de compte</th>
              <th style={{ padding: '16px', color: '#475569' }}>Type</th>
              <th style={{ padding: '16px', color: '#475569' }}>Solde</th>
              <th style={{ padding: '16px', color: '#475569' }}>Statut</th>
              <th style={{ padding: '16px', color: '#475569' }}>Client</th>
              <th style={{ padding: '16px', color: '#475569' }}>Date de création</th>
              <th style={{ padding: '16px', color: '#475569' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {comptes.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>Aucun compte en base de données.</td>
              </tr>
            ) : (
              comptes.map((compte) => {
                const client = clients.find((c) => c.id === compte.clientId);
                return (
                  <tr key={compte.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '16px', fontWeight: '500' }}>{compte.numeroCompte}</td>
                    <td style={{ padding: '16px', color: '#475569' }}>{compte.typeCompte}</td>
                    <td style={{ padding: '16px', color: '#475569' }}>{compte.solde != null ? compte.solde.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
                    <td style={{ padding: '16px', color: '#475569' }}>{compte.statut}</td>
                    <td style={{ padding: '16px', color: '#475569' }}>{client ? `${client.nom} ${client.prenom}` : compte.clientId}</td>
                    <td style={{ padding: '16px', color: '#475569' }}>{compte.dateCreation || '-'}</td>
                    <td style={{ padding: '16px' }}>
                      <button
                        onClick={() => handleOpenEditModal(compte)}
                        style={{ marginRight: '12px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(compte.id)}
                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '8px', width: '100%', maxWidth: '500px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>
              {isEditing ? 'Modifier le compte' : 'Ajouter un nouveau compte'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Numéro de compte</label>
                <input
                  type="text"
                  name="numeroCompte"
                  value={formData.numeroCompte}
                  disabled
                  placeholder={isEditing ? '' : 'Généré automatiquement après sélection client/type'}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', boxSizing: 'border-box' }}
                />
                {!isEditing && !formData.numeroCompte && (
                  <div style={{ marginTop: '6px', color: '#64748b', fontSize: '13px' }}>Sélectionnez un client et un type pour afficher le N° de compte.</div>
                )}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Type de compte</label>
                <select
                  name="typeCompte"
                  value={formData.typeCompte}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: 'white' }}
                >
                  <option value="">Sélectionnez un type</option>
                  <option value="Courant">Courant</option>
                  <option value="Epargne">Épargne</option>
                  <option value="A terme">À terme</option>
                  <option value="Devises">Devises</option>
                </select>
                {fieldErrors.typeCompte && <div style={{ marginTop: '6px', color: '#b91c1c', fontSize: '13px' }}>{fieldErrors.typeCompte}</div>}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Solde</label>
                <input
                  type="number"
                  step="0.01"
                  name="solde"
                  value={formData.solde}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
                {fieldErrors.solde && <div style={{ marginTop: '6px', color: '#b91c1c', fontSize: '13px' }}>{fieldErrors.solde}</div>}
              </div>
              {/* Le statut est géré automatiquement côté backend; champ masqué côté UI */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Client associé</label>
                <select
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                >
                  <option value="">Sélectionnez un client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.nom} {client.prenom} {client.cin ? `- ${client.cin}` : ''}
                    </option>
                  ))}
                </select>
                {fieldErrors.clientId && <div style={{ marginTop: '6px', color: '#b91c1c', fontSize: '13px' }}>{fieldErrors.clientId}</div>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: 'white', cursor: 'pointer' }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', backgroundColor: '#2563eb', color: 'white', cursor: 'pointer', fontWeight: '500' }}
                >
                  {isEditing ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comptes;
