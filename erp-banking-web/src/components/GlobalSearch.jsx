import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Hash, Loader2 } from 'lucide-react';
import { clientService } from '../service/clientService';

const LIMITE_SUGGESTIONS = 6;

function GlobalSearch() {
  const navigate = useNavigate();
  const conteneurRef = useRef(null);

  const [requete, setRequete] = useState('');
  const [ouvert, setOuvert] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const gererClicExterieur = (e) => {
      if (conteneurRef.current && !conteneurRef.current.contains(e.target)) {
        setOuvert(false);
      }
    };
    document.addEventListener('mousedown', gererClicExterieur);
    return () => document.removeEventListener('mousedown', gererClicExterieur);
  }, []);

  useEffect(() => {
    const texte = requete.trim();
    if (texte.length < 2) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChargement(true);
    const minuteur = setTimeout(async () => {
      try {
        const res = await clientService.searchClients(texte);
        setClients((Array.isArray(res) ? res : []).slice(0, LIMITE_SUGGESTIONS));
      } catch {
        setClients([]);
      } finally {
        setChargement(false);
      }
    }, 300);
    return () => clearTimeout(minuteur);
  }, [requete]);

  const surSaisie = (e) => {
    const valeur = e.target.value;
    setRequete(valeur);
    if (valeur.trim().length < 2) {
      setClients([]);
      setChargement(false);
    }
  };

  const allerAuDossier = (client) => {
    setOuvert(false);
    if (client?.id) navigate(`/clients/${client.id}`);
  };

  const surEntree = (e) => {
    if (e.key === 'Enter' && clients.length > 0 && !chargement) {
      allerAuDossier(clients[0]);
    }
  };

  const rechercheActive = requete.trim().length >= 2;
  const total = clients.length;

  const styles = {
    conteneur: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      width: '280px',
      backgroundColor: 'var(--card-bg, #1e293b)',
      borderRadius: '8px',
      border: '1px solid var(--border-color, #334155)',
      padding: '0 12px',
    },
    icone: {
      color: 'var(--text-secondary, #94a3b8)',
      marginRight: '8px',
      flexShrink: 0,
    },
    input: {
      width: '100%',
      background: 'transparent',
      border: 'none',
      outline: 'none',
      padding: '8px 0',
      color: 'var(--text-primary, #f8fafc)',
      fontSize: '13px',
    },
    dropdown: {
      position: 'absolute',
      top: 'calc(100% + 8px)',
      left: 0,
      right: 0,
      backgroundColor: 'var(--card-bg, #1e293b)',
      border: '1px solid var(--border-color, #334155)',
      borderRadius: '10px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      maxHeight: '420px',
      overflowY: 'auto',
      zIndex: 100,
      textAlign: 'left',
    },
    ligne: {
      display: 'block',
      width: '100%',
      textAlign: 'left',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '10px 14px',
      borderBottom: '1px solid var(--border-color, #334155)',
    },
    ligneDerniere: { borderBottom: 'none' },
    titre: { fontSize: '13px', fontWeight: '600', color: 'var(--text-primary, #f8fafc)' },
    sousTitre: { fontSize: '12px', color: 'var(--text-secondary, #94a3b8)', marginTop: '2px' },
  };

  return (
    <div ref={conteneurRef} style={styles.conteneur}>
      <Search size={16} style={styles.icone} />
      <input
        type="text"
        placeholder="Rechercher un client..."
        value={requete}
        onChange={surSaisie}
        onFocus={() => setOuvert(true)}
        onKeyDown={surEntree}
        style={styles.input}
      />

      {ouvert && rechercheActive && (
        <div style={styles.dropdown}>
          {chargement && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px', color: 'var(--text-secondary, #94a3b8)', fontSize: '13px' }}>
              <Loader2 size={14} className="spin" /> Recherche en cours...
            </div>
          )}

          {!chargement && total === 0 && (
            <div style={{ padding: '16px', color: 'var(--text-secondary, #94a3b8)', fontSize: '13px', textAlign: 'center' }}>
              Aucun résultat pour « {requete} »
            </div>
          )}

          {!chargement && clients.length > 0 && (
            <div>
              {clients.map((c, i) => (
                <button
                  key={`client-${c.id}`}
                  onClick={() => allerAuDossier(c)}
                  style={{
                    ...styles.ligne,
                    ...(i === clients.length - 1 && styles.ligneDerniere),
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--hover-bg, #334155)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={styles.titre}>
                    {`${c.prenom ?? ''} ${c.nom ?? ''}`.trim()}
                  </div>
                  <div style={styles.sousTitre}>
                    <Hash size={11} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                    CIN : {c.cin || '-'}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;