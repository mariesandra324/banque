/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { previewNumero } from '../../service/compteService';

const TYPES_COMPTE = ['Courant', 'Epargne', 'A terme', 'Devises'];

// Banque fictive du projet (fixes, non modifiables depuis le formulaire)
const CODE_BANQUE = '00090';


function CompteForm({ compte, clients, onSubmit, onCancel }) {
  const codeGuichet = localStorage.getItem("codeGuichet");
  console.log("codeGuichet", codeGuichet);
  const isEditing = !!compte;

  const [formData, setFormData] = useState({
    numeroCompte: '',
    typeCompte: '',
    solde: '0',
    statut: 'ACTIF',
    clientId: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (compte) {
      setFormData({
        numeroCompte: compte.numeroCompte || '',
        typeCompte: compte.typeCompte || '',
        solde: compte.solde?.toString() ?? '0',
        statut: compte.statut || '',
        clientId: compte.clientId?.toString() || '',
        codeGuichet
      });
      console.log('data');
    } else {
      setFormData({ numeroCompte: '', typeCompte: '', solde: '0', statut: 'ACTIF', clientId: '', codeGuichet });
    }
    setFieldErrors({});
    
  }, [compte]);

  // Prévisualise le numéro de compte généré côté backend (création seulement)
  useEffect(() => {
    const fetchPreview = async () => {
      if (isEditing) return;
      const clientId = Number(formData.clientId);
      const type = formData.typeCompte;
      if (!clientId || !type) {
        setFormData((f) => ({ ...f, numeroCompte: '' }));
        return;
      }
      try {
        const resp = await previewNumero(clientId, type);
        setFormData((f) => ({ ...f, numeroCompte: resp.data.numeroCompte || '' }));
      } catch {
        setFormData((f) => ({ ...f, numeroCompte: '' }));
      }
    };
    fetchPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.clientId, formData.typeCompte, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errors = {};
    if (!formData.typeCompte.trim()) errors.typeCompte = 'Le type de compte est requis.';
    if (!formData.clientId) errors.clientId = 'Le client associé est requis.';
    const soldeValue = Number(formData.solde.replace(',', '.'));
    if (formData.solde.toString().trim() === '' || Number.isNaN(soldeValue)) {
      errors.solde = 'Le solde doit être un nombre valide.';
    }
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    console.log("Code guichet envoyé :", formData.codeGuichet);
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    onSubmit({
      typeCompte: formData.typeCompte.trim(),
      solde: Number(formData.solde.replace(',', '.')),
      statut: formData.statut.trim(),
      clientId: Number(formData.clientId),
    });
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
          <div style={cardTitleStyle}>Informations générales</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Numéro de compte</label>
              <input
                type="text"
                value={formData.numeroCompte}
                disabled
                placeholder={isEditing ? '' : 'Généré après sélection client/type'}
                style={{ ...inputStyle, backgroundColor: '#f3f4f6', color: '#6b7280' }}
              />
              {!isEditing && !formData.numeroCompte && (
                <div style={{ marginTop: '6px', color: '#9ca3af', fontSize: '12px' }}>
                  Sélectionnez un client et un type pour générer le numéro.
                </div>
              )}
            </div>

            <div>
              <label style={labelStyle}>
                Type de compte <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                name="typeCompte"
                value={formData.typeCompte}
                onChange={handleInputChange}
                required
                style={{ ...inputStyle, backgroundColor: 'white' }}
              >
                <option value="">Sélectionnez un type</option>
                {TYPES_COMPTE.map((type) => (
                  <option key={type} value={type}>
                    {type === 'Epargne' ? 'Épargne' : type === 'A terme' ? 'À terme' : type}
                  </option>
                ))}
              </select>
              {fieldErrors.typeCompte && <div style={{ marginTop: '6px', color: '#dc2626', fontSize: '12px' }}>{fieldErrors.typeCompte}</div>}
            </div>

            <div>
              <label style={labelStyle}>
                Solde <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="solde"
                value={formData.solde}
                onChange={handleInputChange}
                required
                style={inputStyle}
              />
              {fieldErrors.solde && <div style={{ marginTop: '6px', color: '#dc2626', fontSize: '12px' }}>{fieldErrors.solde}</div>}
            </div>

            <div>
              <label style={labelStyle}>
                Client associé <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                name="clientId"
                value={formData.clientId}
                onChange={handleInputChange}
                required
                style={inputStyle}
              >
                <option value="">Sélectionnez un client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.nom} {client.prenom} {client.cin ? `- ${client.cin}` : ''}
                  </option>
                ))}
              </select>
              {fieldErrors.clientId && <div style={{ marginTop: '6px', color: '#dc2626', fontSize: '12px' }}>{fieldErrors.clientId}</div>}
            </div>
          </div>
        </div>

        {/* ===== Colonne latérale ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div style={cardStyle}>
            <div style={cardTitleStyle}>Informations bancaires</div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Code banque</label>
              <input
                type="text"
                value={CODE_BANQUE}
                disabled
                style={{ ...inputStyle, backgroundColor: '#f3f4f6', color: '#6b7280', fontFamily: 'monospace' }}
              />
            </div>

            <div>
              <label style={labelStyle}>Code guichet</label>
              <input
                type="text"
                value={codeGuichet || ""}
                disabled
                style={{ ...inputStyle, backgroundColor: '#f3f4f6', color: '#6b7280', fontFamily: 'monospace' }}
              />
            </div>

            <div style={{ marginTop: '6px', color: '#9ca3af', fontSize: '12px' }}>
              Fixes pour tous les comptes de la banque.
            </div>
          </div>

          {isEditing && (compte.cleRib || compte.iban) && (
            <div style={cardStyle}>
              <div style={cardTitleStyle}>RIB / IBAN</div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Clé RIB</label>
                <input
                  type="text"
                  value={compte.cleRib || '-'}
                  disabled
                  style={{ ...inputStyle, backgroundColor: '#f3f4f6', color: '#6b7280', fontFamily: 'monospace' }}
                />
              </div>
              <div>
                <label style={labelStyle}>IBAN</label>
                <input
                  type="text"
                  value={compte.iban || '-'}
                  disabled
                  style={{ ...inputStyle, backgroundColor: '#f3f4f6', color: '#6b7280', fontFamily: 'monospace', fontSize: '12px' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== Actions ===== */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button
          type="submit"
          style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#2563eb', color: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
        >
          {isEditing ? 'Enregistrer' : 'Créer'}
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

export default CompteForm;
