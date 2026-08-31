import { useState } from 'react';
import { effectuerTransaction } from '../../service/transactionService';

const TYPES_TRANSACTION = [
  { value: 'DEPOT', label: 'Dépôt' },
  { value: 'RETRAIT', label: 'Retrait' },
  { value: 'VIREMENT', label: 'Virement' },
];

const DESCRIPTIONS_TYPE = {
  DEPOT: "Ajoute des fonds sur le compte source. Aucun compte destination requis.",
  RETRAIT: "Retire des fonds du compte source. Le solde doit être suffisant.",
  VIREMENT: "Transfère des fonds du compte source vers le compte destination.",
};

const TransactionForm = ({ onTransactionSuccess }) => {
  const [formData, setFormData] = useState({
    type: 'DEPOT',
    montant: '',
    numeroCompteSource: '',
    numeroCompteDestination: '',
    description: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await effectuerTransaction(formData);
      setSuccess(`Transaction ${result.reference} effectuée avec succès !`);
      setFormData({ ...formData, montant: '', description: '' });

      if (onTransactionSuccess) {
        onTransactionSuccess(formData.numeroCompteSource);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'exécution de la transaction.");
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: '#374151' };
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '14px' };
  const cardStyle = { backgroundColor: 'white', borderRadius: '10px', border: '1px solid #e5e7eb', padding: '24px' };
  const cardTitleStyle = { fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '18px' };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'start' }}>

        {/* ===== Colonne principale ===== */}
        <div style={cardStyle}>
          <div style={cardTitleStyle}>Détails de la transaction</div>

          {error && (
            <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '6px', backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '13px' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '6px', backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #d1fae5', fontSize: '13px' }}>
              {success}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Type de transaction <span style={{ color: '#dc2626' }}>*</span></label>
              <select name="type" value={formData.type} onChange={handleChange} style={inputStyle}>
                {TYPES_TRANSACTION.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Montant <span style={{ color: '#dc2626' }}>*</span></label>
              <input
                type="number"
                step="0.01"
                min="1"
                name="montant"
                value={formData.montant}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Compte source <span style={{ color: '#dc2626' }}>*</span></label>
              <input
                type="text"
                name="numeroCompteSource"
                value={formData.numeroCompteSource}
                onChange={handleChange}
                placeholder="Ex: 01234567890"
                required
                style={inputStyle}
              />
            </div>

            {formData.type === 'VIREMENT' && (
              <div>
                <label style={labelStyle}>Compte destination <span style={{ color: '#dc2626' }}>*</span></label>
                <input
                  type="text"
                  name="numeroCompteDestination"
                  value={formData.numeroCompteDestination}
                  onChange={handleChange}
                  placeholder="Ex: 02987654321"
                  required
                  style={inputStyle}
                />
              </div>
            )}

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Raison de la transaction"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* ===== Colonne latérale : aperçu du type sélectionné ===== */}
        <div style={cardStyle}>
          <div style={cardTitleStyle}>Aperçu</div>
          <div
            style={{
              display: 'inline-block',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '14px',
              backgroundColor:
                formData.type === 'DEPOT' ? '#dcfce7' : formData.type === 'RETRAIT' ? '#fee2e2' : '#dbeafe',
              color:
                formData.type === 'DEPOT' ? '#15803d' : formData.type === 'RETRAIT' ? '#b91c1c' : '#1d4ed8',
            }}
          >
            {TYPES_TRANSACTION.find((t) => t.value === formData.type)?.label}
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5', margin: 0 }}>
            {DESCRIPTIONS_TYPE[formData.type]}
          </p>
        </div>
      </div>

      {/* ===== Actions ===== */}
      <div style={{ marginTop: '20px' }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 24px', borderRadius: '6px', border: 'none',
            backgroundColor: loading ? '#93c5fd' : '#2563eb', color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px',
          }}
        >
          {loading ? 'Traitement...' : 'Valider la transaction'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
