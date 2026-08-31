import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

const PAR_PAGE_OPTIONS = [10, 25, 50];

const formatDateForDisplay = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateString;
  }
};

function ClientTable({ clients, onEdit, onDelete }) {
  const [recherche, setRecherche] = useState('');
  const [page, setPage] = useState(1);
  const [parPage, setParPage] = useState(10);

  const clientsFiltres = useMemo(() => {
    const liste = Array.isArray(clients) ? clients : [];
    const q = recherche.trim().toLowerCase();

    const filtres = !q
      ? liste
      : liste.filter((c) => {
          const texte = `${c.nom} ${c.prenom} ${c.email} ${c.telephone} ${c.cin || ''}`.toLowerCase();
          return texte.includes(q);
        });

    return [...filtres].sort((a, b) => b.id - a.id);
  }, [clients, recherche]);

  const totalPages = Math.max(1, Math.ceil(clientsFiltres.length / parPage));
  const pageActuelle = Math.min(page, totalPages);
  const clientsPage = clientsFiltres.slice((pageActuelle - 1) * parPage, pageActuelle * parPage);

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Rechercher par nom, email, téléphone..."
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
              <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Nom</th>
              <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Prénom</th>
              <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>E-mail</th>
              <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Téléphone</th>
              <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Adresse</th>
              <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Date de naissance</th>
              <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clientsPage.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                  Aucun client trouvé.
                </td>
              </tr>
            ) : (
              clientsPage.map((client) => (
                <tr key={client.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>{client.nom}</td>
                  <td style={{ padding: '12px 16px', color: '#475569', fontSize: '14px' }}>{client.prenom}</td>
                  <td style={{ padding: '12px 16px', color: '#475569', fontSize: '14px' }}>{client.email}</td>
                  <td style={{ padding: '12px 16px', color: '#475569', fontSize: '14px' }}>{client.telephone}</td>
                  <td style={{ padding: '12px 16px', color: '#475569', fontSize: '14px' }}>{client.adresse}</td>
                  <td style={{ padding: '12px 16px', color: '#475569', fontSize: '14px' }}>{formatDateForDisplay(client.dateNaissance)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={() => onEdit(client)}
                      style={{ marginRight: '12px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '13px' }}
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => onDelete(client.id)}
                      style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '13px' }}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '10px' }}>
        <span style={{ fontSize: '13px', color: '#64748b' }}>
          {clientsFiltres.length === 0
            ? 'Aucun résultat'
            : `Affichage de ${(pageActuelle - 1) * parPage + 1} à ${Math.min(pageActuelle * parPage, clientsFiltres.length)} sur ${clientsFiltres.length} résultats`}
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
}

export default ClientTable;
