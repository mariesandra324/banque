import { useMemo, useState } from 'react';
import { Pencil, Search, SlidersHorizontal, Trash2 } from 'lucide-react';

const PAR_PAGE_OPTIONS = [10, 25, 50];

function UtilisateurTable({ utilisateurs, onEdit, onDelete }) {
  console.log("DATA TABLE :", utilisateurs);
  const [recherche, setRecherche] = useState('');
  const [page, setPage] = useState(1);
  const [parPage, setParPage] = useState(10);

  const utilisateursFiltres = useMemo(() => {
    const liste = Array.isArray(utilisateurs) ? utilisateurs : [];
    const q = recherche.trim().toLowerCase();

    const filtres = !q
      ? liste
      : liste.filter((u) => {
        const texte = `${u.nom} ${u.prenom} ${u.email} ${u.role?.nom || ''} ${u.codeGuichet || ''}`.toLowerCase();
        return texte.includes(q);
      });
    return [...filtres].sort((a, b) => b.id - a.id);
  }, [utilisateurs, recherche]);

  const totalPages = Math.max(1, Math.ceil(utilisateursFiltres.length / parPage));
  const pageActuelle = Math.min(page, totalPages);
  const utilisateursPage = utilisateursFiltres.slice((pageActuelle - 1) * parPage, pageActuelle * parPage);

  return (
    <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>

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
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--table-header)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Nom</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Prénom</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Email</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Rôle</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Code guichet</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Statut</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {utilisateursPage.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            ) : (
              utilisateursPage.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--faint)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '500', color: 'var(--text-primary)', fontSize: '14px' }}>{user.nom}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px' }}>{user.prenom}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px' }}>{user.email}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px' }}>{user.role}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'monospace' }}>
                    {user.codeGuichet || '-'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                        backgroundColor: user.actif ? '#dcfce7' : '#fee2e2',
                        color: user.actif ? '#15803d' : '#b91c1c',
                      }}
                    >
                      {user.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={() => onEdit(user)}
                      title='modifier'
                      style={{ marginRight: '12px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '13px' }}
                    >
                    <Pencil size={17}/>
                    </button>
                    <button
                      onClick={() => onDelete(user.id)}
                      title='supprimer'
                      style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '13px' }}
                    >
                    <Trash2 size={17}/>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '10px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {utilisateursFiltres.length === 0
            ? 'Aucun résultat'
            : `Affichage de ${(pageActuelle - 1) * parPage + 1} à ${Math.min(pageActuelle * parPage, utilisateursFiltres.length)} sur ${utilisateursFiltres.length} résultats`}
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

export default UtilisateurTable;
