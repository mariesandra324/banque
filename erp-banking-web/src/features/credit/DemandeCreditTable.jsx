import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const PAR_PAGE = 10;

const styleStatut = (statut) => {
  const s = (statut || '').toUpperCase();
  if (s.includes('REJET')) return { bg: '#fee2e2', color: '#991b1b' };
  if (s.includes('ACCEPT') || s.includes('APPROUV')) return { bg: '#dcfce7', color: '#166534' };
  return { bg: '#fef3c7', color: '#92400e' };
};

const formatMontant = (montant) =>
  new Intl.NumberFormat('fr-FR').format(montant || 0) + ' Ar';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('fr-FR');
};

function DemandeCreditTable({ demandes = [] }) {
  const navigate = useNavigate();
  const [recherche, setRecherche] = useState('');
  const [statutFiltre, setStatutFiltre] = useState('');
  const [page, setPage] = useState(1);

  const statutsDisponibles = useMemo(() => {
    const liste = Array.isArray(demandes) ? demandes : [];
    return Array.from(new Set(liste.map((d) => d.statut).filter(Boolean)));
  }, [demandes]);

  const demandesFiltrees = useMemo(() => {
    const liste = Array.isArray(demandes) ? demandes : [];
    const q = recherche.trim().toLowerCase();

    let filtres = !q
      ? liste
      : liste.filter((d) => {
          const texte = `${d.clientNom || ''} ${d.clientPrenom || ''} ${d.reference || ''}`.toLowerCase();
          return texte.includes(q);
        });

    if (statutFiltre) {
      filtres = filtres.filter((d) => d.statut === statutFiltre);
    }

    return [...filtres].sort((a, b) => new Date(b.dateDemande) - new Date(a.dateDemande));
  }, [demandes, recherche, statutFiltre]);

  const totalPages = Math.max(1, Math.ceil(demandesFiltrees.length / PAR_PAGE));
  const pageActuelle = Math.min(page, totalPages);
  const demandesPage = demandesFiltrees.slice((pageActuelle - 1) * PAR_PAGE, pageActuelle * PAR_PAGE);

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Rechercher par client, référence..."
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
          {statutsDisponibles.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Référence</th>
              <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Client</th>
              <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Montant demandé</th>
              <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Durée</th>
              <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Date demande</th>
              <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Statut</th>
              <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {demandesPage.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                  Aucune demande de crédit trouvée.
                </td>
              </tr>
            ) : (
              demandesPage.map((d) => {
                const badge = styleStatut(d.statut);
                return (
                  <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>{d.reference || `#${d.id}`}</td>
                    <td style={{ padding: '12px 16px', color: '#475569', fontSize: '14px' }}>{d.clientNom} {d.clientPrenom}</td>
                    <td style={{ padding: '12px 16px', color: '#475569', fontSize: '14px' }}>{formatMontant(d.montantDemande)}</td>
                    <td style={{ padding: '12px 16px', color: '#475569', fontSize: '14px' }}>{d.duree ?? d.dureeMois ?? '-'} mois</td>
                    <td style={{ padding: '12px 16px', color: '#475569', fontSize: '14px' }}>{formatDate(d.dateDemande)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '600',
                        backgroundColor: badge.bg, color: badge.color,
                      }}>
                        {d.statut}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => navigate(`/credits/demandes/${d.id}`)}
                        style={{ marginRight: '10px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '13px' }}
                      >
                        Détails
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
          {demandesFiltrees.length} demande(s)
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

export default DemandeCreditTable;