import { useState, useEffect } from 'react';
import { clientService } from '../../service/clientService';

const PHONE_PREFIX = '+261';

function ClientForm({ client, onSuccess, onCancel }) {
  const isEditing = !!client;

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    cin: '',
    email: '',
    telephone: PHONE_PREFIX,
    adresse: '',
    dateNaissance: '',
  });
  const [accesMobile, setAccesMobile] = useState({
    creerAccesMobile: true,
    identifiantMobile: '',
    codePersonnel: '000000',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (client) {
      let formattedDate = '';
      if (client.dateNaissance) {
        const rawDate = typeof client.dateNaissance === 'string'
          ? client.dateNaissance
          : new Date(client.dateNaissance).toISOString();
        formattedDate = rawDate.substring(0, 10);
      }

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        nom: client.nom || '',
        prenom: client.prenom || '',
        cin: client.cin || '',
        email: client.email || '',
        telephone: client.telephone || PHONE_PREFIX,
        adresse: client.adresse || '',
        dateNaissance: formattedDate,
      });
    } else {
      setFormData({ nom: '', prenom: '', cin: '', email: '', telephone: PHONE_PREFIX, adresse: '', dateNaissance: '' });
    }
    setFieldErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'telephone') {
      let normalized = value;
      if (!normalized.startsWith(PHONE_PREFIX)) {
        const afterPrefix = normalized.replace(/^\+?261/, '');
        normalized = PHONE_PREFIX + afterPrefix;
      }
      setFormData((prev) => ({ ...prev, telephone: normalized }));
      setFieldErrors((prev) => ({ ...prev, telephone: '' }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleAccesMobileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAccesMobile((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validate = () => {
    const phoneRegex = /^\+261\s?(32|33|34|37|38)\s?\d{2}\s?\d{3}\s?\d{2}$|^\+261(32|33|34|37|38)\d{7}$/;
    const errors = {};

    if (!formData.nom.trim()) errors.nom = 'Le nom est requis.';
    if (!formData.prenom.trim()) errors.prenom = 'Le prénom est requis.';
    if (!formData.email.trim()) errors.email = "L'email est requis.";
    if (!formData.adresse.trim()) errors.adresse = "L'adresse est requise.";
    if (!formData.dateNaissance) errors.dateNaissance = 'La date de naissance est requise.';

    const cinValue = formData.cin?.trim() || '';
    if (!/^[0-9]{12}$/.test(cinValue)) {
      errors.cin = 'Le CIN doit contenir exactement 12 chiffres.';
    }

    if (!phoneRegex.test(formData.telephone.trim())) {
      errors.telephone = 'Téléphone incorrect. Utilisez +261 suivi de 9 chiffres valides.';
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
      if (isEditing) {
        await clientService.updateClient(client.id, formData);
      } else {
        await clientService.createClient({
          ...formData,
          creerAccesMobile: accesMobile.creerAccesMobile,
          identifiantMobile: accesMobile.identifiantMobile.trim() || (formData.email || '').trim(),
          codePersonnel: accesMobile.codePersonnel.trim() || '000000',
        });
      }
      onSuccess();
    } catch (err) {
      setSubmitError(err.message || "Impossible d'enregistrer le client.");
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: 'var(--text-primary)' };
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--input-border)', boxSizing: 'border-box', fontSize: '14px', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)' };
  const cardStyle = { backgroundColor: 'var(--card-bg)', borderRadius: '10px', border: '1px solid var(--border-color)', padding: '24px' };
  const cardTitleStyle = { fontSize: '15px', fontWeight: '700', color: 'var(--heading)', marginBottom: '18px' };

  return (
    <form onSubmit={handleSubmit}>
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
              <input name="nom" value={formData.nom} onChange={handleChange} style={inputStyle} />
              {fieldErrors.nom && <div style={{ marginTop: '6px', color: '#dc2626', fontSize: '12px' }}>{fieldErrors.nom}</div>}
            </div>

            <div>
              <label style={labelStyle}>Prénom <span style={{ color: '#dc2626' }}>*</span></label>
              <input name="prenom" value={formData.prenom} onChange={handleChange} style={inputStyle} />
              {fieldErrors.prenom && <div style={{ marginTop: '6px', color: '#dc2626', fontSize: '12px' }}>{fieldErrors.prenom}</div>}
            </div>

            <div>
              <label style={labelStyle}>Email <span style={{ color: '#dc2626' }}>*</span></label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} />
              {fieldErrors.email && <div style={{ marginTop: '6px', color: '#dc2626', fontSize: '12px' }}>{fieldErrors.email}</div>}
            </div>

            <div>
              <label style={labelStyle}>Téléphone <span style={{ color: '#dc2626' }}>*</span></label>
              <input name="telephone" value={formData.telephone} onChange={handleChange} style={inputStyle} />
              {fieldErrors.telephone && <div style={{ marginTop: '6px', color: '#dc2626', fontSize: '12px' }}>{fieldErrors.telephone}</div>}
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Adresse <span style={{ color: '#dc2626' }}>*</span></label>
              <input name="adresse" value={formData.adresse} onChange={handleChange} style={inputStyle} />
              {fieldErrors.adresse && <div style={{ marginTop: '6px', color: '#dc2626', fontSize: '12px' }}>{fieldErrors.adresse}</div>}
            </div>
          </div>
        </div>

        {/* ===== Colonne latérale ===== */}
        <div style={cardStyle}>
          <div style={cardTitleStyle}>Identification</div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>CIN <span style={{ color: '#dc2626' }}>*</span></label>
            <input
              name="cin"
              value={formData.cin}
              onChange={handleChange}
              placeholder="12 chiffres"
              style={{ ...inputStyle, fontFamily: 'monospace' }}
            />
            {fieldErrors.cin && <div style={{ marginTop: '6px', color: '#dc2626', fontSize: '12px' }}>{fieldErrors.cin}</div>}
          </div>

          <div>
            <label style={labelStyle}>Date de naissance <span style={{ color: '#dc2626' }}>*</span></label>
            <input
              type="date"
              name="dateNaissance"
              value={formData.dateNaissance}
              onChange={handleChange}
              style={inputStyle}
            />
            {fieldErrors.dateNaissance && <div style={{ marginTop: '6px', color: '#dc2626', fontSize: '12px' }}>{fieldErrors.dateNaissance}</div>}
          </div>
        </div>
      </div>

      {/* ===== Client mobile (ajout uniquement) ===== */}
      {!isEditing && (
        <div style={{ ...cardStyle, marginTop: '20px' }}>
          <div style={cardTitleStyle}>Client mobile</div>
          <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Créez en même temps l'accès mobile du client. Le code personnel est
            <strong> 000000</strong> par défaut : le client le changera selon ses choix
            depuis l'application mobile.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <input
              type="checkbox"
              name="creerAccesMobile"
              checked={accesMobile.creerAccesMobile}
              onChange={handleAccesMobileChange}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label style={{ fontWeight: '500', fontSize: '14px', color: 'var(--text-primary)', cursor: 'pointer' }}>
              Créer l'accès mobile pour ce client
            </label>
          </div>

          {accesMobile.creerAccesMobile && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Identifiant mobile</label>
                <input
                  name="identifiantMobile"
                  value={accesMobile.identifiantMobile || formData.email || ''}
                  onChange={handleAccesMobileChange}
                  placeholder="ex : 0341234567"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Code personnel</label>
                <input
                  name="codePersonnel"
                  value={accesMobile.codePersonnel}
                  onChange={handleAccesMobileChange}
                  placeholder="000000"
                  style={{ ...inputStyle, fontFamily: 'monospace' }}
                />
                <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Le client pourra le modifier selon ses choix.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
          style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid var(--input-border)', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

export default ClientForm;
