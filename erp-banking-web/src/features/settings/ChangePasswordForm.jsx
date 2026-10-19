import { useState } from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';
import authService from '../../service/authService';

const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: 'var(--text-primary)' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--input-border)', boxSizing: 'border-box', fontSize: '14px', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)' };
const errorStyle = { marginTop: '6px', color: '#dc2626', fontSize: '12px' };
const eyeButtonStyle = { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: 'var(--faint)', display: 'flex', alignItems: 'center' };

const REGLE_LETTRE = /[A-Za-z]/;
const REGLE_CHIFFRE = /\d/;
const REGLE_SPECIAL = /[^A-Za-z0-9]/;

function reglesMotDePasse(motDePasse) {
  return [
    { label: 'Au moins 8 caractères', valide: motDePasse.length >= 8 },
    { label: 'Une lettre (a-z, A-Z)', valide: REGLE_LETTRE.test(motDePasse) },
    { label: 'Un chiffre (0-9)', valide: REGLE_CHIFFRE.test(motDePasse) },
    { label: 'Un caractère spécial (!@#$…)', valide: REGLE_SPECIAL.test(motDePasse) },
  ];
}

function estMotDePasseValide(motDePasse) {
  return reglesMotDePasse(motDePasse).every((regle) => regle.valide);
}

function PasswordField({ label, name, value, onChange, error, placeholder, visible, onToggle }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={labelStyle}>{label} <span style={{ color: '#dc2626' }}>*</span></label>
      <div style={{ position: 'relative' }}>
        <input
          type={visible ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{ ...inputStyle, paddingRight: '42px' }}
        />
        <button
          type="button"
          onClick={onToggle}
          title={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          style={eyeButtonStyle}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <div style={errorStyle}>{error}</div>}
    </div>
  );
}

function ChangePasswordForm({ onCancel, onSuccess }) {
  const [formData, setFormData] = useState({
    ancienMotDePasse: '',
    nouveauMotDePasse: '',
    confirmationMotDePasse: '',
  });
  const [visible, setVisible] = useState({ ancien: false, nouveau: false, confirmation: false });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const toggleVisible = (field) => {
    setVisible((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const regles = reglesMotDePasse(formData.nouveauMotDePasse);

  const validate = () => {
    const errors = {};
    if (!formData.ancienMotDePasse) errors.ancienMotDePasse = "L'ancien mot de passe est obligatoire.";
    if (!formData.nouveauMotDePasse) {
      errors.nouveauMotDePasse = 'Le nouveau mot de passe est obligatoire.';
    } else if (!estMotDePasseValide(formData.nouveauMotDePasse)) {
      errors.nouveauMotDePasse = 'Le mot de passe ne respecte pas les règles de sécurité ci-dessous.';
    } else if (formData.nouveauMotDePasse === formData.ancienMotDePasse) {
      errors.nouveauMotDePasse = "Le nouveau mot de passe doit être différent de l'ancien.";
    }
    if (!formData.confirmationMotDePasse) {
      errors.confirmationMotDePasse = 'La confirmation du mot de passe est obligatoire.';
    } else if (formData.confirmationMotDePasse !== formData.nouveauMotDePasse) {
      errors.confirmationMotDePasse = 'Les deux mots de passe ne correspondent pas.';
    }
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
      await authService.changePassword(formData);
      onSuccess();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Impossible de modifier le mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>

      {submitError && (
        <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '6px', backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '13px' }}>
          {submitError}
        </div>
      )}

      <PasswordField
        label="Ancien mot de passe"
        name="ancienMotDePasse"
        value={formData.ancienMotDePasse}
        onChange={handleChange}
        error={fieldErrors.ancienMotDePasse}
        placeholder="Votre mot de passe actuel"
        visible={visible.ancien}
        onToggle={() => toggleVisible('ancien')}
      />

      <PasswordField
        label="Nouveau mot de passe"
        name="nouveauMotDePasse"
        value={formData.nouveauMotDePasse}
        onChange={handleChange}
        error={fieldErrors.nouveauMotDePasse}
        placeholder="Au moins 8 caractères"
        visible={visible.nouveau}
        onToggle={() => toggleVisible('nouveau')}
      />

      <div style={{ marginTop: '-6px', marginBottom: '18px', padding: '12px 14px', borderRadius: '6px', backgroundColor: 'var(--table-header)' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Le mot de passe doit contenir :
        </div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {regles.map((regle) => (
            <li key={regle.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', marginBottom: '4px', color: regle.valide ? '#15803d' : 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: regle.valide ? '#dcfce7' : 'var(--input-border)' }}>
                {regle.valide && <Check size={11} color="#15803d" />}
              </span>
              {regle.label}
            </li>
          ))}
        </ul>
      </div>

      <PasswordField
        label="Confirmer le nouveau mot de passe"
        name="confirmationMotDePasse"
        value={formData.confirmationMotDePasse}
        onChange={handleChange}
        error={fieldErrors.confirmationMotDePasse}
        placeholder="Retapez le nouveau mot de passe"
        visible={visible.confirmation}
        onToggle={() => toggleVisible('confirmation')}
      />

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px', borderRadius: '6px', border: 'none',
            backgroundColor: loading ? '#93c5fd' : '#2563eb', color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px',
          }}
        >
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid var(--input-border)', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
        >
          Annuler
        </button>
      </div>

    </form>
  );
}

export default ChangePasswordForm;
