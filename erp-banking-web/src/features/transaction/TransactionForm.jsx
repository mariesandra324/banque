import  { useState } from 'react';
import { effectuerTransaction } from '../../service/transactionService';

const TransactionForm = ({ onTransactionSuccess }) => {
    const [formData, setFormData] = useState({
        type: 'DEPOT',
        montant: '',
        numeroCompteSource: '',
        numeroCompteDestination: '',
        description: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const result = await effectuerTransaction(formData);
            setSuccess(`Transaction ${result.reference} effectuée avec succès !`);
            
            // Reinitialiser les montants
            setFormData({ ...formData, montant: '', description: '' });
            
            // Notifier le composant parent pour rafraîchir l'historique
            if (onTransactionSuccess) {
                onTransactionSuccess(formData.numeroCompteSource);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'exécution de la transaction.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Nouvelle Transaction</h2>

            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            {success && <div style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Type de transaction : </label>
                    <select name="type" value={formData.type} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
                        <option value="DEPOT">Dépôt</option>
                        <option value="RETRAIT">Retrait</option>
                        <option value="VIREMENT">Virement</option>
                    </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Compte Source (N° Compte) : </label>
                    <input
                        type="text"
                        name="numeroCompteSource"
                        value={formData.numeroCompteSource}
                        onChange={handleChange}
                        placeholder="Ex: 00123456789"
                        required
                        style={{ width: '100%', padding: '10px', fontSize: '16px' }}
                    />
                </div>

                {formData.type === 'VIREMENT' && (
                    <div style={{ marginBottom: '15px' }}>
                        <label>Compte Destination (N° Compte) : </label>
                        <input
                            type="text"
                            name="numeroCompteDestination"
                            value={formData.numeroCompteDestination}
                            onChange={handleChange}
                            placeholder="Ex: 00012345678"
                            required
                            style={{ width: '100%', padding: '10px', fontSize: '16px' }}
                        />
                    </div>
                )}

                <div style={{ marginBottom: '15px' }}>
                    <label>Montant (€ / Ar) : </label>
                    <input
                        type="number"
                        step="0.01"
                        min="1"
                        name="montant"
                        value={formData.montant}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '10px', fontSize: '16px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Description : </label>
                    <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Raison de la transaction"
                        style={{ width: '100%', padding: '10px', fontSize: '16px' }}
                    />
                </div>

                <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    {loading ? 'Traitement...' : 'Valider la transaction'}
                </button>
            </form>
        </div>
    );
};

export default TransactionForm;