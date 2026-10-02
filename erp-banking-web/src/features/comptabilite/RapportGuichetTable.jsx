import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { calculerTotauxRapport } from '../../service/rapportGuichetService';

const PAR_PAGE_OPTIONS = [10, 25, 50, 100];

const NON_RATTACHE = 'NON RATTACHE';

const formatMontant = (valeur) =>
  new Intl.NumberFormat('fr-FR').format(Math.round(valeur || 0)) + ' Ar';

const COLONNES = [
  { cle: 'totalDepots', libelle: 'Dépôts', couleur: '#16a34a' },
  { cle: 'totalRetraits', libelle: 'Retraits', couleur: '#dc2626' },
  { cle: 'totalVirements', libelle: 'Virements', couleur: '#2563eb' },
  { cle: 'totalRemboursements', libelle: 'Remboursements', couleur: '#7c3aed' },
];

const styleCellule = { padding: '12px 16px', fontSize: '13px', textAlign: 'right', whiteSpace: 'nowrap' };

const RapportGuichetTable = ({ lignes }) => {
  const [recherche, setRecherche] = useState('');
  const [page, setPage] = useState(1);
  const [parPage, setParPage] = useState(25);

  const lignesFiltrees = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return lignes || [];
    return (lignes || []).filter((l) => String(l.codeGuichet || '').toLowerCase().includes(q));
  }, [lignes, recherche]);

  const totaux = useMemo(() => calculerTotauxRapport(lignesFiltrees), [lignesFiltrees]);

  const totalPages = Math.max(1, Math.ceil(lignesFiltrees.length / parPage));
  const pageActuelle = Math.min(page, totalPages);
  const lignesPage = lignesFiltrees.slice((pageActuelle - 1) * parPage, pageActuelle * parPage);

  return (
    <div
      style={{
        backgroundColor: 'var(--card-bg)', borderRadius: '12px',
        border: '1px solid var(--border-color)', overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px',
          padding: '16px', borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div style={{ position: 'relative', width: '260px' }}>
          <Search
            size={16}
            color="var(--muted)"
            style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Rechercher un guichet..."
            value={recherche}
            onChange={(e) => { setRecherche(e.target.value); setPage(1); }}
            style={{
              width: '100%', padding: '8px 10px 8px 32px', borderRadius: '6px',
              border: '1px solid var(--input-border)', fontSize: '13px', boxSizing: 'border-box',
              backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--table-header)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Guichet</th>
              <th style={{ ...styleCellule, color: 'var(--text-secondary)', fontWeight: '600' }}>Transactions</th>
              {COLONNES.map((c) => (
                <th key={c.cle} style={{ ...styleCellule, color: 'var(--text-secondary)', fontWeight: '600' }}>
                  {c.libelle}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lignesPage.length === 0 ? (
              <tr>
                <td
                  colSpan={COLONNES.length + 2}
                  style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}
                >
                  Aucune opération pour ces critères.
                </td>
              </tr>
            ) : (
              lignesPage.map((l, index) => (
                <tr key={`${l.codeGuichet}-${index}`} style={{ borderBottom: '1px solid var(--faint)' }}>
                  <td
                    style={{
                      padding: '12px 16px', fontWeight: '600', fontSize: '13px',
                      color: l.codeGuichet === NON_RATTACHE ? 'var(--muted)' : 'var(--text-primary)',
                      fontStyle: l.codeGuichet === NON_RATTACHE ? 'italic' : 'normal',
                    }}
                    title={
                      l.codeGuichet === NON_RATTACHE
                        ? "Opérations sans guichet identifié (historique ou mouvement automatique)"
                        : undefined
                    }
                  >
                    {l.codeGuichet}
                  </td>
                  <td style={{ ...styleCellule, color: 'var(--text-primary)' }}>{l.nombreOperations}</td>
                  {COLONNES.map((c) => (
                    <td key={c.cle} style={{ ...styleCellule, fontWeight: '600', color: c.couleur }}>
                      {formatMontant(l[c.cle])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: 'var(--table-header)', borderTop: '1px solid var(--border-color)' }}>
              <td
                style={{
                  padding: '12px 16px', fontSize: '13px', fontWeight: '700',
                  color: 'var(--text-primary)', whiteSpace: 'nowrap',
                }}
              >
                Total ({lignesFiltrees.length})
              </td>
              <td style={{ ...styleCellule, fontWeight: '700', color: 'var(--text-primary)' }}>
                {totaux.operations}
              </td>
              {COLONNES.map((c) => (
                <td key={c.cle} style={{ ...styleCellule, fontWeight: '700', color: c.couleur }}>
                  {formatMontant(totaux[c.cle === 'totalDepots' ? 'depots'
                    : c.cle === 'totalRetraits' ? 'retraits'
                      : c.cle === 'totalVirements' ? 'virements'
                        : 'remboursements'])}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      <div
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 16px', borderTop: '1px solid var(--border-color)',
          flexWrap: 'wrap', gap: '10px',
        }}
      >
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {lignesFiltrees.length === 0
            ? 'Aucun résultat'
            : `Affichage de ${(pageActuelle - 1) * parPage + 1} à ${Math.min(pageActuelle * parPage, lignesFiltrees.length)} sur ${lignesFiltrees.length} résultats`}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Par page</span>
            <select
              value={parPage}
              onChange={(e) => { setParPage(Number(e.target.value)); setPage(1); }}
              style={{
                padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--input-border)',
                fontSize: '13px', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)',
              }}
            >
              {PAR_PAGE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pageActuelle === 1}
                style={{
                  minWidth: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--input-border)',
                  backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)',
                  cursor: pageActuelle === 1 ? 'not-allowed' : 'pointer',
                  opacity: pageActuelle === 1 ? 0.5 : 1, fontSize: '13px',
                }}
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 10).map((n) => (
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
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={pageActuelle === totalPages}
                style={{
                  minWidth: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--input-border)',
                  backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)',
                  cursor: pageActuelle === totalPages ? 'not-allowed' : 'pointer',
                  opacity: pageActuelle === totalPages ? 0.5 : 1, fontSize: '13px',
                }}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RapportGuichetTable;
