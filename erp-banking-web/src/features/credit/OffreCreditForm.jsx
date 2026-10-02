import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import demandeCreditService from '../../service/demandeCreditService';
import offreCreditService from '../../service/offreCreditService';
import '../../styles/offres-credit.css';

function OffreCreditForm({ onClose, onSubmit, demandeCreditId }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [demandes, setDemandes] = useState([]);
  const [chargementDemandes, setChargementDemandes] = useState(true);
  const [erreurChargement, setErreurChargement] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const [donnees, setDonnees] = useState({
    demandeCreditId: demandeCreditId || '',
    montantPropose: '',
    tauxInteret: '',
    duree: '',
    mensualite: '',
    dateExpiration: '',
    conditions: '',
  });

  const [erreurs, setErreurs] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idDepuisUrl = params.get('demandeCreditId');

    if (demandeCreditId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDonnees((d) => ({...d,demandeCreditId: demandeCreditId,}));
    } else if (idDepuisUrl) {
      setDonnees((d) => ({
        ...d,
        demandeCreditId: idDepuisUrl,
      }));
    }
  }, [demandeCreditId, location.search]);

  useEffect(() => {
    const chargerDemandes = async () => {
      setChargementDemandes(true);
      setErreurChargement('');

      try {
        const data = await demandeCreditService.getByStatut('ACCEPTER');
        setDemandes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(
          'Erreur chargement demandes :',
          err.response?.data || err.message
        );
        setDemandes([]);
        setErreurChargement(
          err.response?.status === 403
            ? "Vous n'avez pas les droits pour consulter les demandes de crédit."
            : err.response?.data?.message ||
              'Impossible de charger les demandes de crédit.'
        );
      } finally {
        setChargementDemandes(false);
      }
    };

    chargerDemandes();
  }, []);

  const majChamp = (champ, valeur) => {
    setDonnees((d) => ({
      ...d,
      [champ]: valeur,
    }));

    setErreurs((e) => ({
      ...e,
      [champ]: null,
      global: null,
    }));
  };

  const calculerMensualite = () => {
    const montant = Number(donnees.montantPropose);
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

    if (!donnees.demandeCreditId) {
      nouvellesErreurs.demandeCreditId =
        'Demande de crédit requise';
    }

    if (
      !donnees.montantPropose ||
      Number(donnees.montantPropose) <= 0
    ) {
      nouvellesErreurs.montantPropose =
        'Montant proposé invalide';
    }

    if (
      !donnees.tauxInteret ||
      Number(donnees.tauxInteret) <= 0
    ) {
      nouvellesErreurs.tauxInteret =
        'Taux d’intérêt invalide';
    }

    if (
      !donnees.duree ||
      Number(donnees.duree) <= 0
    ) {
      nouvellesErreurs.duree =
        'Durée invalide';
    }

    if (
      !donnees.mensualite ||
      Number(donnees.mensualite) <= 0
    ) {
      nouvellesErreurs.mensualite =
        'Mensualité invalide';
    }

    if (!donnees.dateExpiration) {
      nouvellesErreurs.dateExpiration =
        'Date d’expiration requise';
    }

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

    if (!valider()) {
      return;
    }

    setEnvoi(true);

    try {
      const payload = {
        demandeCreditId: Number(donnees.demandeCreditId),
        montantPropose: Number(donnees.montantPropose),
        tauxInteret: Number(donnees.tauxInteret),
        duree: Number(donnees.duree),
        mensualite: Number(donnees.mensualite),
        dateExpiration: donnees.dateExpiration,
        conditions: donnees.conditions,
      };

      console.log('PAYLOAD OFFRE :', payload);

      if (typeof onSubmit === 'function') {
        await onSubmit(payload);
      } else {
        await offreCreditService.creer(payload);
      }

      handleClose();
    } catch (err) {
      console.error(
        'Erreur création offre :',
        err.response?.data || err.message
      );

      setErreurs({
        global:
          err.response?.data?.message ||
          "Erreur lors de la création de l'offre.",
      });
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="credit-form-page">

      <button
        onClick={handleClose}
        className="credit-back-button"
      >
        <ArrowLeft size={16} />
        Retour
      </button>

      <h2 className="credit-form-title">
        Nouvelle offre de crédit
      </h2>

      <div className="credit-form-card">

        {erreurs.global && (
          <div className="credit-error-global">
            {erreurs.global}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* DEMANDE */}
          <div className="credit-form-group">

            <label className="credit-form-label">
              Demande de crédit
            </label>

            <select
              value={donnees.demandeCreditId}
              onChange={(e) =>
                majChamp(
                  'demandeCreditId',
                  e.target.value
                )
              }
              disabled={!!demandeCreditId || chargementDemandes}
              className={`credit-form-input ${
                erreurs.demandeCreditId
                  ? 'credit-input-error'
                  : ''
              }`}
            >
              <option value="">
                {chargementDemandes
                  ? 'Chargement des demandes...'
                  : 'Sélectionner une demande'}
              </option>

              {!chargementDemandes && demandes.length === 0 && (
                <option value="" disabled>
                  Aucune demande de crédit validée
                </option>
              )}

              {demandes.map((d) => (
                <option
                  key={d.id}
                  value={d.id}
                >
                  {d.reference ||
                    `Demande #${d.id}`}
                  {' - '}
                  {d.clientNom || ''}
                  {' '}
                  {d.clientPrenom || ''}
                  {' - '}
                  {Number(
                    d.montantDemande || 0
                  ).toLocaleString('fr-FR')}
                  {' Ar'}
                </option>
              ))}
            </select>

            {erreurChargement && (
              <span className="credit-field-error">
                {erreurChargement}
              </span>
            )}

            {erreurs.demandeCreditId && (
              <span className="credit-field-error">
                {erreurs.demandeCreditId}
              </span>
            )}

          </div>

          {/* MONTANT */}
          <div className="credit-form-group">

            <label className="credit-form-label">
              Montant proposé (Ar)
            </label>

            <input
              type="number"
              min="0"
              value={donnees.montantPropose}
              onChange={(e) =>
                majChamp(
                  'montantPropose',
                  e.target.value
                )
              }
              className={`credit-form-input ${
                erreurs.montantPropose
                  ? 'credit-input-error'
                  : ''
              }`}
            />

            {erreurs.montantPropose && (
              <span className="credit-field-error">
                {erreurs.montantPropose}
              </span>
            )}

          </div>

          {/* TAUX + DUREE */}
          <div className="credit-form-row">

            <div className="credit-form-group credit-form-half">

              <label className="credit-form-label">
                Taux d'intérêt (%)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={donnees.tauxInteret}
                onChange={(e) =>
                  majChamp(
                    'tauxInteret',
                    e.target.value
                  )
                }
                className={`credit-form-input ${
                  erreurs.tauxInteret
                    ? 'credit-input-error'
                    : ''
                }`}
              />

              {erreurs.tauxInteret && (
                <span className="credit-field-error">
                  {erreurs.tauxInteret}
                </span>
              )}

            </div>

            <div className="credit-form-group credit-form-half">

              <label className="credit-form-label">
                Durée (mois)
              </label>

              <input
                type="number"
                min="1"
                value={donnees.duree}
                onChange={(e) =>
                  majChamp(
                    'duree',
                    e.target.value
                  )
                }
                className={`credit-form-input ${
                  erreurs.duree
                    ? 'credit-input-error'
                    : ''
                }`}
              />

              {erreurs.duree && (
                <span className="credit-field-error">
                  {erreurs.duree}
                </span>
              )}

            </div>

          </div>

          {/* MENSUALITE */}
          <div className="credit-form-group">

            <label className="credit-form-label">
              Mensualité (Ar)
            </label>

            <div className="credit-monthly-row">

              <input
                type="number"
                min="0"
                step="0.01"
                value={donnees.mensualite}
                onChange={(e) =>
                  majChamp(
                    'mensualite',
                    e.target.value
                  )
                }
                className={`credit-form-input ${
                  erreurs.mensualite
                    ? 'credit-input-error'
                    : ''
                }`}
              />

              <button
                type="button"
                onClick={calculerMensualite}
                className="credit-calculate-button"
              >
                Calculer
              </button>

            </div>

            {erreurs.mensualite && (
              <span className="credit-field-error">
                {erreurs.mensualite}
              </span>
            )}

          </div>

          {/* DATE EXPIRATION */}
          <div className="credit-form-group">

            <label className="credit-form-label">
              Date d'expiration
            </label>

            <input
              type="date"
              value={donnees.dateExpiration}
              onChange={(e) =>
                majChamp(
                  'dateExpiration',
                  e.target.value
                )
              }
              className={`credit-form-input ${
                erreurs.dateExpiration
                  ? 'credit-input-error'
                  : ''
              }`}
            />

            {erreurs.dateExpiration && (
              <span className="credit-field-error">
                {erreurs.dateExpiration}
              </span>
            )}

          </div>

          {/* CONDITIONS */}
          <div className="credit-form-group">

            <label className="credit-form-label">
              Conditions
            </label>

            <textarea
              value={donnees.conditions}
              onChange={(e) =>
                majChamp(
                  'conditions',
                  e.target.value
                )
              }
              rows={4}
              placeholder="Ex : Remboursement mensuel pendant 36 mois..."
              className="credit-form-input credit-textarea"
            />

          </div>

          {/* BOUTONS */}
          <div className="credit-form-actions">

            <button
              type="button"
              onClick={handleClose}
              className="credit-button credit-button-cancel"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={envoi}
              className="credit-button credit-button-primary"
            >
              {envoi
                ? 'Envoi...'
                : "Créer l'offre"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default OffreCreditForm;