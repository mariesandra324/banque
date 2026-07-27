

const TransactionHistory = ({ transactions, numeroCompteActuel }) => {
    return (
        <div style={{ maxWidth: '800px', margin: '20px auto' }}>
            <h3>Historique des Transactions</h3>
            {transactions.length === 0 ? (
                <p>Aucune transaction à afficher.</p>
            ) : (
                <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                            <th>Référence</th>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Montant</th>
                            <th>Source / Dest.</th>
                            <th>Description</th>
                            <th>Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx) => {
                            const estDebit = tx.numeroCompteSource === numeroCompteActuel && tx.type !== 'DEPOT';
                            return (
                                <tr key={tx.id}>
                                    <td><strong>{tx.reference}</strong></td>
                                    <td>{new Date(tx.dateTransaction).toLocaleString()}</td>
                                    <td>{tx.type}</td>
                                    <td style={{ color: estDebit ? 'red' : 'green', fontWeight: 'bold' }}>
                                        {estDebit ? `- ${tx.montant}` : `+ ${tx.montant}`}
                                    </td>
                                    <td>
                                        {tx.type === 'VIREMENT'
                                        ? `${tx.compteSource?.numeroCompte} ➔ ${tx.compteDestination?.numeroCompte}`
                                        : tx.compteSource?.numeroCompte}
                                    </td>
                                    <td>{tx.description || '-'}</td>
                                    <td>
                                        <span style={{ color: tx.statut === 'SUCCES' ? 'green' : 'red' }}>
                                            {tx.statut}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default TransactionHistory;