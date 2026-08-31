import { useState, useEffect } from 'react';
import api from '../../service/api';
import { createUtilisateur, updateUtilisateur } from '../../service/utilisateursService';

function UtilisateurForm({ utilisateur, onSuccess, onCancel }) {
  const isEditing = !!utilisateur;

  const [roles, setRoles] = useState([]);
  const [guichets, setGuichets] = useState([]);
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    motDePasse: '',
    roleId: '',
    guichetId: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
    try {
      const [rolesResponse, guichetsResponse] = await Promise.all([
        api.get('/roles'),
        api.get('/guichets/disponibles')
      ]);

      setRoles(rolesResponse.data);
      setGuichets(guichetsResponse.data);
    } catch (error) {
      console.error('Erreur lors du chargement des données :', error);
    }
  };

  loadData();

  if (utilisateur) {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      nom: utilisateur.nom || '',
      prenom: utilisateur.prenom || '',
      email: utilisateur.email || '',
      telephone: utilisateur.telephone || '',
      motDePasse: '',
      roleId: utilisateur.role?.id || '',
      guichetId: utilisateur.guichet?.id || '',
    });
  } else {
    setForm({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      motDePasse: '',
      roleId: '',
      guichetId: ''
    });
  }
  console.log("GUICHETS :", guichets);
  console.log("GUICHET ID FORM :", form.guichetId);
  setFieldErrors({});
}, [utilisateur]);

  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
  };

  const validate = () => {
    const errors = {};
    if (!form.nom.trim()) errors.nom = 'Le nom est requis.';
    if (!form.prenom.trim()) errors.prenom = 'Le prénom est requis.';
    if (!form.email.trim()) {
      errors.email = "L'email est requis.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      errors.email = 'Email invalide.';
    }
    if (!isEditing && !form.motDePasse.trim()) errors.motDePasse = 'Le mot de passe est requis.';
    if (!form.roleId) errors.roleId = 'Le rôle est requis.';
    return errors;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setSubmitError('');
    try {
      if (utilisateur) {
        await updateUtilisateur(utilisateur.id, form);
      } else {
        await createUtilisateur(form);
      }
      onSuccess();
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Impossible d'enregistrer l'utilisateur.");
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: '#374151' };
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '14px' };
  const cardStyle = { backgroundColor: 'white', borderRadius: '10px', border: '1px solid #e5e7eb', padding: '24px' };
  const cardTitleStyle = { fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '18px' };

  return (
    <form onSubmit={submit}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'start' }}>

        {/* ===== Colonne principale ===== */}
        <div style={cardStyle}>
          <div style={cardTitleStyle}>Informations générales</div>

          {submitError && (
            <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '6px', backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '13px' }}>
              {submitError}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Nom <span style={{ color: '#dc2626' }}>*</span></label>
              <input name="nom" value={form.nom} onChange={change} style={inputStyle} />
              {fieldErrors.nom && <div style={{ marginTop: '6px', color: '#dc2626', fontSize: '12px' }}>{fieldErrors.nom}</div>}
            </div>

            <div>
              <label style={labelStyle}>Prénom <span style={{ color: '#dc2626' }}>*</span></label>
              <input name="prenom" value={form.prenom} onChange={change} style={inputStyle} />
              {fieldErrors.prenom && <div style={{ marginTop: '6px', color: '#dc2626', fontSize: '12px' }}>{fieldErrors.prenom}</div>}
            </div>

            <div>
              <label style={labelStyle}>Email <span style={{ color: '#dc2626' }}>*</span></label>
              <input type="email" name="email" value={form.email} onChange={change} style={inputStyle} />
              {fieldErrors.email && <div style={{ marginTop: '6px', color: '#dc2626', fontSize: '12px' }}>{fieldErrors.email}</div>}
            </div>

            <div>
              <label style={labelStyle}>Téléphone</label>
              <input name="telephone" value={form.telephone} onChange={change} style={inputStyle} />
            </div>

            {!isEditing && (
              <div>
                <label style={labelStyle}>Mot de passe <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="password" name="motDePasse" value={form.motDePasse} onChange={change} style={inputStyle} />
                {fieldErrors.motDePasse && <div style={{ marginTop: '6px', color: '#dc2626', fontSize: '12px' }}>{fieldErrors.motDePasse}</div>}
              </div>
            )}
          </div>
        </div>

        {/* ===== Colonne latérale ===== */}
        <div style={cardStyle}>
          <div style={cardTitleStyle}>Rôle & Affectation</div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Rôle <span style={{ color: '#dc2626' }}>*</span></label>
            <select name="roleId" value={form.roleId} onChange={change} style={inputStyle}>
              <option value="">Choisir un rôle</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.nom}</option>
              ))}
            </select>
            {fieldErrors.roleId && <div style={{ marginTop: '6px', color: '#dc2626', fontSize: '12px' }}>{fieldErrors.roleId}</div>}
          </div>

          <div>
            <div>
            <label style={labelStyle}>
              Code guichet <span style={{ color: '#dc2626' }}>*</span>
            </label>

            <select name="guichetId" value={form.guichetId}onChange={change}style={{...inputStyle,fontFamily: 'monospace'}}>
              <option value="">Choisir un guichet disponible</option>
              {guichets.map((guichet) => (
                <option key={guichet.id} value={guichet.id}>{guichet.codeGuichet}</option>
              ))}
            </select>

            {fieldErrors.guichetId && (
              <div style={{ marginTop: '6px',color: '#dc2626',fontSize: '12px'}}>
                {fieldErrors.guichetId}
              </div>
              )}
            </div>
            <div style={{ marginTop: '6px', color: '#9ca3af', fontSize: '12px' }}>
              Agence à laquelle l'utilisateur est rattaché.
            </div>
          </div>
        </div>
      </div>

      {/* ===== Actions ===== */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px', borderRadius: '6px', border: 'none',
            backgroundColor: loading ? '#93c5fd' : '#2563eb', color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px',
          }}
        >
          {loading ? 'Enregistrement...' : isEditing ? 'Enregistrer' : 'Ajouter'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white', color: '#374151', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

export default UtilisateurForm;
