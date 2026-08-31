import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

const PAR_PAGE_OPTIONS = [10, 25, 50];

const TransactionTable = ({ transactions, numeroCompteActuel }) => {
  const [recherche, setRecherche] = useState('');
  const [page, setPage] = useState(1);
  const [parPage, setParPage] = useState(10);

  const transactionsFiltrees = useMemo(() => {
    const liste = Array.isArray(transactions) ? transactions : [];
    const q = recherche.trim().toLowerCase();
    
    const filtres = !q
      ? liste
      : liste.filter((tx)=> {
      const texte = `${tx.reference} ${tx.type} ${tx.description || ''} ${tx.compteSource?.numeroCompte || ''} ${tx.compteDestination?.numeroCompte || ''}`.toLowerCase();
      return texte.includes(q);
    });
    return [...filtres].sort((a, b) => b.id - a.id);
  }, [transactions, recherche]);

  const totalPages = Math.max(1, Math.ceil(transactionsFiltrees.length / parPage));
  const pageActuelle = Math.min(page, totalPages);
  const transactionsPage = transactionsFiltrees.slice((pageActuelle - 1) * parPage, pageActuelle * parPage);

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Rechercher (référence, description...)"
            value={recherche}
            onChange={(e) => { setRecherche(e.target.value); setPage(1); }}
            style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box' }}
          />
        </div>
        <button style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white', cursor: 'pointer', display: 'flex' }}>
          <SlidersHorizontal size={16} color="#64748b" />
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Référence</th>
              <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Date</th>
              <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Type</th>
              <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Montant</th>
              <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Description</th>
              <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {transactionsPage.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                  Aucune transaction à afficher.
                </td>
              </tr>
            ) : (
              transactionsPage.map((tx) => {
                const estDebit = tx.type === 'RETRAIT' || (tx.type === 'VIREMENT' && tx.compteSource?.numeroCompte === numeroCompteActuel);
                return (
                  <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '600', color: '#1f2937', fontSize: '13px' }}>
                      {tx.reference}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569', fontSize: '13px' }}>
                      {new Date(tx.dateTransaction).toLocaleString('fr-FR')}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569', fontSize: '14px' }}>{tx.type}</td>
                    <td style={{ padding: '12px 16px', fontWeight: '600', fontSize: '14px', color: estDebit ? '#dc2626' : '#16a34a' }}>
                      {estDebit ? `- ${tx.montant}` : `+ ${tx.montant}`}
                    </td>
                    {/* <td style={{ padding: '12px 16px', color: '#475569', fontSize: '13px' }}>
                      {tx.type === 'VIREMENT'
                        ? `${tx.compteSource?.numeroCompte} → ${tx.compteDestination?.numeroCompte}`
                        : tx.compteSource?.numeroCompte}
                    </td> */}
                    <td style={{ padding: '12px 16px', color: '#475569', fontSize: '14px' }}>{tx.description || '-'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                          backgroundColor: tx.statut === 'SUCCES' ? '#dcfce7' : '#fee2e2',
                          color: tx.statut === 'SUCCES' ? '#15803d' : '#b91c1c',
                        }}
                      >
                        {tx.statut}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '10px' }}>
        <span style={{ fontSize: '13px', color: '#64748b' }}>
          {transactionsFiltrees.length === 0
            ? 'Aucun résultat'
            : `Affichage de ${(pageActuelle - 1) * parPage + 1} à ${Math.min(pageActuelle * parPage, transactionsFiltrees.length)} sur ${transactionsFiltrees.length} résultats`}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Par page</span>
            <select
              value={parPage}
              onChange={(e) => { setParPage(Number(e.target.value)); setPage(1); }}
              style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
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
    </div>
  );
};

export default TransactionTable;
