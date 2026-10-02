import { useState } from 'react';
import { X } from 'lucide-react';
import { clientService } from '../../service/clientService';

const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: 'var(--text-primary)' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--input-border)', boxSizing: 'border-box', fontSize: '14px', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)' };
const errorStyle = { marginTop: '6px', color: '#dc2626', fontSize: '12px' };

function ClientMobileModal({ client, onClose, onSuccess }) {
  const [formData, setFormData] = useState({ identifiant: '', motDePasse: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errors = {};
    if (!formData.identifiant.trim()) errors.identifiant = "L'identifiant est obligatoire.";
    if (!formData.motDePasse) errors.motDePasse = 'Le mot de passe est obligatoire.';
    else if (formData.motDePasse.length < 6) errors.motDePasse = 'Le mot de passe doit contenir au moins 6 caractères.';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setSubmitError('');
    try {
      await clientService.createAccesMobile(client.id, formData);
      onSuccess();
    } catch (err) {
      setSubmitError(err.message || "Impossible de créer l'accès mobile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)',
          padding: '24px', width: '100%', maxWidth: '440px', boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--heading)', margin: 0 }}>
            Créer l'accès mobile
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
            <X size={18} color="var(--text-secondary)" />
          </button>
        </div>

        <div style={{ marginBottom: '18px', padding: '10px 14px', borderRadius: '6px', backgroundColor: 'var(--table-header)', color: 'var(--text-secondary)', fontSize: '13px' }}>
          Client : <strong style={{ color: 'var(--text-primary)' }}>{client.nom} {client.prenom}</strong> (CIN : {client.cin})
        </div>

        {submitError && (
          <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '6px', backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '13px' }}>
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Identifiant mobile <span style={{ color: '#dc2626' }}>*</span></label>
            <input
              name="identifiant"
              value={formData.identifiant}
              onChange={handleChange}
              placeholder="ex : 0341234567"
              style={inputStyle}
            />
            {fieldErrors.identifiant && <div style={errorStyle}>{fieldErrors.identifiant}</div>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Mot de passe <span style={{ color: '#dc2626' }}>*</span></label>
            <input
              type="password"
              name="motDePasse"
              value={formData.motDePasse}
              onChange={handleChange}
              placeholder="Au moins 6 caractères"
              style={inputStyle}
            />
            {fieldErrors.motDePasse && <div style={errorStyle}>{fieldErrors.motDePasse}</div>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid var(--input-border)', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px', borderRadius: '6px', border: 'none',
                backgroundColor: loading ? '#93c5fd' : '#2563eb', color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px',
              }}
            >
              {loading ? 'Création...' : 'Créer l\'accès'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClientMobileModal;