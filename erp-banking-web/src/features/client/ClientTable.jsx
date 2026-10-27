import { useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

const styleStatutMobile = (statut) => {
  const s = (statut || '').toUpperCase();
  if (s === 'ACTIVE') return { bg: '#dcfce7', color: '#166534' };
  if (s === 'EN_ATTENTE') return { bg: '#fef3c7', color: '#92400e' };
  if (s === 'REFUSEE' || s === 'BLOQUEE') return { bg: '#fee2e2', color: '#991b1b' };
  return { bg: 'var(--table-header)', color: 'var(--muted)' };
};

const libelleStatutMobile = (statut) => {
  const libelles = { ACTIVE: 'Actif', EN_ATTENTE: 'En attente', REFUSEE: 'Refusé', BLOQUEE: 'Bloqué' };
  return libelles[statut] || statut || 'Aucun accès';
};

function ClientTable({ clients, comptes = [], recherche = '', onEdit, onDelete, onCreateMobile }) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [parPage, setParPage] = useState(10);

  const comptesParClient = useMemo(() => {
    const map = new Map();
    (Array.isArray(comptes) ? comptes : []).forEach((compte) => {
      if (compte.clientId == null) return;
      if (!map.has(compte.clientId)) map.set(compte.clientId, []);
      map.get(compte.clientId).push(compte);
    });
    return map;
  }, [comptes]);

  const clientsFiltres = useMemo(() => {
    const liste = Array.isArray(clients) ? clients : [];
    const q = recherche.trim().toLowerCase();

    const filtres = !q
      ? liste
      : liste.filter((c) => {
          const comptesClient = comptesParClient.get(c.id) || [];
          const numerosComptes = comptesClient.map((compte) => compte.numeroCompte || '').join(' ');
          const texte = `${c.nom || ''} ${c.prenom || ''} ${c.prenom || ''} ${c.nom || ''} ${numerosComptes}`.toLowerCase();
          return texte.includes(q);
        });

    return [...filtres].sort((a, b) => b.id - a.id);
  }, [clients, recherche, comptesParClient]);

  const totalPages = Math.max(1, Math.ceil(clientsFiltres.length / parPage));
  const pageActuelle = Math.min(page, totalPages);
  const clientsPage = clientsFiltres.slice((pageActuelle - 1) * parPage, pageActuelle * parPage);

  return (
    <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--table-header)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Nom</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Prénom</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>E-mail</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Téléphone</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Adresse</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Date de naissance</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Accès mobile</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clientsPage.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
                  Aucun client trouvé.
                </td>
              </tr>
            ) : (
              clientsPage.map((client) => (
                <tr key={client.id} onClick={() => navigate(`/clients/${client.id}`)} style={{ borderBottom: '1px solid var(--faint)', cursor: 'pointer' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '500', color: 'var(--text-primary)', fontSize: '14px' }}>{client.nom}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px' }}>{client.prenom}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px' }}>{client.email}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px' }}>{client.telephone}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px' }}>{client.adresse}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px' }}>{formatDateForDisplay(client.dateNaissance)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {client.mobileStatut ? (
                      <span
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                          backgroundColor: styleStatutMobile(client.mobileStatut).bg,
                          color: styleStatutMobile(client.mobileStatut).color,
                        }}
                      >
                        {libelleStatutMobile(client.mobileStatut)}
                      </span>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); onCreateMobile(client); }}
                        style={{
                          padding: '5px 12px', borderRadius: '6px', border: '1px solid #2563eb',
                          backgroundColor: 'transparent', color: '#2563eb', cursor: 'pointer',
                          fontWeight: '500', fontSize: '12px', whiteSpace: 'nowrap',
                        }}
                      >
                        accès mobile
                      </button>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit(client); }}
                      title='modifier'
                      style={{ marginRight: '12px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '13px' }}
                    >
                      <Pencil size={17}/>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(client.id); }}
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
          {clientsFiltres.length === 0
            ? 'Aucun résultat'
            : `Affichage de ${(pageActuelle - 1) * parPage + 1} à ${Math.min(pageActuelle * parPage, clientsFiltres.length)} sur ${clientsFiltres.length} résultats`}
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

export default ClientTable;
