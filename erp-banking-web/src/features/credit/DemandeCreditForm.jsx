import { useEffect, useState } from 'react';
import { ArrowLeft, Paperclip, X, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clientService } from '../../service/clientService';

const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: '#374151' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '14px' };
const cardStyle = { backgroundColor: 'white', borderRadius: '10px', border: '1px solid #e5e7eb', padding: '24px' };
const cardTitleStyle = { fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '18px' };
const errorStyle = { marginTop: '6px', color: '#dc2626', fontSize: '12px' };

function DemandeCreditForm({ onSubmit, onClose }) {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [donnees, setDonnees] = useState({
    clientId: '',
    montantDemande: '',
    dureeMois: '',
    motif: '',
    profession: '',
    tauxInteret: '',
    typeContrat: '',
    revenuMensuel: '',
    chargesMensuelles: '',
  });
  const [fichiers, setFichiers] = useState([]);
  const [erreurs, setErreurs] = useState({});
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    clientService.getAllClients().then(setClients).catch(() => setClients([]));
  }, []);

  const majChamp = (champ, valeur) => {
    setDonnees((d) => ({ ...d, [champ]: valeur }));
    setErreurs((e) => ({ ...e, [champ]: null }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    majChamp(name, value);
  };

  // --- Gestion des fichiers ---
  const handleFileChange = (e) => {
    const nouveauxFichiers = Array.from(e.target.files);
    console.log('[Pièces jointes] Fichiers sélectionnés :', nouveauxFichiers.map((f) => f.name));
    setFichiers((prev) => {
      const maj = [...prev, ...nouveauxFichiers];
      console.log('[Pièces jointes] Liste totale après ajout :', maj.map((f) => f.name));
      return maj;
    });
    e.target.value = '';
  };

  const retirerFichier = (index) => {
    setFichiers((prev) => {
      console.log('[Pièces jointes] Retrait du fichier :', prev[index]?.name);
      const maj = prev.filter((_, i) => i !== index);
      console.log('[Pièces jointes] Liste totale après retrait :', maj.map((f) => f.name));
      return maj;
    });
  };

  const formaterTaille = (octets) => {
    if (octets < 1024) return `${octets} o`;
    if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(1)} Ko`;
    return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
  };

  const valider = () => {
    const nouvellesErreurs = {};
    if (!donnees.clientId) nouvellesErreurs.clientId = 'Client requis';
    if (!donnees.montantDemande || Number(donnees.montantDemande) <= 0) nouvellesErreurs.montantDemande = 'Montant invalide';
    if (!donnees.dureeMois || Number(donnees.dureeMois) <= 0) nouvellesErreurs.dureeMois = 'Durée invalide';
    if (!donnees.motif.trim()) nouvellesErreurs.motif = 'Motif requis';
    setErreurs(nouvellesErreurs);
    return Object.keys(nouvellesErreurs).length === 0;
  };

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
      return;
    }
    navigate('/credits');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valider()) return;
    setEnvoi(true);
    try {
      const payload = {
        clientId: donnees.clientId,
        montantDemande: Number(donnees.montantDemande),
        duree: Number(donnees.dureeMois),
        motif: donnees.motif,
        profession: donnees.profession || null,
        typeContrat: donnees.typeContrat || null,
        tauxInteret: donnees.tauxInteret ? Number(donnees.tauxInteret) : null,
        revenuMensuel: donnees.revenuMensuel ? Number(donnees.revenuMensuel) : null,
        chargesMensuelles: donnees.chargesMensuelles ? Number(donnees.chargesMensuelles) : null,
      };

      const formData = new FormData();
      formData.append(
        'demande',
        new Blob([JSON.stringify(payload)], { type: 'application/json' })
      );
      fichiers.forEach((fichier) => {
        formData.append('pieces', fichier);
      });

      // Vérification de ce qui part réellement dans le FormData
      console.log('[Soumission] Payload demande :', payload);
      console.log('[Soumission] Nombre de pièces jointes envoyées :', fichiers.length);
      for (const pair of formData.entries()) {
        console.log('[FormData]', pair[0], pair[1]);
      }

      await onSubmit(formData);
      handleClose();
    } catch (err) {
      console.error(err);
      setErreurs({ global: 'Erreur lors de la création de la demande.' });
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1100px' }}>
      <button
        onClick={handleClose}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '13px', fontWeight: '500', marginBottom: '18px', padding: 0 }}
      >
        <ArrowLeft size={16} /> Retour
      </button>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '20px' }}>Nouvelle demande de crédit</h2>

      {erreurs.global && (
        <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '14px', fontSize: '13px' }}>
          {erreurs.global}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* ===== Ligne du haut : Informations générales + Situation professionnelle côte à côte ===== */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start', marginBottom: '20px' }}>

          <div style={cardStyle}>
            <div style={cardTitleStyle}>Informations générales</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>
                  Client <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  name="clientId"
                  value={donnees.clientId}
                  onChange={handleInputChange}
                  style={inputStyle}
                >
                  <option value="">Sélectionner un client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.nom} {c.prenom}</option>
                  ))}
                </select>
                {erreurs.clientId && <div style={errorStyle}>{erreurs.clientId}</div>}
              </div>

              <div>
                <label style={labelStyle}>
                  Montant demandé (Ar) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  name="montantDemande"
                  value={donnees.montantDemande}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
                {erreurs.montantDemande && <div style={errorStyle}>{erreurs.montantDemande}</div>}
              </div>

              <div>
                <label style={labelStyle}>
                  Durée (mois) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  name="dureeMois"
                  value={donnees.dureeMois}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
                {erreurs.dureeMois && <div style={errorStyle}>{erreurs.dureeMois}</div>}
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>
                  Motif <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <textarea
                  rows={3}
                  name="motif"
                  value={donnees.motif}
                  onChange={handleInputChange}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
                {erreurs.motif && <div style={errorStyle}>{erreurs.motif}</div>}
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={cardTitleStyle}>Situation professionnelle</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Profession</label>
                <input
                  type="text"
                  name="profession"
                  value={donnees.profession}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Type de contrat</label>
                <select
                  name="typeContrat"
                  value={donnees.typeContrat}
                  onChange={handleInputChange}
                  style={inputStyle}
                >
                  <option value="">Sélectionner</option>
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="INDEPENDANT">Indépendant</option>
                  <option value="FREELANCE">Freelance</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Revenu mensuel (Ar)</label>
                <input
                  type="number"
                  min="0"
                  name="revenuMensuel"
                  value={donnees.revenuMensuel}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Charges mensuelles (Ar)</label>
                <input
                  type="number"
                  min="0"
                  name="chargesMensuelles"
                  value={donnees.chargesMensuelles}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Taux d'intérêt (%)</label>
                <input
                  type="number"
                  min="0"
                  name="tauxInteret"
                  value={donnees.tauxInteret}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ===== Ligne du bas : Pièces jointes en pleine largeur ===== */}
        <div style={cardStyle}>
          <div style={cardTitleStyle}>Pièces jointes</div>

          <label
            htmlFor="fichiers-input"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              border: '1px dashed #d1d5db', borderRadius: '8px', padding: '14px',
              cursor: 'pointer', color: '#64748b', fontSize: '13px', backgroundColor: '#f9fafb',
            }}
          >
            <Paperclip size={16} />
            Cliquer pour ajouter des fichiers (justificatifs, pièce d'identité...)
          </label>
          <input
            id="fichiers-input"
            type="file"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          {fichiers.length === 0 ? (
            <div style={{ marginTop: '10px', color: '#9ca3af', fontSize: '12px' }}>
              Aucun fichier sélectionné.
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
              {fichiers.map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 10px', backgroundColor: '#f1f5f9', borderRadius: '6px', fontSize: '12px',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                    <FileText size={14} color="#64748b" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                    <span style={{ color: '#94a3b8', flexShrink: 0 }}>({formaterTaille(f.size)})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => retirerFichier(i)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', display: 'flex', flexShrink: 0 }}
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ===== Actions ===== */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            type="submit"
            disabled={envoi}
            style={{
              padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#2563eb', color: 'white',
              cursor: envoi ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px', opacity: envoi ? 0.7 : 1,
            }}
          >
            {envoi ? 'Envoi...' : 'Créer la demande'}
          </button>
          <button
            type="button"
            onClick={handleClose}
            style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white', color: '#374151', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

export default DemandeCreditForm;
