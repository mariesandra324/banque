import { useMemo, useState } from 'react';
import { MoreVertical, Search } from 'lucide-react';

const PAR_PAGE_OPTIONS = [10, 25, 50];

const GESTIONS_PAR_STATUT = {
  EN_ATTENTE: [
    { label: 'Accepter', valeur: 'ACTIVE', couleur: '#16a34a' },
    { label: 'Refuser', valeur: 'REFUSEE', couleur: '#dc2626' },
    { label: 'Bloquer', valeur: 'BLOQUEE', couleur: 'var(--text-secondary)' },
  ],
  ACTIVE: [{ label: 'Bloquer', valeur: 'BLOQUEE', couleur: 'var(--text-secondary)' }],
  REFUSEE: [
    { label: 'Accepter', valeur: 'ACTIVE', couleur: '#16a34a' },
    { label: 'Bloquer', valeur: 'BLOQUEE', couleur: 'var(--text-secondary)' },
  ],
  BLOQUEE: [
    { label: 'Accepter', valeur: 'ACTIVE', couleur: '#16a34a' },
    { label: 'Refuser', valeur: 'REFUSEE', couleur: '#dc2626' },
  ],
};

const STYLE_STATUT = {
  ACTIVE: { bg: '#dcfce7', color: '#166534' },
  EN_ATTENTE: { bg: '#fef3c7', color: '#92400e' },
  REFUSEE: { bg: '#fee2e2', color: '#991b1b' },
  BLOQUEE: { bg: '#fee2e2', color: '#991b1b' },
};

const LIBELLE_STATUT = {
  ACTIVE: 'Actif',
  EN_ATTENTE: 'En attente',
  REFUSEE: 'Refusé',
  BLOQUEE: 'Bloqué',
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateString;
  }
};

function ClientMobileTable({ accesMobiles, isAdmin, onUpdateStatut }) {
  const [recherche, setRecherche] = useState('');
  const [page, setPage] = useState(1);
  const [parPage, setParPage] = useState(10);
  const [menuOuvertId, setMenuOuvertId] = useState(null);

  const fermerMenu = () => setMenuOuvertId(null);

  const filtres = useMemo(() => {
    const liste = Array.isArray(accesMobiles) ? accesMobiles : [];
    const q = recherche.trim().toLowerCase();

    const resultats = !q
      ? liste
      : liste.filter((m) => {
          const texte = `${m.clientNom || ''} ${m.clientPrenom || ''} ${m.clientCin || ''} ${m.identifiant || ''} ${m.clientEmail || ''}`.toLowerCase();
          return texte.includes(q);
        });

    return [...resultats].sort((a, b) => b.id - a.id);
  }, [accesMobiles, recherche]);

  const totalPages = Math.max(1, Math.ceil(filtres.length / parPage));
  const pageActuelle = Math.min(page, totalPages);
  const pageItems = filtres.slice((pageActuelle - 1) * parPage, pageActuelle * parPage);

  const handleStatutChange = (acces, nouveauStatut) => {
    if (nouveauStatut && nouveauStatut !== acces.statut) {
      onUpdateStatut(acces, nouveauStatut);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Rechercher par client, CIN, identifiant..."
            value={recherche}
            onChange={(e) => { setRecherche(e.target.value); setPage(1); }}
            style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: '6px', border: '1px solid var(--input-border)', fontSize: '13px', boxSizing: 'border-box', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--table-header)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Client</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>CIN</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Identifiant</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Statut</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Date inscription</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Date validation</th>
              {isAdmin && <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Action</th>}
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
                  Aucun accès mobile trouvé.
                </td>
              </tr>
            ) : (
              pageItems.map((m) => {
                const badge = STYLE_STATUT[m.statut] || { bg: 'var(--table-header)', color: 'var(--muted)' };
                return (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--faint)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '500', color: 'var(--text-primary)', fontSize: '14px' }}>
                      {m.clientNom} {m.clientPrenom}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'monospace' }}>{m.clientCin}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px' }}>{m.identifiant}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', backgroundColor: badge.bg, color: badge.color }}>
                        {LIBELLE_STATUT[m.statut] || m.statut}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px' }}>{formatDate(m.dateInscription)}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px' }}>{formatDate(m.dateValidation)}</td>
                    {isAdmin && (
                      <td style={{ padding: '12px 16px', position: 'relative', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => setMenuOuvertId(menuOuvertId === m.id ? null : m.id)}
                          title="Actions"
                          aria-label="Actions"
                          style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '32px', height: '32px', borderRadius: '6px', border: '1px solid var(--input-border)',
                            backgroundColor: 'var(--card-bg)', cursor: 'pointer',
                          }}
                        >
                          <MoreVertical size={18} color="var(--text-secondary)" />
                        </button>
                        {menuOuvertId === m.id && (
                          <>
                            <div onClick={fermerMenu} style={{ position: 'fixed', inset: 0, zIndex: 1 }} />
                            <div style={{ position: 'absolute', right: 16, top: 40, zIndex: 2, minWidth: '140px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
                              {GESTIONS_PAR_STATUT[m.statut]?.map((action) => (
                                <button
                                  key={action.valeur}
                                  onClick={() => { fermerMenu(); handleStatutChange(m, action.valeur); }}
                                  style={{
                                    display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px',
                                    border: 'none', background: 'transparent', cursor: 'pointer',
                                    color: action.couleur, fontSize: '13px', fontWeight: '600',
                                  }}
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '10px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {filtres.length === 0
            ? 'Aucun résultat'
            : `Affichage de ${(pageActuelle - 1) * parPage + 1} à ${Math.min(pageActuelle * parPage, filtres.length)} sur ${filtres.length} résultats`}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Par page</span>
            <select
              value={parPage}
              onChange={(e) => { setParPage(Number(e.target.value)); setPage(1); }}
              style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--input-border)', fontSize: '13px', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)' }}
            >
              {PAR_PAGE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                style={{
                  minWidth: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--input-border)',
                  backgroundColor: n === pageActuelle ? '#2563eb' : 'var(--card-bg)',
                  color: n === pageActuelle ? 'white' : 'var(--text-primary)',
                  cursor: 'pointer', fontSize: '13px',
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientMobileTable;