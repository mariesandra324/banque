import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clientService } from '../../service/clientService';

const inputStyle = {
  width: '100%', padding: '9px 10px', borderRadius: '6px', border: '1px solid #d1d5db',
  fontSize: '13px', boxSizing: 'border-box',
};
const labelStyle = { display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: '500' };

function CreditForm({ onClose, onSubmit }) {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [donnees, setDonnees] = useState({
    clientId: '',
    montant: '',
    tauxInteret: '',
    dureeMois: '',
    dateDebut: '',
  });
  const [erreurs, setErreurs] = useState({});
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    clientService.getAllClients().then(setClients).catch(() => setClients([]));
  }, []);

  const majChamp = (champ, valeur) => {
    setDonnees((d) => ({ ...d, [champ]: valeur }));
    setErreurs((e) => ({ ...e, [champ]: null }));
  };

  const valider = () => {
    const nouvellesErreurs = {};
    if (!donnees.clientId) nouvellesErreurs.clientId = 'Client requis';
    if (!donnees.montant || Number(donnees.montant) <= 0) nouvellesErreurs.montant = 'Montant invalide';
    if (!donnees.tauxInteret || Number(donnees.tauxInteret) <= 0) nouvellesErreurs.tauxInteret = 'Taux invalide';
    if (!donnees.dureeMois || Number(donnees.dureeMois) <= 0) nouvellesErreurs.dureeMois = 'Durée invalide';
    if (!donnees.dateDebut) nouvellesErreurs.dateDebut = 'Date de début requise';
    setErreurs(nouvellesErreurs);
    return Object.keys(nouvellesErreurs).length === 0;
  };

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
      return;
    }

    navigate('/credits');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valider()) return;
    setEnvoi(true);
    try {
      await onSubmit({
        clientId: donnees.clientId,
        montant: Number(donnees.montant),
        tauxInteret: Number(donnees.tauxInteret),
        dureeMois: Number(donnees.dureeMois),
        dateDebut: donnees.dateDebut,
      });
      handleClose();
    } catch (err) {
      console.error(err);
      setErreurs({ global: 'Erreur lors de la création du crédit.' });
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '680px' }}>
      <button
        onClick={handleClose}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'none', border: 'none', cursor: 'pointer', color: '#64748b',
          fontSize: '13px', fontWeight: '500', marginBottom: '18px', padding: 0,
        }}
      >
        <ArrowLeft size={16} /> Retour
      </button>

      <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '20px' }}>Nouveau crédit</h2>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
        {erreurs.global && (
          <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '14px', fontSize: '13px' }}>
            {erreurs.global}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Client</label>
            <select
              value={donnees.clientId}
              onChange={(e) => majChamp('clientId', e.target.value)}
              style={{ ...inputStyle, borderColor: erreurs.clientId ? '#dc2626' : '#d1d5db' }}
            >
              <option value="">Sélectionner un client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.nom} {c.prenom}</option>
              ))}
            </select>
            {erreurs.clientId && <span style={{ color: '#dc2626', fontSize: '12px' }}>{erreurs.clientId}</span>}
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Montant (Ar)</label>
            <input
              type="number"
              min="0"
              value={donnees.montant}
              onChange={(e) => majChamp('montant', e.target.value)}
              style={{ ...inputStyle, borderColor: erreurs.montant ? '#dc2626' : '#d1d5db' }}
            />
            {erreurs.montant && <span style={{ color: '#dc2626', fontSize: '12px' }}>{erreurs.montant}</span>}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Taux d'intérêt (%)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={donnees.tauxInteret}
                onChange={(e) => majChamp('tauxInteret', e.target.value)}
                style={{ ...inputStyle, borderColor: erreurs.tauxInteret ? '#dc2626' : '#d1d5db' }}
              />
              {erreurs.tauxInteret && <span style={{ color: '#dc2626', fontSize: '12px' }}>{erreurs.tauxInteret}</span>}
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Durée (mois)</label>
              <input
                type="number"
                min="1"
                value={donnees.dureeMois}
                onChange={(e) => majChamp('dureeMois', e.target.value)}
                style={{ ...inputStyle, borderColor: erreurs.dureeMois ? '#dc2626' : '#d1d5db' }}
              />
              {erreurs.dureeMois && <span style={{ color: '#dc2626', fontSize: '12px' }}>{erreurs.dureeMois}</span>}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Date de début</label>
            <input
              type="date"
              value={donnees.dateDebut}
              onChange={(e) => majChamp('dateDebut', e.target.value)}
              style={{ ...inputStyle, borderColor: erreurs.dateDebut ? '#dc2626' : '#d1d5db' }}
            />
            {erreurs.dateDebut && <span style={{ color: '#dc2626', fontSize: '12px' }}>{erreurs.dateDebut}</span>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={handleClose}
              style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={envoi}
              style={{
                padding: '9px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: 'white',
                fontSize: '13px', fontWeight: '600', cursor: envoi ? 'not-allowed' : 'pointer', opacity: envoi ? 0.7 : 1,
              }}
            >
              {envoi ? 'Envoi...' : 'Créer le crédit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreditForm;