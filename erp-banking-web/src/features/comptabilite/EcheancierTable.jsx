import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import {
  calculerTotauxEcheances,
  colorerStatutEcheance,
  filtrerEcheances,
} from '../../service/echeancierService';

const PAR_PAGE_OPTIONS = [10, 25, 50, 100];

const formatMontant = (valeur) =>
  new Intl.NumberFormat('fr-FR').format(Math.round(valeur || 0)) + ' Ar';

const formatDate = (valeur) => {
  if (!valeur) return '—';
  const d = new Date(valeur);
  return Number.isNaN(d.getTime()) ? valeur : d.toLocaleDateString('fr-FR');
};

const EcheancierTable = ({ echeances }) => {
  const [recherche, setRecherche] = useState('');
  const [page, setPage] = useState(1);
  const [parPage, setParPage] = useState(25);

  const echeancesFiltrees = useMemo(
    () => filtrerEcheances(echeances || [], recherche),
    [echeances, recherche],
  );

  const totaux = useMemo(() => calculerTotauxEcheances(echeancesFiltrees), [echeancesFiltrees]);

  const totalPages = Math.max(1, Math.ceil(echeancesFiltrees.length / parPage));
  const pageActuelle = Math.min(page, totalPages);
  const echeancesPage = echeancesFiltrees.slice((pageActuelle - 1) * parPage, pageActuelle * parPage);

  return (
    <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} color="var(--muted)" style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Rechercher (client, crédit, statut...)"
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
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Crédit</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Échéance</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600', textAlign: 'right' }}>Montant</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {echeancesPage.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
                  Aucune échéance à afficher.
                </td>
              </tr>
            ) : (
              echeancesPage.map((e) => (
                <tr key={e.id} style={{ borderBottom: '1px solid var(--faint)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontSize: '13px' }}>
                    {[e.clientPrenom, e.clientNom].filter(Boolean).join(' ').trim() || '—'}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--text-primary)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                    {e.numeroCredit || '—'}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                    <div>{formatDate(e.dateEcheance)}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>N° {e.numeroEcheance}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', textAlign: 'right', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                    {formatMontant(e.montant)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', ...colorerStatutEcheance(e.statut) }}>
                      {e.statut}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: 'var(--table-header)', borderTop: '1px solid var(--border-color)' }}>
              <td colSpan="3" style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Total ({echeancesFiltrees.length} échéance{echeancesFiltrees.length > 1 ? 's' : ''})
              </td>
              <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', textAlign: 'right', color: 'var(--text-primary)' }}>
                {formatMontant(totaux.total)}
              </td>
              <td style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)' }}>
               Dont {formatMontant(totaux.payee)} payées
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '10px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {echeancesFiltrees.length === 0
            ? 'Aucun résultat'
            : `Affichage de ${(pageActuelle - 1) * parPage + 1} à ${Math.min(pageActuelle * parPage, echeancesFiltrees.length)} sur ${echeancesFiltrees.length} résultats`}
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

          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pageActuelle === 1}
                style={{ minWidth: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--input-border)', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', cursor: pageActuelle === 1 ? 'not-allowed' : 'pointer', opacity: pageActuelle === 1 ? 0.5 : 1, fontSize: '13px' }}
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
                style={{ minWidth: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--input-border)', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', cursor: pageActuelle === totalPages ? 'not-allowed' : 'pointer', opacity: pageActuelle === totalPages ? 0.5 : 1, fontSize: '13px' }}
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

export default EcheancierTable;
