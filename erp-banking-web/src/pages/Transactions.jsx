import { useEffect, useState } from 'react';
import { effectuerTransaction, getHistoriqueCompte, getAllTransactions } from '../service/transactionService';

const Transactions = () => {
    // ÉTATS FORMULAIRE
    const [formData, setFormData] = useState({
        type: 'DEPOT',
        montant: '',
        numeroCompteSource: '',
        numeroCompteDestination: '',
        description: ''
    });

    const [loadingForm, setLoadingForm] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    // ÉTATS HISTORIQUE / RECHERCHE
    const [numeroCompteRecherche, setNumeroCompteRecherche] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [historyError, setHistoryError] = useState('');

    useEffect(() => {
        if (!formSuccess) return;

        const timeout = setTimeout(() => {
            setFormSuccess('');
        }, 5000);

        return () => clearTimeout(timeout);
    }, [formSuccess]);

    // HANDLERS FORMULAIRE
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'type' && value !== 'VIREMENT' ? { numeroCompteDestination: '' } : {})
        }));
    };

    const handleTransactionSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        setLoadingForm(true);

        try {
            const res = await effectuerTransaction(formData);
            setFormSuccess(`Transaction réussie ! Réf: ${res.reference || 'OK'}`);

            // Afficher l'historique du compte source après ajout
            if (formData.numeroCompteSource) {
                setNumeroCompteRecherche(formData.numeroCompteSource);
                await chargerHistorique(formData.numeroCompteSource);
            }

            // Réinitialiser les champs montant et description
            setFormData(prev => ({ ...prev, montant: '', description: '' }));
        } catch (err) {
            setFormError(err.response?.data?.message || err.message || 'Erreur lors de la transaction');
        } finally {
            setLoadingForm(false);
        }
    };

    // HANDLER RECHERCHE HISTORIQUE
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

    useEffect(() => {
        chargerHistorique();
    }, []);

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        await chargerHistorique(numeroCompteRecherche);
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#1e293b' }}>
                Gestion des Transactions Bancaires
            </h1>

            {/* DISPOSITION CÔTÉ À CÔTÉ (GRID 2 COLONNES) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
                
                {/* COLONNE GAUCHE : FORMULAIRE */}
                <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#0f172a' }}>
                        Nouvelle Opération
                    </h2>

                    {formError && <div style={{ padding: '10px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '6px', marginBottom: '12px', fontSize: '14px' }}>{formError}</div>}
                    {formSuccess && <div style={{ padding: '10px', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '6px', marginBottom: '12px', fontSize: '14px' }}>{formSuccess}</div>}

                    <form onSubmit={handleTransactionSubmit}>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', fontWeight: '500' }}>Type d'opération</label>
                            <select 
                                name="type" 
                                value={formData.type} 
                                onChange={handleChange}
                                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                            >
                                <option value="DEPOT">Dépôt</option>
                                <option value="RETRAIT">Retrait</option>
                                <option value="VIREMENT">Virement</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', fontWeight: '500' }}>N° Compte Source</label>
                            <input
                                type="text"
                                name="numeroCompteSource"
                                value={formData.numeroCompteSource}
                                onChange={handleChange}
                                placeholder="ex: 00123456789"
                                required
                                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                            />
                        </div>

                        {formData.type === 'VIREMENT' && (
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', fontWeight: '500' }}>N° Compte Destination</label>
                                <input
                                    type="text"
                                    name="numeroCompteDestination"
                                    value={formData.numeroCompteDestination}
                                    onChange={handleChange}
                                    placeholder="ex: 00012345678"
                                    required
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                                />
                            </div>
                        )}

                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', fontWeight: '500' }}>Montant</label>
                            <input
                                type="number"
                                name="montant"
                                step="0.01"
                                min="1"
                                value={formData.montant}
                                onChange={handleChange}
                                placeholder="0.00"
                                required
                                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', fontWeight: '500' }}>Description</label>
                            <input
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Motif de l'opération"
                                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loadingForm}
                            style={{
                                width: '100%',
                                backgroundColor: '#2563eb',
                                color: '#ffffff',
                                border: 'none',
                                padding: '10px',
                                borderRadius: '6px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            {loadingForm ? 'Traitement...' : 'Valider la Transaction'}
                        </button>
                    </form>
                </div>

                {/* COLONNE DROITE : RECHERCHE + HISTORIQUE */}
                <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#0f172a' }}>
                        Historique des Transactions
                    </h2>

                    {/* BARRE DE RECHERCHE */}
                    <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                        <input
                            type="text"
                            value={numeroCompteRecherche}
                            onChange={(e) => setNumeroCompteRecherche(e.target.value)}
                            placeholder="Rechercher par N° de compte..."
                            style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                        <button
                            type="submit"
                            style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                        >
                            Rechercher
                        </button>
                    </form>

                    {historyError && <div style={{ padding: '10px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '6px', marginBottom: '12px', fontSize: '14px' }}>{historyError}</div>}

                    {/* TABLEAU HISTORIQUE */}
                    {loadingHistory ? (
                        <p style={{ textAlign: 'center', color: '#64748b' }}>Chargement de l'historique...</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                        <th style={{ padding: '10px' }}>Référence</th>
                                        <th style={{ padding: '10px' }}>Type</th>
                                        <th style={{ padding: '10px' }}>Montant</th>
                                        <th style={{ padding: '10px', minWidth: '220px', fontSize: '15px' }}>Comptes</th>
                                        <th style={{ padding: '10px' }}>Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                                                Saisissez un numéro de compte et cliquez sur Rechercher pour voir l'historique.
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions.map((tx) => {
                                            const numeroSource = tx.numeroCompteSource;
                                            const isDebit =
                                                numeroSource === numeroCompteRecherche 
                                                && tx.type !== 'DEPOT';
                                            return (
                                                <tr key={tx.id || tx.reference} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '10px', fontWeight: '600' }}>{tx.reference}</td>
                                                    <td style={{ padding: '10px' }}>{tx.type}</td>
                                                    <td style={{ padding: '10px', fontWeight: 'bold', color: isDebit ? '#ef4444' : '#22c55e' }}>
                                                        {isDebit ? `- ${tx.montant}` : `+ ${tx.montant}`}
                                                    </td>
                                                    <td style={{ padding: '10px', color: '#64748b' }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                            <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>
                                                                {tx.type === 'VIREMENT'
                                                                    ? `${tx.numeroCompteSource || '-'} ➔ ${tx.numeroCompteDestination || '-'}`
                                                                    : tx.numeroCompteSource || '-'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '10px' }}>
                                                        <span style={{ 
                                                            padding: '4px 8px', 
                                                            borderRadius: '4px', 
                                                            fontSize: '12px', 
                                                            fontWeight: '600',
                                                            backgroundColor: tx.statut === 'SUCCES' ? '#dcfce7' : '#fee2e2',
                                                            color: tx.statut === 'SUCCES' ? '#15803d' : '#b91c1c'
                                                        }}>
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
                    )}
                </div>

            </div>
        </div>
    );
};

export default Transactions;