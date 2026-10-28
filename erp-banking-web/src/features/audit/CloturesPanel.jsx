import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, RefreshCw, Search, ShieldCheck, X, XCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { getClotures, rejeterCloture, validerCloture } from '../../service/caisseService';

const c = {
  panel: 'var(--card-bg)',
  panelBorder: 'var(--border-color)',
  text: 'var(--text-primary)',
  textDim: 'var(--text-secondary)',
  tableHeader: 'var(--table-header)',
  accentGreen: '#10b981',
  accentGold: '#f59e0b',
  accentRed: '#ef4444',
  accentBlue: '#3b82f6',
  action: '#2563eb',
};

const TAILLES_PAGE = [10, 25, 100];

const STATUTS = {
  EN_ATTENTE: { label: 'En attente', bg: '#fef3c7', fg: '#92400e', icon: Clock },
  VALIDEE: { label: 'Validée', bg: '#dcfce7', fg: '#15803d', icon: CheckCircle2 },
  REJETEE: { label: 'Rejetée', bg: '#fee2e2', fg: '#b91c1c', icon: XCircle },
};

const formatMontant = (montant) => {
  if (montant == null) return '-';
  return new Intl.NumberFormat('fr-FR').format(Math.round(Number(montant) || 0)) + ' Ar';
};

