import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

const PAR_PAGE = 10;

const STATUTS_CREDIT = {
  ACTIF: { label: 'Actif', bg: '#dbeafe', color: '#1e40af' },
  SOLDE: { label: 'Soldé', bg: '#dcfce7', color: '#166534' },
  EN_RETARD: { label: 'En retard', bg: '#fee2e2', color: '#991b1b' },
};

const formatMontant = (montant) =>
  new Intl.NumberFormat('fr-FR').format(montant || 0) + ' Ar';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('fr-FR');
};

function CreditTable({ credits = [], onVoir }) {
  const [recherche, setRecherche] = useState('');
  const [statutFiltre, setStatutFiltre] = useState('');
  const [page, setPage] = useState(1);

  const creditsFiltres = useMemo(() => {
    const liste = Array.isArray(credits) ? credits : [];
    const q = recherche.trim().toLowerCase();

    let filtres = !q
      ? liste
      : liste.filter((c) => {
          const texte = `${c.client?.nom || ''} ${c.client?.prenom || ''} ${c.numeroCredit || ''}`.toLowerCase();
          return texte.includes(q);
        });

    if (statutFiltre) {
      filtres = filtres.filter((c) => c.statut === statutFiltre);
    }

    return [...filtres].sort((a, b) => new Date(b.dateDebut) - new Date(a.dateDebut));
  }, [credits, recherche, statutFiltre]);

  const totalPages = Math.max(1, Math.ceil(creditsFiltres.length / PAR_PAGE));
  const pageActuelle = Math.min(page, totalPages);
  const creditsPage = creditsFiltres.slice((pageActuelle - 1) * PAR_PAGE, pageActuelle * PAR_PAGE);

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Rechercher par client, numéro..."
            value={recherche}
            onChange={(e) => { setRecherche(e.target.value); setPage(1); }}
            style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box' }}
          />
        </div>
        <select
          value={statutFiltre}
          onChange={(e) => { setStatutFiltre(e.target.value); setPage(1); }}
          style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUTS_CREDIT).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>N° crédit</th>
              <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Client</th>
              <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Montant</th>
              <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Taux</th>
              <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Mensualité</th>
              <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Date début</th>
              <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Statut</th>
              <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {creditsPage.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                  Aucun crédit trouvé.
                </td>
              </tr>
            ) : (
              creditsPage.map((c) => {
                const statut = STATUTS_CREDIT[c.statut] || STATUTS_CREDIT.ACTIF;
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>{c.numeroCredit}</td>
                    <td style={{ padding: '12px 16px', color: '#475569', fontSize: '14px' }}>{c.client?.nom} {c.client?.prenom}</td>
                    <td style={{ padding: '12px 16px', color: '#475569', fontSize: '14px' }}>{formatMontant(c.montant)}</td>
                    <td style={{ padding: '12px 16px', color: '#475569', fontSize: '14px' }}>{c.tauxInteret}%</td>
                    <td style={{ padding: '12px 16px', color: '#475569', fontSize: '14px' }}>{formatMontant(c.mensualite)}</td>
                    <td style={{ padding: '12px 16px', color: '#475569', fontSize: '14px' }}>{formatDate(c.dateDebut)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '600',
                        backgroundColor: statut.bg, color: statut.color,
                      }}>
                        {statut.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => onVoir?.(c)}
                        style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '13px' }}
                      >
                        Voir
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderTop: '1px solid #e2e8f0' }}>
        <span style={{ fontSize: '13px', color: '#64748b' }}>
          {creditsFiltres.length} crédit(s)
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              style={{
                minWidth: '28px', height: '28px', borderRadius: '6px', border: '1px solid #d1d5db',
                backgroundColor: n === pageActuelle ? '#2563eb' : 'white',
                color: n === pageActuelle ? 'white' : '#1f2937',
                cursor: 'pointer', fontSize: '13px',
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CreditTable;