import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Columns3, MoreVertical } from 'lucide-react';

const PAR_PAGE_OPTIONS = [10, 25, 50];

function CompteTable({ comptes, clients, onEdit, onDelete }) {
  const [recherche, setRecherche] = useState('');
  // const [selection, setSelection] = useState([]);
  const [page, setPage] = useState(1);
  const [parPage, setParPage] = useState(10);
  const [menuOuvertId, setMenuOuvertId] = useState(null);

  const comptesFiltres = useMemo(() => {
    const liste = Array.isArray(comptes) ? comptes : [];
    const q = recherche.trim().toLowerCase();
    
    const filtres = !q
      ? liste
      : liste.filter((c)=> {
        const texte = `${c.numeroCompte} ${c.typeCompte} ${clients?.nom || ''} ${clients?.prenom || ''}`.toLowerCase();
        return texte.includes(q);
      });
    return [...filtres].sort((a, b) => b.id - a.id);
  }, [comptes, clients, recherche]);

  const totalPages = Math.max(1, Math.ceil(comptesFiltres.length / parPage));
  const pageActuelle = Math.min(page, totalPages);
  const comptesPage = comptesFiltres.slice((pageActuelle - 1) * parPage, pageActuelle * parPage);

  // const toutSelectionne = comptesPage.length > 0 && comptesPage.every((c) => selection.includes(c.id));

  // const toggleTout = () => {
  //   if (toutSelectionne) {
  //     setSelection((prev) => prev.filter((id) => !comptesPage.some((c) => c.id === id)));
  //   } else {
  //     setSelection((prev) => [...new Set([...prev, ...comptesPage.map((c) => c.id)])]);
  //   }
  // };

  // const toggleUn = (id) => {
  //   setSelection((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  // };

  return (
    <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>

      {/* Barre du haut : recherche + icônes filtre/colonnes */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={16} color="var(--muted)" style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={recherche}
            onChange={(e) => { setRecherche(e.target.value); setPage(1); }}
            style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: '6px', border: '1px solid var(--input-border)', fontSize: '13px', boxSizing: 'border-box', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)' }}
          />
        </div>
        <button style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--input-border)', backgroundColor: 'var(--card-bg)', cursor: 'pointer', display: 'flex' }}>
          <SlidersHorizontal size={16} color="var(--text-secondary)" />
        </button>
        <button style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--input-border)', backgroundColor: 'var(--card-bg)', cursor: 'pointer', display: 'flex' }}>
          <Columns3 size={16} color="var(--text-secondary)" />
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--table-header)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '12px 16px', width: '40px' }}>
                {/* <input type="checkbox" checked={toutSelectionne} onChange={toggleTout} /> */}
              </th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Numéro de compte</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Type</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Solde</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Statut</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Client</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Date de création</th>
              <th style={{ padding: '12px 16px', width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {comptesPage.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
                  Aucun compte trouvé.
                </td>
              </tr>
            ) : (
              comptesPage.map((compte) => {
                const client = clients.find((c) => c.id === compte.clientId);
                return (
                  <tr key={compte.id} style={{ borderBottom: '1px solid var(--faint)' }}>
                    <td style={{ padding: '12px 16px' }}></td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{compte.numeroCompte}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px' }}>{compte.typeCompte}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px' }}>
                      {compte.solde != null ? compte.solde.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                          backgroundColor: compte.statut === 'ACTIF' ? '#dcfce7' : '#fee2e2',
                          color: compte.statut === 'ACTIF' ? '#15803d' : '#b91c1c',
                        }}
                      >
                        {compte.statut}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px' }}>
                      {client ? `${client.nom} ${client.prenom}` : compte.clientId}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px' }}>{compte.dateCreation || '-'}</td>
                    <td style={{ padding: '12px 16px', position: 'relative' }}>
                      <button
                        onClick={() => setMenuOuvertId(menuOuvertId === compte.id ? null : compte.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
                      >
                        <MoreVertical size={16} color="var(--text-secondary)" />
                      </button>
                      {menuOuvertId === compte.id && (
                        <div
                          style={{
                            position: 'absolute', right: '16px', top: '36px', zIndex: 10,
                            backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: '130px', overflow: 'hidden',
                          }}
                        >
                          <button
                            onClick={() => { onEdit(compte); setMenuOuvertId(null); }}
                            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--text-primary)' }}
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => { onDelete(compte.id); setMenuOuvertId(null); }}
                            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#dc2626' }}
                          >
                            Supprimer
                          </button>
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

      {/* Pied de tableau : compteur + par page + pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '10px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {comptesFiltres.length === 0
            ? 'Aucun résultat'
            : `Affichage de ${(pageActuelle - 1) * parPage + 1} à ${Math.min(pageActuelle * parPage, comptesFiltres.length)} sur ${comptesFiltres.length} résultats`}
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

export default CompteTable;
