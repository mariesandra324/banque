import { useEffect, useState } from 'react';
import { getAllTransactions, getHistoriqueCompte } from '../service/transactionService';
import TransactionForm from '../features/transaction/TransactionForm';
import TransactionTable from '../features/transaction/TransactionTable';
import { useAuth } from '../hooks/useAuth';

// Le comptable est un rôle de consultation : il ne peut pas saisir de transaction.
const ROLES_AUTORISES_A_CREER = ['ADMIN', 'AGENT', 'GESTIONNAIRE'];

const Transactions = () => {
  const { user } = useAuth();
  const peutCreerTransaction = ROLES_AUTORISES_A_CREER.includes(user?.role);

  const [vue, setVue] = useState('liste'); 
  const [transactions, setTransactions] = useState([]);
  const [numeroCompteFiltre, setNumeroCompteFiltre] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState('');

  const chargerHistorique = async (numCompte = '') => {
    setLoadingHistory(true);
    setHistoryError('');
    try {
      const data = numCompte.trim()
        ? await getHistoriqueCompte(numCompte)
        : await getAllTransactions();
      setTransactions(data);
    } catch (err) {
      setHistoryError(err.response?.data?.message || 'Aucune transaction trouvée pour ce compte');
      setTransactions([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const voirHistorique = () => {
    setVue('liste');
    chargerHistorique(numeroCompteFiltre);
  };

  useEffect(() => {
    chargerHistorique();
  }, []);

  const voirFormulaire = () => {
    setVue('form');
  };

  // Après une transaction réussie, si on est déjà sur la liste, on la rafraîchit
  const handleTransactionSuccess = (numeroCompteSource) => {
    setNumeroCompteFiltre(numeroCompteSource);
    if (vue === 'liste') {
      chargerHistorique(numeroCompteSource);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: '20px', margin: 0, color: 'var(--heading)' }}>Transactions</h1>

        {vue === 'form' ? (
          <button
            onClick={voirHistorique}
            style={{ backgroundColor: 'var(--card-bg)', color: '#2563eb', padding: '10px 16px', borderRadius: '6px', border: '1px solid #2563eb', cursor: 'pointer', fontWeight: '500' }}
          >
            Voir l'historique
          </button>
        ) : (
          peutCreerTransaction && (
            <button
              onClick={voirFormulaire}
              style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
            >
              + Nouvelle transaction
            </button>
          )
        )}
      </div>

      {vue === 'form' ? (
        <TransactionForm onTransactionSuccess={handleTransactionSuccess} />
      ) : (
        <div>
          {historyError && (
            <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '6px', backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '13px' }}>
              {historyError}
            </div>
          )}

          {loadingHistory ? (
            <div style={{ padding: '20px', color: 'var(--muted)' }}>Chargement de l'historique...</div>
          ) : (
            <TransactionTable transactions={transactions} numeroCompteActuel={numeroCompteFiltre} />
          )}
        </div>
      )}
    </div>
  );
};

export default Transactions;
