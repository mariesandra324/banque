import { useEffect, useState } from 'react';
import {
  ScrollText,
  Search,
  Filter,
  Download,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { auditService } from '../../service/auditService';

// ============ Couleurs (mêmes variables de thème que Rapports.jsx / Dashboard.jsx) ============
const c = {
  bg: 'var(--bg-primary)',
  panel: 'var(--card-bg)',
  panelBorder: 'var(--border-color)',
  text: 'var(--text-primary)',
  textDim: 'var(--text-secondary)',
  textFaint: 'var(--muted)',
  inputBorder: 'var(--input-border)',
  tableHeader: 'var(--table-header)',
  accentGreen: '#10b981',
  accentGold: '#f59e0b',
  accentBlue: '#3b82f6',
  accentRed: '#ef4444',
  accentPurple: '#8b5cf6',
  // Bleu interactif : celui des boutons et de la pagination dans le reste de l'application
  action: '#2563eb',
};

const TAILLES_PAGE = [10, 25, 50, 100];

// Couleur et libellé par action, alignés sur l'enum AuditAction du backend
const STYLES_ACTION = {
  CREATION: { bg: '#dcfce7', fg: '#15803d' },
  MODIFICATION: { bg: '#dbeafe', fg: '#1e40af' },
  SUPPRESSION: { bg: '#fee2e2', fg: '#b91c1c' },
  DEPOT: { bg: '#dcfce7', fg: '#15803d' },
  RETRAIT: { bg: '#fef3c7', fg: '#92400e' },
  VIREMENT: { bg: '#ede9fe', fg: '#6d28d9' },
  VALIDATION: { bg: '#dcfce7', fg: '#15803d' },
  REFUS: { bg: '#fee2e2', fg: '#b91c1c' },
  DESACTIVATION: { bg: '#fee2e2', fg: '#b91c1c' },
  MODIFICATION_STATUT: { bg: '#dbeafe', fg: '#1e40af' },
};

const MODULES_CONNUS = [
  { value: 'CLIENTS', libelle: 'Clients' },
  { value: 'COMPTES', libelle: 'Comptes' },
  { value: 'TRANSACTIONS', libelle: 'Transactions' },
  { value: 'CREDITS', libelle: 'Crédits' },
  { value: 'CARTES', libelle: 'Cartes' },
  { value: 'UTILISATEURS', libelle: 'Utilisateurs' },
  { value: 'SYSTEME', libelle: 'Système' },
];

const ACTIONS_CONNUES = [
  { value: 'CREATION', libelle: 'Création' },
  { value: 'MODIFICATION', libelle: 'Modification' },
  { value: 'SUPPRESSION', libelle: 'Suppression' },
  { value: 'DEPOT', libelle: 'Dépôt' },
  { value: 'RETRAIT', libelle: 'Retrait' },
  { value: 'VIREMENT', libelle: 'Virement' },
  { value: 'VALIDATION', libelle: 'Validation' },
  { value: 'REFUS', libelle: 'Refus' },
  { value: 'DESACTIVATION', libelle: 'Désactivation' },
];

const libelleDe = (liste, valeur, defaut) =>
  liste.find((item) => item.value === valeur)?.libelle ?? defaut ?? valeur;

const formatDateHeure = (valeur) => {
  if (!valeur) return '—';
  const d = new Date(valeur);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const inputStyle = {
  padding: '8px 10px',
  borderRadius: '6px',
  border: `1px solid ${c.inputBorder}`,
  fontSize: '13px',
  backgroundColor: c.panel,
  color: c.text,
  height: '34px',
};

const libelleSelectStyle = {
  ...inputStyle,
  minWidth: '150px',
  cursor: 'pointer',
};

function AuditPanel() {
  const [filtres, setFiltres] = useState({
    depuis: '',
    jusqua: '',
    utilisateurId: '',
    role: '',
    module: '',
    action: '',
    recherche: '',
  });
  const [page, setPage] = useState(0);
  const [taille, setTaille] = useState(25);

  const [donnees, setDonnees] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [options, setOptions] = useState({ roles: [], modules: [], actions: [], utilisateurs: [], totalEntrees: 0 });
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  // Valeurs disponibles pour les listes déroulantes, chargées une seule fois
  useEffect(() => {
    let annule = false;
    auditService
      .getAuditFiltres()
      .then((reponse) => {
        if (!annule && reponse) {
          setOptions({
            roles: reponse.roles ?? [],
            modules: reponse.modules ?? [],
            actions: reponse.actions ?? [],
            utilisateurs: reponse.utilisateurs ?? [],
            totalEntrees: reponse.totalEntrees ?? 0,
          });
        }
      })
      .catch(() => {
        /* les listes restent vides : les filtres restent utilisables manuellement */
      });
    return () => {
      annule = true;
    };
  }, []);

  // Le flag `annule` empêche une réponse lente d'écraser une réponse plus récente
  // lorsque l'utilisateur change de filtre rapidement.
  useEffect(() => {
    let annule = false;

    auditService
      .getAuditLogs({ ...filtres, page, taille })
      .then((reponse) => {
        if (annule) return;
        setDonnees(reponse?.contenu ?? []);
        setTotalElements(reponse?.totalElements ?? 0);
        setTotalPages(reponse?.totalPages ?? 0);
        setErreur(null);
      })
      .catch((e) => {
        if (annule) return;
        const statut = e?.response?.status;
        setErreur(
          statut === 403
            ? "Vous n'avez pas les droits pour consulter le journal d'audit."
            : e?.response?.data?.message ||
              e?.message ||
              'Impossible de charger le journal d\'audit.',
        );
        setDonnees([]);
        setTotalElements(0);
        setTotalPages(0);
      })
      .finally(() => {
        if (!annule) setChargement(false);
      });

    return () => {
      annule = true;
    };
  }, [filtres, page, taille]);

  /**
   * Toute action modifiant les filtres ou la pagination passe par ici :
   * l'indicateur de chargement est basculé avant que l'effet ne recharge,
   * ce qui évite deux rendus successifs.
   */
  const appliquer = (changement) => {
    setChargement(true);
    changement();
  };

  const majFiltre = (cle, valeur) => {
    appliquer(() => {
      setFiltres((precedent) => ({ ...precedent, [cle]: valeur }));
      setPage(0); // tout changement de filtre ramène à la première page
    });
  };

  const reinitialiser = () => {
    appliquer(() => {
      setFiltres({
        depuis: '',
        jusqua: '',
        utilisateurId: '',
        role: '',
        module: '',
        action: '',
        recherche: '',
      });
      setPage(0);
    });
  };

  const filtresActifs =
    filtres.depuis || filtres.jusqua || filtres.utilisateurId || filtres.role ||
    filtres.module || filtres.action || filtres.recherche;

  const modulesAffiches = options.modules.length ? options.modules : MODULES_CONNUS.map((m) => m.value);
  const actionsAffichees = options.actions.length ? options.actions : ACTIONS_CONNUES.map((a) => a.value);

  const premiereLigne = totalElements === 0 ? 0 : page * taille + 1;
  const derniereLigne = Math.min((page + 1) * taille, totalElements);

  return (
    <div>
      {/* ---------- Barre de filtres ---------- */}
      <div
        style={{
          backgroundColor: c.panel,
          border: `1px solid ${c.panelBorder}`,
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '14px',
          }}
        >
          <Filter size={16} color={c.accentBlue} />
          <span style={{ fontSize: '14px', fontWeight: '600', color: c.text }}>Filtres du journal</span>
          {filtresActifs && (
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '600',
                backgroundColor: '#dbeafe',
                color: '#1e40af',
              }}
            >
              {filtresActifs} filtre(s) actif(s)
            </span>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          {/* Recherche */}
          <div style={{ position: 'relative', minWidth: '220px', flex: '1 1 220px', maxWidth: '320px' }}>
            <Search
              size={16}
              color={c.textFaint}
              style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              value={filtres.recherche}
              onChange={(e) => majFiltre('recherche', e.target.value)}
              placeholder="Utilisateur, élément, description…"
              style={{ ...inputStyle, width: '100%', paddingLeft: '32px' }}
            />
          </div>

          {/* Période */}
          <input
            type="date"
            value={filtres.depuis}
            onChange={(e) => majFiltre('depuis', e.target.value)}
            title="Période : à partir du"
            style={inputStyle}
          />
          <span style={{ fontSize: '12px', color: c.textDim }}>au</span>
          <input
            type="date"
            value={filtres.jusqua}
            onChange={(e) => majFiltre('jusqua', e.target.value)}
            title="Période : jusqu'au"
            style={inputStyle}
          />

          {/* Utilisateur */}
          <select
            value={filtres.utilisateurId}
            onChange={(e) => majFiltre('utilisateurId', e.target.value)}
            style={{ ...libelleSelectStyle, minWidth: '180px' }}
          >
            <option value="">Tous les utilisateurs</option>
            {options.utilisateurs.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nom} ({u.email})
              </option>
            ))}
          </select>

          {/* Rôle */}
          <select
            value={filtres.role}
            onChange={(e) => majFiltre('role', e.target.value)}
            style={libelleSelectStyle}
          >
            <option value="">Tous les rôles</option>
            {options.roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {/* Module */}
          <select
            value={filtres.module}
            onChange={(e) => majFiltre('module', e.target.value)}
            style={libelleSelectStyle}
          >
            <option value="">Tous les modules</option>
            {modulesAffiches.map((m) => (
              <option key={m} value={m}>
                {libelleDe(MODULES_CONNUS, m)}
              </option>
            ))}
          </select>

          {/* Action */}
          <select
            value={filtres.action}
            onChange={(e) => majFiltre('action', e.target.value)}
            style={libelleSelectStyle}
          >
            <option value="">Toutes les actions</option>
            {actionsAffichees.map((a) => (
              <option key={a} value={a}>
                {libelleDe(ACTIONS_CONNUES, a)}
              </option>
            ))}
          </select>

          <button
            onClick={reinitialiser}
            disabled={!filtresActifs}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '6px',
              border: `1px solid ${c.inputBorder}`,
              backgroundColor: filtresActifs ? c.panel : 'transparent',
              color: filtresActifs ? c.text : c.textFaint,
              cursor: filtresActifs ? 'pointer' : 'not-allowed',
              fontSize: '13px',
              fontWeight: '600',
              height: '34px',
            }}
          >
            <RotateCcw size={14} />
            Réinitialiser
          </button>

          <button
            onClick={() => auditService.exportCsv(filtres).catch(() => {})}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: c.action,
              color: 'white',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              height: '34px',
            }}
          >
            <Download size={14} />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* ---------- Tableau du journal ---------- */}
      <div
        style={{
          backgroundColor: c.panel,
          border: `1px solid ${c.panelBorder}`,
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '16px',
            borderBottom: `1px solid ${c.panelBorder}`,
          }}
        >
          <ScrollText size={18} color={c.accentBlue} />
          <span style={{ fontSize: '14px', fontWeight: '600', color: c.text }}>
            Journal d&apos;audit
          </span>
          <span style={{ fontSize: '12px', color: c.textFaint, marginLeft: 'auto' }}>
            {totalElements} entrée(s) au total
          </span>
        </div>

        {erreur ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '32px',
              color: '#b91c1c',
              fontSize: '14px',
            }}
          >
            <ShieldAlert size={18} />
            {erreur}
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: c.tableHeader, borderBottom: `1px solid ${c.panelBorder}` }}>
                    {['Date', 'Utilisateur', 'Rôle', 'Action', 'Module', 'Élément concerné'].map((entete) => (
                      <th
                        key={entete}
                        style={{
                          padding: '12px 16px',
                          color: c.textDim,
                          fontSize: '13px',
                          fontWeight: '600',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {entete}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chargement ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={{ padding: '32px', textAlign: 'center', color: c.textFaint, fontSize: '14px' }}
                      >
                        Chargement du journal...
                      </td>
                    </tr>
                  ) : donnees.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={{ padding: '32px', textAlign: 'center', color: c.textFaint, fontSize: '14px' }}
                      >
                        Aucune entrée d'audit ne correspond aux filtres sélectionnés.
                      </td>
                    </tr>
                  ) : (
                    donnees.map((ligne) => {
                      const styleAction = STYLES_ACTION[ligne.action] ?? { bg: '#e5e7eb', fg: '#374151' };
                      return (
                        <tr
                          key={ligne.id}
                          style={{ borderBottom: `1px solid ${c.panelBorder}` }}
                        >
                          <td
                            style={{
                              padding: '12px 16px',
                              color: c.text,
                              fontSize: '13px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {formatDateHeure(ligne.dateAction)}
                          </td>

                          <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                            <div style={{ color: c.text, fontWeight: '600' }}>
                              {ligne.utilisateurNom || 'Système'}
                            </div>
                            {ligne.utilisateurEmail && (
                              <div style={{ color: c.textFaint, fontSize: '11px' }}>{ligne.utilisateurEmail}</div>
                            )}
                          </td>

                          <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                            <span
                              style={{
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '11px',
                                fontWeight: '600',
                                backgroundColor: '#e5e7eb',
                                color: '#374151',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {ligne.role || '—'}
                            </span>
                          </td>

                          <td style={{ padding: '12px 16px' }}>
                            <span
                              style={{
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '600',
                                backgroundColor: styleAction.bg,
                                color: styleAction.fg,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {ligne.actionLibelle || ligne.action}
                            </span>
                          </td>

                          <td style={{ padding: '12px 16px', fontSize: '13px', color: c.text, whiteSpace: 'nowrap' }}>
                            {ligne.moduleLibelle || ligne.module || '—'}
                          </td>

                          <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                            <div style={{ color: c.text, fontWeight: '600' }}>{ligne.entiteId || '—'}</div>
                            {ligne.description && (
                              <div style={{ color: c.textDim, fontSize: '12px', marginTop: '2px' }}>
                                {ligne.description}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* ---------- Pagination ---------- */}
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
                    const nouvelleTaille = Number(e.target.value);
                    appliquer(() => {
                      setTaille(nouvelleTaille);
                      setPage(0);
                    });
                  }}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: `1px solid ${c.inputBorder}`,
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

                <button
                  onClick={() => appliquer(() => setPage((p) => Math.max(0, p - 1)))}
                  disabled={page === 0}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    border: `1px solid ${c.inputBorder}`,
                    backgroundColor: c.panel,
                    color: page === 0 ? c.textFaint : c.text,
                    cursor: page === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                  }}
                >
                  Précédent
                </button>

                <span style={{ fontSize: '13px', color: c.textDim, padding: '0 4px' }}>
                  Page {totalPages === 0 ? 0 : page + 1} / {totalPages}
                </span>

                <button
                  onClick={() => appliquer(() => setPage((p) => Math.min(Math.max(totalPages - 1, 0), p + 1)))}
                  disabled={totalPages === 0 || page >= totalPages - 1}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    border: `1px solid ${c.inputBorder}`,
                    backgroundColor: c.panel,
                    color: totalPages === 0 || page >= totalPages - 1 ? c.textFaint : c.text,
                    cursor: totalPages === 0 || page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                  }}
                >
                  Suivant
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AuditPanel;
