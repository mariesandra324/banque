import { Fragment, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { getAllTransactions } from '../../service/transactionService';
import { extraireMessageErreur } from '../../utils/messageErreur';
import TransactionTable from '../transaction/TransactionTable';

const formatDate = (date) => {
  if (!date) return '-';
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime()) ? '-' : parsedDate.toLocaleString('fr-FR');
};

function ClientSearchResults({ clients, comptes, recherche }) {
  const [transactions, setTransactions] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [compteOuvert, setCompteOuvert] = useState(null);

  useEffect(() => {
    let actif = true;

    getAllTransactions()
      .then((data) => {
        if (actif) setTransactions(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (actif) setErreur(extraireMessageErreur(err, 'Impossible de charger les transactions.'));
      })
      .finally(() => {
        if (actif) setChargement(false);
      });

    return () => {
      actif = false;
    };
  }, []);

  const comptesFiltres = useMemo(() => {
    const terme = recherche.trim().toLocaleLowerCase('fr');
    const clientsParId = new Map(clients.map((client) => [client.id, client]));

    return comptes
      .map((compte) => ({ compte, client: clientsParId.get(compte.clientId) }))
      .filter(({ compte, client }) => {
        const nomClient = `${client?.prenom ?? ''} ${client?.nom ?? ''}`.toLocaleLowerCase('fr');
        return nomClient.includes(terme) || String(compte.numeroCompte ?? '').toLocaleLowerCase('fr').includes(terme);
      })
      .sort((a, b) => String(a.compte.numeroCompte).localeCompare(String(b.compte.numeroCompte)));
  }, [clients, comptes, recherche]);

  const transactionsParCompte = (numeroCompte) =>
    transactions
      .filter((transaction) =>
        transaction.numeroCompteSource === numeroCompte
        || transaction.numeroCompteDestination === numeroCompte
      )
      .sort((a, b) => new Date(b.dateTransaction) - new Date(a.dateTransaction));

  return (
    <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
      {erreur && (
        <div style={{ padding: '12px 16px', color: '#b91c1c', backgroundColor: '#fef2f2', borderBottom: '1px solid #fecaca', fontSize: '13px' }}>
          {erreur}
        </div>
      )}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--table-header)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '12px 16px', width: '36px' }} />
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Nom du client</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>N° de compte</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Solde actuel</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Statut du compte</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Transaction récente</th>
            </tr>
          </thead>
          <tbody>
            {chargement ? (
              <tr>
                <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>
                  <Loader2 size={15} className="spin" style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                  Chargement des transactions...
                </td>
              </tr>
            ) : comptesFiltres.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
                  Aucun compte trouvé.
                </td>
              </tr>
            ) : (
              comptesFiltres.map(({ compte, client }) => {
                const historique = transactionsParCompte(compte.numeroCompte);
                const derniereTransaction = historique[0];
                const ouvert = compteOuvert === compte.numeroCompte;

                return (
                  <Fragment key={compte.id}>
                    <tr
                      onClick={() => setCompteOuvert(ouvert ? null : compte.numeroCompte)}
                      style={{ borderBottom: '1px solid var(--faint)', cursor: 'pointer' }}
                    >
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                        {ouvert ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500' }}>
                        {`${client?.prenom ?? ''} ${client?.nom ?? ''}`.trim() || '-'}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px' }}>
                        {compte.numeroCompte}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500' }}>
                        {compte.solde != null
                          ? `${Number(compte.solde).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Ar`
                          : '-'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: compte.statut === 'ACTIF' ? '#dcfce7' : '#fee2e2',
                          color: compte.statut === 'ACTIF' ? '#15803d' : '#b91c1c',
                        }}>
                          {compte.statut || '-'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontSize: '13px' }}>
                        {derniereTransaction
                          ? `${derniereTransaction.type} — ${derniereTransaction.montant} — ${formatDate(derniereTransaction.dateTransaction)}`
                          : 'Aucune transaction'}
                      </td>
                    </tr>
                    {ouvert && (
                      <tr key={`${compte.id}-historique`}>
                        <td colSpan="6" style={{ padding: '16px', backgroundColor: 'var(--table-header)' }}>
                          <TransactionTable transactions={historique} numeroCompteActuel={compte.numeroCompte} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ClientSearchResults;
