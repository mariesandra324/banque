import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import demandeCreditService from '../../service/demandeCreditService';
import offreCreditService from '../../service/offreCreditService';
import '../../styles/offres-credit.css';

const formatMontant = (montant) =>
  new Intl.NumberFormat('fr-FR').format(montant || 0) + ' Ar';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('fr-FR');
};

const calculerMensualite = (montant, taux, duree) => {
  const m = Number(montant);
  const t = Number(taux);
  const d = Number(duree);

  if (m > 0 && t > 0 && d > 0) {
    const tauxMensuel = t / 100 / 12;
    const valeur =
      (m * tauxMensuel * Math.pow(1 + tauxMensuel, d)) /
      (Math.pow(1 + tauxMensuel, d) - 1);
    return valeur.toFixed(2);
  }

  return '';
};

function OffreCreditForm({ onClose, onSubmit, demandeCreditId }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [demandes, setDemandes] = useState([]);
  const [chargementDemandes, setChargementDemandes] = useState(true);
  const [erreurChargement, setErreurChargement] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [demandeInfo, setDemandeInfo] = useState(null);
  const [chargementDemande, setChargementDemande] = useState(false);

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
        const [demandesData, offresData] = await Promise.all([
          demandeCreditService.getByStatut('ACCEPTER'),
          offreCreditService.getAll(),
        ]);
        const demandesAvecOffre = new Set(
          (Array.isArray(offresData) ? offresData : [])
            .map((offre) => String(offre.demandeCreditId))
        );
        setDemandes(
          (Array.isArray(demandesData) ? demandesData : [])
            .filter((demande) => !demandesAvecOffre.has(String(demande.id)))
        );
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

  useEffect(() => {
    const idDemande = donnees.demandeCreditId;
    let annule = false;

    const chargerDemande = async () => {
      if (!idDemande) {
        setDemandeInfo(null);
        return;
      }

      setChargementDemande(true);

      try {
        const data = await demandeCreditService.getById(idDemande);
        if (annule) return;

        setDemandeInfo(data);

        const montant = data.montantDemande != null ? String(data.montantDemande) : '';
        const taux = data.tauxInteret != null ? String(data.tauxInteret) : '';
        const duree = data.duree != null ? String(data.duree) : '';

        setDonnees((d) => ({
          ...d,
          montantPropose: montant,
          tauxInteret: taux,
          duree: duree,
          mensualite: calculerMensualite(montant, taux, duree),
        }));
      } catch (err) {
        console.error(
          'Erreur chargement demande :',
          err.response?.data || err.message
        );
        if (!annule) setDemandeInfo(null);
      } finally {
        if (!annule) setChargementDemande(false);
      }
    };

    chargerDemande();

    return () => {
      annule = true;
    };
  }, [donnees.demandeCreditId]);

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

  const calculerMensualiteChamp = () => {
    const valeur = calculerMensualite(
      donnees.montantPropose,
      donnees.tauxInteret,
      donnees.duree
    );

    if (valeur) {
      majChamp('mensualite', valeur);
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
    <div className="credit-form-page offre-form-page">

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

          <div className="offre-form-layout">

          <div className="offre-form-col offre-form-col-info">

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
                  Aucune demande validée sans offre existante
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

          {/* INFORMATIONS DE LA DEMANDE */}
          {chargementDemande && (
            <div className="demande-info-panel">
              Chargement des informations de la demande...
            </div>
          )}

          {demandeInfo && !chargementDemande && (
            <div className="demande-info-panel">

              <div className="demande-info-titre">
                Informations de la demande
                {demandeInfo.reference
                  ? ` ${demandeInfo.reference}`
                  : ` #${demandeInfo.id}`}
              </div>

              <div className="demande-info-grid">

                {[
                  ['Client', `${demandeInfo.clientNom || ''} ${demandeInfo.clientPrenom || ''}`.trim() || '-'],
                  ['Compte', demandeInfo.compteId ? `#${demandeInfo.compteId}` : '-'],
                  ['Montant demandé', formatMontant(demandeInfo.montantDemande)],
                  ['Durée', `${demandeInfo.duree ?? '-'} mois`],
                  ["Taux d'intérêt", demandeInfo.tauxInteret != null ? `${demandeInfo.tauxInteret} %` : '-'],
                  ['Motif', demandeInfo.motif || '-'],
                  ['Profession', demandeInfo.profession || '-'],
                  ['Type de contrat', demandeInfo.typeContrat || '-'],
                  ['Revenu mensuel', demandeInfo.revenuMensuel != null ? formatMontant(demandeInfo.revenuMensuel) : '-'],
                  ['Charges mensuelles', demandeInfo.chargesMensuelles != null ? formatMontant(demandeInfo.chargesMensuelles) : '-'],
                  ['Date de la demande', formatDate(demandeInfo.dateDemande)],
                  ['Date de décision', formatDate(demandeInfo.dateDecision)],
                  ['Statut', demandeInfo.statut || '-'],
                  ['Pièces jointes', `${Array.isArray(demandeInfo.piecesJointes) ? demandeInfo.piecesJointes.length : 0}`],
                ].map(([label, valeur]) => (
                  <div key={label} className="demande-info-item">
                    <span className="demande-info-label">{label}</span>
                    <span className="demande-info-valeur">{valeur}</span>
                  </div>
                ))}

              </div>

            </div>
          )}

          </div>

          <div className="offre-form-col offre-form-col-champs">

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
                onClick={calculerMensualiteChamp}
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

          </div>

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