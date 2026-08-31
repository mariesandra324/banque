import { useEffect, useState } from 'react';
import { ArrowLeft} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clientService } from '../../service/clientService';

const inputStyle = {
  width: '100%', padding: '9px 10px', borderRadius: '6px', border: '1px solid #d1d5db',
  fontSize: '13px', boxSizing: 'border-box',
};
const labelStyle = { display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: '500' };

function DemandeCreditForm({ onSubmit, onClose }) {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [donnees, setDonnees] = useState({
    clientId: '',
    montantDemande: '',
    dureeMois: '',
    motif: '',
    profession: '',
    tauxInteret:'',
    typeContrat: '',
    revenuMensuel: '',
    chargesMensuelles: '',
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
    if (!donnees.montantDemande || Number(donnees.montantDemande) <= 0) nouvellesErreurs.montantDemande = 'Montant invalide';
    if (!donnees.dureeMois || Number(donnees.dureeMois) <= 0) nouvellesErreurs.dureeMois = 'Durée invalide';
    if (!donnees.motif.trim()) nouvellesErreurs.motif = 'Motif requis';
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
      const payload = {
        clientId: donnees.clientId,
        montantDemande: Number(donnees.montantDemande),
        duree: Number(donnees.dureeMois),
        motif: donnees.motif,
        profession: donnees.profession || null,
        typeContrat: donnees.typeContrat || null,
        tauxInteret: donnees.tauxInteret ? Number(donnees.tauxInteret):null,
        revenuMensuel: donnees.revenuMensuel ? Number(donnees.revenuMensuel) : null,
        chargesMensuelles: donnees.chargesMensuelles ? Number(donnees.chargesMensuelles) : null,
      };
      console.log('Payload envoyé depuis le formulaire :', payload);
      await onSubmit(payload);
      handleClose();
    } catch (err) {
      console.error(err);
      setErreurs({ global: "Erreur lors de la création de la demande." });
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '640px' }}>
      <button
        onClick={handleClose}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '13px', fontWeight: '500', marginBottom: '18px', padding: 0 }}
      >
        <ArrowLeft size={16} /> Retour
      </button>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '20px' }}>Nouvelle demande de crédit</h2>
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
            <label style={labelStyle}>Montant demandé (Ar)</label>
            <input
              type="number"
              min="0"
              value={donnees.montantDemande}
              onChange={(e) => majChamp('montantDemande', e.target.value)}
              style={{ ...inputStyle, borderColor: erreurs.montantDemande ? '#dc2626' : '#d1d5db' }}
            />
            {erreurs.montantDemande && <span style={{ color: '#dc2626', fontSize: '12px' }}>{erreurs.montantDemande}</span>}
          </div>

          <div style={{ marginBottom: '14px' }}>
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

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Motif</label>
            <textarea
              rows={3}
              value={donnees.motif}
              onChange={(e) => majChamp('motif', e.target.value)}
              style={{ ...inputStyle, resize: 'vertical', borderColor: erreurs.motif ? '#dc2626' : '#d1d5db' }}
            />
            {erreurs.motif && <span style={{ color: '#dc2626', fontSize: '12px' }}>{erreurs.motif}</span>}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Profession</label>
              <input
                type="text"
                value={donnees.profession}
                onChange={(e) => majChamp('profession', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Type de contrat</label>
              <select
                value={donnees.typeContrat}
                onChange={(e) => majChamp('typeContrat', e.target.value)}
                style={inputStyle}
              >
                <option value="">Sélectionner</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="INDEPENDANT">Indépendant</option>
                <option value="FREELANCE">Freelance</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Revenu mensuel (Ar)</label>
              <input
                type="number"
                min="0"
                value={donnees.revenuMensuel}
                onChange={(e) => majChamp('revenuMensuel', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Charges mensuelles (Ar)</label>
              <input
                type="number"
                min="0"
                value={donnees.chargesMensuelles}
                onChange={(e) => majChamp('chargesMensuelles', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Taux d'interêt (Ar)</label>
              <input
                type="number"
                min="0"
                value={donnees.tauxInteret}
                onChange={(e) => majChamp('tauxInteret', e.target.value)}
                style={inputStyle}
              />
            </div>
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
              {envoi ? 'Envoi...' : 'Créer la demande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DemandeCreditForm;