const formatDateHeure = (valeur) => {
  if (!valeur) return '-';
  const d = new Date(valeur);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const dateSeule = (valeur) => {
  if (!valeur) return '';
  const d = new Date(valeur);
  if (Number.isNaN(d.getTime())) return '';
  const annee = d.getFullYear();
  const mois = String(d.getMonth() + 1).padStart(2, '0');
  const jour = String(d.getDate()).padStart(2, '0');
  return `${annee}-${mois}-${jour}`;
};

const inputStyle = {
  padding: '7px 10px',
  borderRadius: '6px',
  border: `1px solid ${c.panelBorder}`,
  fontSize: '13px',
  backgroundColor: c.panel,
  color: c.text,
  height: '34px',
};

const thStyle = {
  padding: '10px 12px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: c.textDim,
  backgroundColor: c.tableHeader,
  whiteSpace: 'nowrap',
};

const tdStyle = {
  padding: '10px 12px',
  fontSize: '13px',
  color: c.text,
  borderTop: `1px solid ${c.panelBorder}`,
  whiteSpace: 'nowrap',
};

function CloturesPanel({ onClose }) {
  const [lignes, setLignes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [operationEnCours, setOperationEnCours] = useState(null);
  const [dateFiltre, setDateFiltre] = useState('');
  const [rechercheGuichet, setRechercheGuichet] = useState('');
  const [page, setPage] = useState(0);
  const [taille, setTaille] = useState(10);

  const charger = async () => {
    try {
      setChargement(true);
      const res = await getClotures();
      setLignes(res.data || []);
      setErreur(null);
    } catch (e) {
      const statut = e?.response?.status;
      setErreur(
        statut === 403
          ? "Vous n'avez pas les droits pour consulter les clôtures."
          : e?.response?.data?.message || 'Impossible de charger les clôtures de caisse.',
      );
      setLignes([]);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    charger();
  }, []);

  const valider = async (sessionId) => {
    try {
      setOperationEnCours({ id: sessionId, type: 'valider' });
      const res = await validerCloture(sessionId);
      setLignes((precedentes) =>
        precedentes.map((ligne) => (ligne.sessionId === sessionId ? res.data : ligne)),
      );
      setErreur(null);
    } catch (e) {
      setErreur(e?.response?.data?.message || 'Impossible de valider cette clôture.');
    } finally {
      setOperationEnCours(null);
    }
  };

  const rejeter = async (ligne) => {
    const { value, isConfirmed } = await Swal.fire({
      title: 'Rejeter la clôture ?',
      text: `Guichet ${ligne.codeGuichet || '-'}`,
      input: 'textarea',
      inputLabel: 'Justification du rejet',
      inputPlaceholder: 'Saisissez le motif du rejet...',
      inputAttributes: { 'aria-label': 'Justification du rejet' },
      inputValidator: (valeur) =>
        !valeur || !valeur.trim() ? 'La justification est obligatoire.' : undefined,
      showCancelButton: true,
      confirmButtonText: 'Rejeter',
      cancelButtonText: 'Annuler',
      confirmButtonColor: c.accentRed,
      cancelButtonColor: '#6b7280',
    });

    if (!isConfirmed) return;

    try {
      setOperationEnCours({ id: ligne.sessionId, type: 'rejeter' });
      const res = await rejeterCloture(ligne.sessionId, String(value).trim());
      setLignes((precedentes) =>
        precedentes.map((item) => (item.sessionId === ligne.sessionId ? res.data : item)),
      );
      setErreur(null);
    } catch (e) {
      setErreur(e?.response?.data?.message || 'Impossible de rejeter cette clôture.');
    } finally {
      setOperationEnCours(null);
    }
  };

  const termeGuichet = rechercheGuichet.trim().toLowerCase();
  const lignesFiltrees = lignes.filter((ligne) => {
    const correspondAuJour = !dateFiltre || dateSeule(ligne.dateFermeture) === dateFiltre;
    const texteGuichet = `${ligne.codeGuichet ?? ''} ${ligne.guichetId ?? ''}`.toLowerCase();
    const correspondAuGuichet = !termeGuichet || texteGuichet.includes(termeGuichet);
    return correspondAuJour && correspondAuGuichet;
  });

  const totalElements = lignesFiltrees.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / taille));
  const pageCourante = Math.min(page, totalPages - 1);
  const premiereLigne = totalElements === 0 ? 0 : pageCourante * taille + 1;
  const derniereLigne = Math.min((pageCourante + 1) * taille, totalElements);
  const lignesPage = lignesFiltrees.slice(
    pageCourante * taille,
    (pageCourante + 1) * taille,
  );

  const enAttente = lignesFiltrees.filter(
    (ligne) => (ligne.statutValidation || 'EN_ATTENTE') === 'EN_ATTENTE',
  ).length;

  return (
    <div
      style={{
        backgroundColor: c.panel,
        border: `1px solid ${c.panelBorder}`,
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '16px',
          borderBottom: `1px solid ${c.panelBorder}`,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color={c.accentGreen} />
          <span style={{ fontSize: '14px', fontWeight: '700', color: c.text }}>
            Validation des clôtures
          </span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '700',
              backgroundColor: enAttente > 0 ? '#fef3c7' : '#dcfce7',
              color: enAttente > 0 ? '#92400e' : '#15803d',
            }}
          >
            {enAttente > 0 ? `${enAttente} en attente` : 'Tout est traité'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={charger}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 11px',
              borderRadius: '6px',
              border: `1px solid ${c.panelBorder}`,
              backgroundColor: c.panel,
              color: c.text,
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
            }}
          >
            <RefreshCw size={14} />
            Actualiser
          </button>
          {onClose && (
            <button
              onClick={onClose}
              title="Fermer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                border: `1px solid ${c.panelBorder}`,
                backgroundColor: c.panel,
                color: c.textDim,
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          borderBottom: `1px solid ${c.panelBorder}`,
        }}
      >
        <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 240px', maxWidth: '340px' }}>
          <Search
            size={16}
            color={c.textDim}
            style={{
              position: 'absolute',
              top: '50%',
              left: '10px',
              transform: 'translateY(-50%)',
            }}
          />
          <input
            type="text"
            value={rechercheGuichet}
            onChange={(e) => {
              setRechercheGuichet(e.target.value);
              setPage(0);
            }}
            placeholder="Rechercher un numéro de guichet..."
            style={{ ...inputStyle, width: '100%', paddingLeft: '32px' }}
          />
        </div>

        <span style={{ fontSize: '13px', color: c.textDim }}>Jour</span>
        <input
          type="date"
          value={dateFiltre}
          onChange={(e) => {
            setDateFiltre(e.target.value);
            setPage(0);
          }}
          title="Filtrer les clôtures par jour"
          style={inputStyle}
        />

        {(dateFiltre || rechercheGuichet) && (
          <button
            onClick={() => {
              setDateFiltre('');
              setRechercheGuichet('');
              setPage(0);
            }}
            style={{
              padding: '7px 11px',
              borderRadius: '6px',
              border: `1px solid ${c.panelBorder}`,
              backgroundColor: c.panel,
              color: c.text,
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              height: '34px',
            }}
          >
            Réinitialiser
          </button>
        )}

        <span style={{ marginLeft: 'auto', fontSize: '13px', color: c.textDim }}>
          {totalElements} clôture(s)
        </span>
      </div>

      {erreur && (
        <div
          style={{
            margin: '12px 16px 0',
            padding: '10px 12px',
            borderRadius: '6px',
            backgroundColor: '#fef2f2',
            color: '#991b1b',
            fontSize: '13px',
          }}
        >
          {erreur}
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Guichet</th>
              <th style={thStyle}>Heure de fermeture</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Solde théorique</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Montant physique saisi</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Écart de caisse</th>
              <th style={thStyle}>Justification</th>
              <th style={thStyle}>Statut</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {chargement && (
              <tr>
                <td colSpan={8} style={{ ...tdStyle, textAlign: 'center', padding: '24px' }}>
                  Chargement des clôtures...
                </td>
              </tr>
            )}

            {!chargement && totalElements === 0 && (
              <tr>
                <td colSpan={8} style={{ ...tdStyle, textAlign: 'center', padding: '24px', color: c.textDim }}>
                  {lignes.length === 0
                    ? 'Aucune clôture de caisse enregistrée.'
                    : 'Aucune clôture ne correspond aux filtres sélectionnés.'}
                </td>
              </tr>
            )}

            {!chargement &&
              lignesPage.map((ligne) => {
                const statut = STATUTS[ligne.statutValidation] || STATUTS.EN_ATTENTE;
                const StatutIcon = statut.icon;
                const ecart = Number(ligne.ecart) || 0;
                const ecartCouleur =
                  ecart === 0 ? c.accentGreen : ecart < 0 ? c.accentRed : c.accentGold;
                const enTraitement = operationEnCours?.id === ligne.sessionId;
                const enAttenteLigne =
                  (ligne.statutValidation || 'EN_ATTENTE') === 'EN_ATTENTE';

                return (
                  <tr key={ligne.sessionId}>
                    <td style={{ ...tdStyle, fontWeight: '600' }}>{ligne.codeGuichet || '-'}</td>
                    <td style={tdStyle}>{formatDateHeure(ligne.dateFermeture)}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '600' }}>
                      {formatMontant(ligne.soldeTheorique)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '600' }}>
                      {formatMontant(ligne.soldeFermeture)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '700', color: ecartCouleur }}>
                      {formatMontant(ligne.ecart)}
                    </td>
                    <td style={{ ...tdStyle, whiteSpace: 'normal', maxWidth: '220px', lineHeight: 1.4 }}>
                      {ligne.observation || '-'}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 8px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '700',
                            backgroundColor: statut.bg,
                            color: statut.fg,
                            width: 'fit-content',
                          }}
                        >
                          <StatutIcon size={12} />
                          {statut.label}
                        </span>
                        {ligne.statutValidation !== 'EN_ATTENTE' && (
                          <span style={{ fontSize: '11px', color: c.textDim }}>
                            {ligne.valideParNom || '-'} · {formatDateHeure(ligne.dateValidation)}
                          </span>
                        )}
                        {ligne.statutValidation === 'REJETEE' && ligne.motifRejet && (
                          <span style={{ fontSize: '11px', color: c.accentRed, whiteSpace: 'normal', maxWidth: '200px' }}>
                            {ligne.motifRejet}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      {enAttenteLigne && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => valider(ligne.sessionId)}
                            disabled={enTraitement}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: c.action,
                              color: 'white',
                              cursor: enTraitement ? 'wait' : 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              opacity: enTraitement ? 0.7 : 1,
                            }}
                          >
                            <ShieldCheck size={13} />
                            {enTraitement && operationEnCours?.type === 'valider'
                              ? 'Validation...'
                              : 'Valider'}
                          </button>
                          <button
                            onClick={() => rejeter(ligne)}
                            disabled={enTraitement}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: `1px solid ${c.accentRed}`,
                              backgroundColor: 'transparent',
                              color: c.accentRed,
                              cursor: enTraitement ? 'wait' : 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              opacity: enTraitement ? 0.7 : 1,
                            }}
                          >
                            <XCircle size={13} />
                            {enTraitement && operationEnCours?.type === 'rejeter'
                              ? 'Rejet...'
                              : 'Rejeter'}
                          </button>
                        </div>
                      )}
                      {!enAttenteLigne && (
                        <span style={{ fontSize: '12px', color: c.textDim }}>Traitée</span>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 16px',
          borderTop: `1px solid ${c.panelBorder}`,
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <span style={{ fontSize: '13px', color: c.textDim }}>
          {totalElements === 0
            ? 'Aucun résultat'
            : `Affichage de ${premiereLigne} à ${derniereLigne} sur ${totalElements} résultats`}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', color: c.textDim }}>Par page</span>
          <select
            value={taille}
            onChange={(e) => {
              setTaille(Number(e.target.value));
              setPage(0);
            }}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: `1px solid ${c.panelBorder}`,
              fontSize: '13px',
              backgroundColor: c.panel,
              color: c.text,
              cursor: 'pointer',
            }}
          >
            {TAILLES_PAGE.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <span style={{ fontSize: '13px', color: c.textDim }}>
            Page {pageCourante + 1} sur {totalPages}
          </span>

          <button
            onClick={() => setPage(Math.max(0, pageCourante - 1))}
            disabled={pageCourante === 0}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              border: '1px solid #1e3a8a',
              backgroundColor: pageCourante === 0 ? 'rgba(30, 58, 138, 0.45)' : '#1e3a8a',
              color: pageCourante === 0 ? 'rgba(255, 255, 255, 0.7)' : '#ffffff',
              cursor: pageCourante === 0 ? 'not-allowed' : 'pointer',
              fontSize: '13px',
            }}
          >
            Précédent
          </button>

          <button
            onClick={() => setPage(Math.min(totalPages - 1, pageCourante + 1))}
            disabled={pageCourante >= totalPages - 1}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              border: '1px solid #1e3a8a',
              backgroundColor:
                pageCourante >= totalPages - 1 ? 'rgba(30, 58, 138, 0.45)' : '#1e3a8a',
              color:
                pageCourante >= totalPages - 1 ? 'rgba(255, 255, 255, 0.7)' : '#ffffff',
              cursor: pageCourante >= totalPages - 1 ? 'not-allowed' : 'pointer',
              fontSize: '13px',
            }}
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
}

export default CloturesPanel;
