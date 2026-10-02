import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { creerCredit } from '../../service/creditService';
import demandeCreditService from '../../service/demandeCreditService';

const inputStyle = {
  width: '100%', padding: '9px 10px', borderRadius: '6px', border: '1px solid var(--input-border)',
  fontSize: '13px', boxSizing: 'border-box', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)',
};
const labelStyle = { display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '500' };

function CreditForm({ onClose, onSubmit }) {
  const navigate = useNavigate();
  const [demandes, setDemandes] = useState([]);
  const [donnees, setDonnees] = useState({
    demandeCreditId: '',
    montant: '',
    tauxInteret: '',
    duree: '',
    mensualite: '',
    dateDebut: '',
  });
  const [erreurs, setErreurs] = useState({});
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    const chargerDemandes = async () => {
      try {
        const data = await demandeCreditService.getByStatut('ACCEPTER');
        setDemandes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erreur chargement demandes :', err.response?.data || err.message);
        setDemandes([]);
      }
    };

    chargerDemandes();
  }, []);

  const majChamp = (champ, valeur) => {
    setDonnees((d) => ({ ...d, [champ]: valeur }));
    setErreurs((e) => ({ ...e, [champ]: null, global: null }));
  };

  const chargerDemande = (id) => {
    const demande = demandes.find((d) => String(d.id) === String(id));

    if (!demande) return;

    setDonnees((d) => ({
      ...d,
      demandeCreditId: id,
      montant: demande.montantDemande || d.montant,
      tauxInteret: demande.tauxInteret != null ? demande.tauxInteret : d.tauxInteret,
      duree: demande.duree || d.duree,
    }));
  };

  const calculerMensualite = () => {
    const montant = Number(donnees.montant);
    const taux = Number(donnees.tauxInteret);
    const duree = Number(donnees.duree);

    if (montant > 0 && taux > 0 && duree > 0) {
      const tauxMensuel = taux / 100 / 12;
      const mensualite =
        montant *
          tauxMensuel *
          Math.pow(1 + tauxMensuel, duree) /
        (Math.pow(1 + tauxMensuel, duree) - 1);

      majChamp('mensualite', mensualite.toFixed(2));
    }
  };

  const valider = () => {
    const nouvellesErreurs = {};

    if (!donnees.demandeCreditId) nouvellesErreurs.demandeCreditId = 'Demande de crédit requise';
    if (!donnees.montant || Number(donnees.montant) <= 0) nouvellesErreurs.montant = 'Montant invalide';
    if (!donnees.tauxInteret || Number(donnees.tauxInteret) <= 0) nouvellesErreurs.tauxInteret = 'Taux invalide';
    if (!donnees.duree || Number(donnees.duree) <= 0) nouvellesErreurs.duree = 'Durée invalide';
    if (!donnees.mensualite || Number(donnees.mensualite) <= 0) nouvellesErreurs.mensualite = 'Mensualité invalide';
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
      const payload = {
        demandeCreditId: Number(donnees.demandeCreditId),
        montant: Number(donnees.montant),
        tauxInteret: Number(donnees.tauxInteret),
        duree: Number(donnees.duree),
        mensualite: Number(donnees.mensualite),
        dateDebut: donnees.dateDebut
          ? `${donnees.dateDebut}T00:00:00`
          : donnees.dateDebut,
      };

      console.log('PAYLOAD CREDIT :', payload);

      if (typeof onSubmit === 'function') {
        await onSubmit(payload);
      } else {
        await creerCredit(payload);
      }

      handleClose();
    } catch (err) {
      console.error(err);
      setErreurs({ global: err.response?.data?.message || 'Erreur lors de la création du crédit.' });
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
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)',
          fontSize: '13px', fontWeight: '500', marginBottom: '18px', padding: 0,
        }}
      >
        <ArrowLeft size={16} /> Retour
      </button>

      <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--heading)', marginBottom: '20px' }}>Nouveau crédit</h2>

      <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '20px' }}>
        {erreurs.global && (
          <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '14px', fontSize: '13px' }}>
            {erreurs.global}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Demande de crédit acceptée</label>
            <select
              value={donnees.demandeCreditId}
              onChange={(e) => chargerDemande(e.target.value)}
              style={{ ...inputStyle, borderColor: erreurs.demandeCreditId ? '#dc2626' : 'var(--input-border)' }}
            >
              <option value="">Sélectionner une demande acceptée</option>
              {demandes.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.reference || `Demande #${d.id}`} - {d.clientNom || ''} {d.clientPrenom || ''} - {Number(d.montantDemande || 0).toLocaleString('fr-FR')} Ar
                </option>
              ))}
            </select>
            {erreurs.demandeCreditId && <span style={{ color: '#dc2626', fontSize: '12px' }}>{erreurs.demandeCreditId}</span>}
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Montant (Ar)</label>
            <input
              type="number"
              min="0"
              value={donnees.montant}
              onChange={(e) => majChamp('montant', e.target.value)}
              style={{ ...inputStyle, borderColor: erreurs.montant ? '#dc2626' : 'var(--input-border)' }}
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
                style={{ ...inputStyle, borderColor: erreurs.tauxInteret ? '#dc2626' : 'var(--input-border)' }}
              />
              {erreurs.tauxInteret && <span style={{ color: '#dc2626', fontSize: '12px' }}>{erreurs.tauxInteret}</span>}
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Durée (mois)</label>
              <input
                type="number"
                min="1"
                value={donnees.duree}
                onChange={(e) => majChamp('duree', e.target.value)}
                style={{ ...inputStyle, borderColor: erreurs.duree ? '#dc2626' : 'var(--input-border)' }}
              />
              {erreurs.duree && <span style={{ color: '#dc2626', fontSize: '12px' }}>{erreurs.duree}</span>}
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Mensualité (Ar)</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="number"
                min="0"
                step="0.01"
                value={donnees.mensualite}
                onChange={(e) => majChamp('mensualite', e.target.value)}
                style={{ ...inputStyle, borderColor: erreurs.mensualite ? '#dc2626' : 'var(--input-border)' }}
              />
              <button
                type="button"
                onClick={calculerMensualite}
                style={{
                  padding: '9px 14px', borderRadius: '8px', border: '1px solid var(--input-border)',
                  backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                Calculer
              </button>
            </div>
            {erreurs.mensualite && <span style={{ color: '#dc2626', fontSize: '12px' }}>{erreurs.mensualite}</span>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Date de début</label>
            <input
              type="date"
              value={donnees.dateDebut}
              onChange={(e) => majChamp('dateDebut', e.target.value)}
              style={{ ...inputStyle, borderColor: erreurs.dateDebut ? '#dc2626' : 'var(--input-border)' }}
            />
            {erreurs.dateDebut && <span style={{ color: '#dc2626', fontSize: '12px' }}>{erreurs.dateDebut}</span>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={handleClose}
              style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid var(--input-border)', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
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