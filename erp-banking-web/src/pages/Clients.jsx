/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { clientService } from '../service/clientService';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  //notification
  const [notification, setNotification] = useState(null);
  // messages d'erreur par champ du formulaire
  const [fieldErrors, setFieldErrors] = useState({ cin: '', telephone: '' });

  //recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // États pour la gestion du formulaire (Modale)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentClientId, setCurrentClientId] = useState(null);

  const PHONE_PREFIX = '+261';

  // État pour les champs du formulaire
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    cin: '',
    email: '',
    telephone: PHONE_PREFIX,
    adresse: '',
    dateNaissance: '' //  "YYYY-MM-DD"
  });

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 5000); 
  };
   
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Retourne la chaîne brute si invalide
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Charger les données au démarrage
  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getAllClients();
      setClients(data);
      setError(null);
    } catch (err) {
      console.error("Erreur API clients :", err);
      setError(err.message ?? "Erreur inconnue lors de la récupération des clients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadClients();
  }, []);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim() === '') {
      setIsSearching(false);
      loadClients();
    } else {
      try {
        setIsSearching(true);
        const searchResults = await clientService.searchClients(value);
        setClients(searchResults);
      } catch (err) {
        setError("Erreur de recherche : " + err.message); 
      }
    }
  };

  // Fonction pour vider la recherche
  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    loadClients(); 
  };

  // Ouvrir la modale pour l'ajout
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setFormData({ nom: '', prenom: '', cin: '', email: '', telephone: '+261', adresse: '', dateNaissance: '' });
    setFieldErrors({ cin: '', telephone: '' });
    setIsModalOpen(true);
  };

  // Ouvrir la modale pour la modification (pré-remplit les champs)
  const handleOpenEditModal = (client) => {
    console.log("Client sélectionné pour modification :", client);
    setIsEditing(true);
    setCurrentClientId(client.id);
    
    let formattedDate = '';
    if (client.dateNaissance) {
      const rawDate = typeof client.dateNaissance === 'string'
        ? client.dateNaissance
        : new Date(client.dateNaissance).toISOString();
      formattedDate = rawDate.substring(0, 10);
    }

    setFormData({
      nom: client.nom,
      prenom: client.prenom,
      cin: client.cin || '',
      email: client.email,
      telephone: client.telephone,
      adresse: client.adresse,
      dateNaissance: formattedDate
    });
    setFieldErrors({ cin: '', telephone: '' });
    setIsModalOpen(true);
  };

  // Gérer le changement dans les champs de saisie
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'telephone') {
      let normalized = value;
      if (!normalized.startsWith(PHONE_PREFIX)) {
        const afterPrefix = normalized.replace(/^\+?261/, '');
        normalized = PHONE_PREFIX + afterPrefix;
      }
      setFormData({ ...formData, telephone: normalized });
      setFieldErrors({ ...fieldErrors, telephone: '' });
      return;
    }

    setFormData({ ...formData, [name]: value });
    setFieldErrors({ ...fieldErrors, [name]: '' });
  };

  // Soumettre le formulaire (Ajout OU Modification)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const phoneRegex = /^\+261\s?(32|33|34|37|38)\s?\d{2}\s?\d{3}\s?\d{2}$|^\+261(32|33|34|37|38)\d{7}$/;
    const errors = { cin: '', telephone: '' };

    const cinValue = formData.cin?.trim() || '';
    if (!/^[0-9]{12}$/.test(cinValue)) {
      errors.cin = "Votre CIN est incorrecte. Il doit contenir exactement 12 chiffres.";
    }

    if (!phoneRegex.test(formData.telephone.trim())) {
      errors.telephone = "Votre téléphone est incorrect. Utilisez +261 suivi de 9 chiffres valides.";
    }

    if (errors.cin || errors.telephone) {
      setFieldErrors(errors);
      return;
    }
    try {
      if (isEditing) {
        await clientService.updateClient(currentClientId, formData);
        showNotification("Client modifié avec succès.");
      } else {
        await clientService.createClient(formData);
        showNotification("Client ajouté avec succès.");
      }
      setIsModalOpen(false);
      loadClients(); 
    } catch (err) {
      console.error("Erreur sauvegarde client :", err);
      alert("Erreur lors de l'enregistrement : " + (err.message || "Erreur inconnue."));
    }
  };

  // Supprimer un client
  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce client ?")) {
      try {
        await clientService.deleteClient(id);
        setClients(clients.filter(client => client.id !== id));
        showNotification("Client supprimé avec succès.");
      } catch (err) {
        console.error("Erreur suppression client :", err);
        alert("Impossible de supprimer le client : " + (err.message || "Erreur inconnue."));
      }
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Chargement depuis la base de données...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>Erreur : {error}</div>;

  return (
    <div style={{ width: '100%' }}>
      {/* Barre de Recherche Multicritère */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Rechercher par Nom, Prénom, Téléphone ou Email..."
            value={searchQuery}
            onChange={handleSearch}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              ×
            </button>
          )}
        </div>
        {isSearching && (
          <span style={{ fontSize: '14px', color: '#64748b', fontStyle: 'italic' }}>
            Filtrage en cours...
          </span>
        )}
      </div>
      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        
        <button 
          onClick={handleOpenAddModal}
          style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
        >
          + Ajouter un client
        </button>
      </div>

      {notification && (
        <div style={{ marginBottom: '18px', padding: '12px 16px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #d1fae5' }}>
          {notification}
        </div>
      )}

      {/* Tableau des données */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px', color: '#475569' }}>Nom</th>
              <th style={{ padding: '16px', color: '#475569' }}>Prénom</th>
              <th style={{ padding: '16px', color: '#475569' }}>E-mail</th>
              <th style={{ padding: '16px', color: '#475569' }}>Téléphone</th>
              <th style={{ padding: '16px', color: '#475569' }}>Adresse</th>
              <th style={{ padding: '16px', color: '#475569' }}>Date de naissance</th>
              <th style={{ padding: '16px', color: '#475569' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>Aucun client en base de données.</td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '16px', fontWeight: '500' }}>{client.nom}</td>
                  <td style={{ padding: '16px', color: '#475569' }}>{client.prenom}</td>
                  <td style={{ padding: '16px', color: '#475569' }}>{client.email}</td>
                  <td style={{ padding: '16px', color: '#475569' }}>{client.telephone}</td>
                  <td style={{ padding: '16px', color: '#475569' }}>{client.adresse}</td>
                  {/* Utilisation de la fonction de formatage pour l'affichage */}
                  <td style={{ padding: '16px', color: '#475569' }}>{formatDateForDisplay(client.dateNaissance)}</td>
                  <td style={{ padding: '16px' }}>
                    <button 
                      onClick={() => handleOpenEditModal(client)}
                      style={{ marginRight: '12px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                    >
                      Modifier
                    </button>
                    <button 
                      onClick={() => handleDelete(client.id)}
                      style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODALE DE FORMULAIRE */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '8px', width: '100%', maxWidth: '450px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>
              {isEditing ? 'Modifier le client' : 'Ajouter un nouveau client'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Nom</label>
                <input 
                  type="text" name="nom" value={formData.nom} onChange={handleInputChange} required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Prénom</label>
                <input 
                  type="text" name="prenom" value={formData.prenom} onChange={handleInputChange} required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>CIN</label>
                <input 
                  type="text" name="cin" value={formData.cin} onChange={handleInputChange} required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
                {fieldErrors.cin && (
                  <div style={{ marginTop: '6px', color: '#b91c1c', fontSize: '13px' }}>
                    {fieldErrors.cin}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>E-mail</label>
                <input 
                  type="email" name="email" value={formData.email} onChange={handleInputChange} required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Téléphone</label>
                <input 
                  type="text" name="telephone" value={formData.telephone} onChange={handleInputChange} required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
                {fieldErrors.telephone && (
                  <div style={{ marginTop: '6px', color: '#b91c1c', fontSize: '13px' }}>
                    {fieldErrors.telephone}
                  </div>
                )}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Adresse</label>
                <input 
                  type="text" name="adresse" value={formData.adresse} onChange={handleInputChange} required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>
              
              {/* DATE DE NAISSANCE AVEC SÉLECTEUR CALENDRIER */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Date de naissance</label>
                <input 
                  type="date" 
                  name="dateNaissance" 
                  value={formData.dateNaissance} 
                  onChange={handleInputChange} 
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              {/* Boutons de la modale */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  type="button" onClick={() => setIsModalOpen(false)}
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

export default Clients;