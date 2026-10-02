/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { previewNumero } from '../../service/compteService';

const TYPES_COMPTE = ['Courant', 'Epargne'];

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

  const [hasCard, setHasCard] = useState(false);

const [cardData, setCardData] = useState({
  typeCarte: 'VISA',
});

const handleCardChange = (e) => {
  const { name, value } = e.target;

  setCardData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

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

  const compteData = {
    typeCompte: formData.typeCompte.trim(),
    solde: Number(formData.solde.replace(',', '.')),
    statut: formData.statut.trim(),
    clientId: Number(formData.clientId),

    // ===== CARTE =====
    hasCard: hasCard,
    ...(hasCard && {
      typeCarte: cardData.typeCarte,
    }),
  };

  console.log("Données envoyées :", compteData);

  onSubmit(compteData);
};

  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: 'var(--text-primary)' };
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--input-border)', boxSizing: 'border-box', fontSize: '14px', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)' };
  const disabledStyle = { backgroundColor: 'var(--table-header)', color: 'var(--muted)' };
  const cardStyle = { backgroundColor: 'var(--card-bg)', borderRadius: '10px', border: '1px solid var(--border-color)', padding: '24px' };
  const cardTitleStyle = { fontSize: '15px', fontWeight: '700', color: 'var(--heading)', marginBottom: '18px' };

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
                style={{ ...inputStyle, ...disabledStyle }}
              />
              {!isEditing && !formData.numeroCompte && (
                <div style={{ marginTop: '6px', color: 'var(--faint)', fontSize: '12px' }}>
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
                style={{ ...inputStyle, backgroundColor: 'var(--card-bg)' }}
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
                style={{ ...inputStyle, ...disabledStyle, fontFamily: 'monospace' }}
              />
            </div>

            <div>
              <label style={labelStyle}>Code guichet</label>
              <input
                type="text"
                value={codeGuichet || ""}
                disabled
                style={{ ...inputStyle, ...disabledStyle, fontFamily: 'monospace' }}
              />
            </div>

            <div style={{ marginTop: '6px', color: 'var(--faint)', fontSize: '12px' }}>
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
                  style={{ ...inputStyle, ...disabledStyle, fontFamily: 'monospace' }}
                />
              </div>
              <div>
                <label style={labelStyle}>IBAN</label>
                <input
                  type="text"
                  value={compte.iban || '-'}
                  disabled
                  style={{ ...inputStyle, ...disabledStyle, fontFamily: 'monospace', fontSize: '12px' }}
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
          style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid var(--input-border)', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
        >
          Annuler
        </button>
      </div>

      {/* ===== CARTE BANCAIRE ===== */}
<div
  style={{
    ...cardStyle,
    marginTop: '24px',
  }}
>
  {/* En-tête avec case à cocher */}
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: hasCard ? '20px' : '0',
    }}
  >
    <div style={cardTitleStyle}>
      Carte bancaire
    </div>

    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        color: 'var(--text-primary)',
      }}
    >
      <input
        type="checkbox"
        checked={hasCard}
        onChange={(e) => setHasCard(e.target.checked)}
        style={{
          width: '16px',
          height: '16px',
          cursor: 'pointer',
        }}
      />

      Ce compte possède une carte bancaire
    </label>
  </div>

  {/* ===== FORMULAIRE CARTE ===== */}
  {hasCard && (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        paddingTop: '4px',
      }}
    >
      {/* Type de carte */}
      <div>
        <label style={labelStyle}>
          Type de carte
        </label>

        <select
          name="typeCarte"
          value={cardData.typeCarte}
          onChange={handleCardChange}
          style={{
            ...inputStyle,
            backgroundColor: 'var(--card-bg)',
          }}
        >
          <option value="VISA">VISA</option>
          <option value="MASTERCARD">Mastercard</option>
        </select>
      </div>

      {/* Compte associé */}
      <div>
        <label style={labelStyle}>
          Compte associé
        </label>

        <input
          type="text"
          value={formData.numeroCompte || '-'}
          disabled
          style={{
            ...inputStyle,
            ...disabledStyle,
            fontFamily: 'monospace',
          }}
        />
      </div>
    </div>
  )}
</div>
    </form>
  );
}

export default CompteForm;
