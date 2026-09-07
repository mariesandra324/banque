import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Landmark, ArrowLeftRight, Wallet, Loader2 } from 'lucide-react';
import { clientService } from '../service/clientService';
import { getComptes } from '../service/compteService';
import { getAllTransactions } from '../service/transactionService';
import { getDemandesCredit, getCredits } from '../service/creditService';

const LIMITE_PAR_CATEGORIE = 5;

function GlobalSearch() {
  const navigate = useNavigate();
  const conteneurRef = useRef(null);

  const [requete, setRequete] = useState('');
  const [ouvert, setOuvert] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [resultats, setResultats] = useState({ clients: [], comptes: [], transactions: [], credits: [] });

  // Fermer le menu déroulant au clic en dehors
  useEffect(() => {
    const gererClicExterieur = (e) => {
      if (conteneurRef.current && !conteneurRef.current.contains(e.target)) {
        setOuvert(false);
      }
    };
    document.addEventListener('mousedown', gererClicExterieur);
    return () => document.removeEventListener('mousedown', gererClicExterieur);
  }, []);

  // Recherche avec un léger anti-rebond (debounce)
  useEffect(() => {
    const texte = requete.trim();

    if (texte.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResultats({ clients: [], comptes: [], transactions: [], credits: [] });
      setChargement(false);
      return;
    }

    setChargement(true);
    const minuteur = setTimeout(async () => {
      try {
        const texteLower = texte.toLowerCase();

        const [clients, comptesRes, transactions, demandes, credits] = await Promise.all([
          clientService.searchClients(texte).catch(() => []),
          getComptes().catch(() => ({ data: [] })),
          getAllTransactions().catch(() => []),
          getDemandesCredit().catch(() => []),
          getCredits().catch(() => []),
        ]);

        const comptesFiltres = (Array.isArray(comptesRes?.data) ? comptesRes.data : [])
          .filter((c) =>
            c.numeroCompte?.toLowerCase().includes(texteLower) ||
            c.typeCompte?.toLowerCase().includes(texteLower) ||
            c.iban?.toLowerCase().includes(texteLower)
          )
          .slice(0, LIMITE_PAR_CATEGORIE);

        const transactionsFiltrees = (Array.isArray(transactions) ? transactions : [])
          .filter((t) =>
            t.reference?.toLowerCase().includes(texteLower) ||
            String(t.type ?? '').toLowerCase().includes(texteLower) ||
            t.numeroCompteSource?.toLowerCase().includes(texteLower) ||
            t.numeroCompteDestination?.toLowerCase().includes(texteLower) ||
            String(t.montant ?? '').includes(texteLower)
          )
          .slice(0, LIMITE_PAR_CATEGORIE);

        const demandesFiltrees = (Array.isArray(demandes) ? demandes : [])
          .filter((d) =>
            d.clientNom?.toLowerCase().includes(texteLower) ||
            d.clientPrenom?.toLowerCase().includes(texteLower) ||
            d.motif?.toLowerCase().includes(texteLower) ||
            String(d.statut ?? '').toLowerCase().includes(texteLower)
          );

        const creditsFiltres = (Array.isArray(credits) ? credits : [])
          .filter((c) =>
            c.numeroCredit?.toLowerCase?.().includes(texteLower) ||
            c.clientNom?.toLowerCase().includes(texteLower) ||
            c.clientPrenom?.toLowerCase().includes(texteLower) ||
            String(c.statut ?? '').toLowerCase().includes(texteLower)
          );

        const creditsCombines = [
          ...demandesFiltrees.map((d) => ({ ...d, _type: 'demande' })),
          ...creditsFiltres.map((c) => ({ ...c, _type: 'credit' })),
        ].slice(0, LIMITE_PAR_CATEGORIE);

        setResultats({
          clients: (Array.isArray(clients) ? clients : []).slice(0, LIMITE_PAR_CATEGORIE),
          comptes: comptesFiltres,
          transactions: transactionsFiltrees,
          credits: creditsCombines,
        });
      } catch (err) {
        console.error('Erreur recherche globale :', err);
      } finally {
        setChargement(false);
      }
    }, 300);

    return () => clearTimeout(minuteur);
  }, [requete]);

  const total = resultats.clients.length + resultats.comptes.length + resultats.transactions.length + resultats.credits.length;
  const rechercheEnCours = requete.trim().length >= 2;

  const allerA = (chemin) => {
    setOuvert(false);
    setRequete('');
    navigate(chemin);
  };

  return (
    <div className="search-box" ref={conteneurRef} style={{ position: 'relative' }}>
      <Search size={18} className="search-icon" />
      <input
        type="text"
        placeholder="Rechercher un client, un compte, une transaction..."
        value={requete}
        onChange={(e) => setRequete(e.target.value)}
        onFocus={() => setOuvert(true)}
      />

      {ouvert && rechercheEnCours && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
          backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', maxHeight: '420px', overflowY: 'auto',
          zIndex: 100, textAlign: 'left',
        }}>
          {chargement && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px', color: '#6b7280', fontSize: '13px' }}>
              <Loader2 size={14} className="spin" /> Recherche en cours...
            </div>
          )}

          {!chargement && total === 0 && (
            <div style={{ padding: '16px', color: '#9ca3af', fontSize: '13px', textAlign: 'center' }}>
              Aucun résultat pour « {requete} »
            </div>
          )}

          {!chargement && resultats.clients.length > 0 && (
            <SectionResultats titre="Clients" icon={User}>
              {resultats.clients.map((c) => (
                <LigneResultat
                  key={`client-${c.id}`}
                  titre={`${c.prenom ?? ''} ${c.nom ?? ''}`.trim()}
                  sousTitre={c.email}
                  onClick={() => allerA('/clients')}
                />
              ))}
            </SectionResultats>
          )}

          {!chargement && resultats.comptes.length > 0 && (
            <SectionResultats titre="Comptes" icon={Landmark}>
              {resultats.comptes.map((c) => (
                <LigneResultat
                  key={`compte-${c.id}`}
                  titre={c.numeroCompte}
                  sousTitre={c.typeCompte}
                  onClick={() => allerA('/comptes')}
                />
              ))}
            </SectionResultats>
          )}

          {!chargement && resultats.transactions.length > 0 && (
            <SectionResultats titre="Transactions" icon={ArrowLeftRight}>
              {resultats.transactions.map((t) => (
                <LigneResultat
                  key={`transaction-${t.id}`}
                  titre={t.reference || `Transaction #${t.id}`}
                  sousTitre={t.type}
                  onClick={() => allerA('/transactions')}
                />
              ))}
            </SectionResultats>
          )}

          {!chargement && resultats.credits.length > 0 && (
            <SectionResultats titre="Crédits" icon={Wallet}>
              {resultats.credits.map((c) => (
                <LigneResultat
                  key={`credit-${c._type}-${c.id}`}
                  titre={c._type === 'demande' ? `${c.clientPrenom ?? ''} ${c.clientNom ?? ''}`.trim() : (c.numeroCredit || `#${c.id}`)}
                  sousTitre={c._type === 'demande' ? `Demande — ${c.statut}` : c.statut}
                  onClick={() => allerA(c._type === 'demande' ? `/credits/demandes/${c.id}` : '/credits')}
                />
              ))}
            </SectionResultats>
          )}
        </div>
      )}
    </div>
  );
}

function SectionResultats({ titre, icon: Icon, children }) {
  return (
    <div style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '4px 14px', fontSize: '11px', fontWeight: '700',
        color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.03em',
      }}>
        <Icon size={12} /> {titre}
      </div>
      {children}
    </div>
  );
}

function LigneResultat({ titre, sousTitre, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none',
        cursor: 'pointer', padding: '8px 14px',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>{titre || '—'}</div>
      {sousTitre && <div style={{ fontSize: '12px', color: '#6b7280' }}>{sousTitre}</div>}
    </button>
  );
}

export default GlobalSearch;
