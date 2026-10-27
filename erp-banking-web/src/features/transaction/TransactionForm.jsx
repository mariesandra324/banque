import { useEffect, useMemo, useState } from 'react';
import { effectuerTransaction } from '../../service/transactionService';
import { getComptes } from '../../service/compteService';
import { clientService } from '../../service/clientService';

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
  const [comptes, setComptes] = useState([]);
  const [clients, setClients] = useState([]);
  const [chargementComptes, setChargementComptes] = useState(true);
  const [erreurComptes, setErreurComptes] = useState('');
  const [rechercheSource, setRechercheSource] = useState('');
  const [rechercheDestination, setRechercheDestination] = useState('');
  const [compteSourceSelectionne, setCompteSourceSelectionne] = useState(null);
  const [compteDestinationSelectionne, setCompteDestinationSelectionne] = useState(null);
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

  useEffect(() => {
    const chargerComptesEtClients = async () => {
      try {
        const [comptesResponse, clientsData] = await Promise.all([
          getComptes(),
          clientService.getAllClients(),
        ]);
        setComptes(comptesResponse.data.filter((compte) => compte.statut === 'ACTIF'));
        setClients(clientsData);
      } catch (err) {
        console.error('Erreur chargement des comptes de transaction:', err);
        setErreurComptes("Impossible de charger les comptes et les clients.");
      } finally {
        setChargementComptes(false);
      }
    };

    chargerComptesEtClients();
  }, []);

  const clientsParId = useMemo(
    () => new Map(clients.map((client) => [client.id, client])),
    [clients]
  );

  const filtrerComptes = (recherche, numeroCompteExclu = '') => {
    const terme = recherche.trim().toLocaleLowerCase('fr');
    if (!terme) return [];

    return comptes
      .filter((compte) => compte.numeroCompte !== numeroCompteExclu)
      .map((compte) => {
        const client = clientsParId.get(compte.clientId);
        const nomClient = [client?.nom, client?.prenom].filter(Boolean).join(' ');
        return { ...compte, nomClient };
      })
      .filter((compte) =>
        `${compte.nomClient} ${compte.numeroCompte}`.toLocaleLowerCase('fr').includes(terme)
      )
      .slice(0, 8);
  };

  const comptesSourceFiltres = filtrerComptes(rechercheSource);
  const comptesDestinationFiltres = filtrerComptes(
    rechercheDestination,
    compteSourceSelectionne?.numeroCompte
  );
  const montantVirement = Number(formData.montant);
  const soldeSourceValide = compteSourceSelectionne?.solde != null
    && Number.isFinite(Number(compteSourceSelectionne.solde));
  const soldeEstime = soldeSourceValide && Number.isFinite(montantVirement) && montantVirement > 0
    ? Number(compteSourceSelectionne.solde) - montantVirement
    : null;
  const formatMontant = (montant) =>
    `${Number(montant).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Ar`;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const selectionnerCompte = (compte, champ) => {
    const estSource = champ === 'source';
    setFormData((actuel) => ({
      ...actuel,
      [estSource ? 'numeroCompteSource' : 'numeroCompteDestination']: compte.numeroCompte,
    }));
    if (estSource) {
      setCompteSourceSelectionne(compte);
      setRechercheSource(`${compte.nomClient || 'Client'} — ${compte.numeroCompte}`);
      if (compteDestinationSelectionne?.numeroCompte === compte.numeroCompte) {
        setCompteDestinationSelectionne(null);
        setRechercheDestination('');
        setFormData((actuel) => ({ ...actuel, numeroCompteDestination: '' }));
      }
    } else {
      setCompteDestinationSelectionne(compte);
      setRechercheDestination(`${compte.nomClient || 'Client'} — ${compte.numeroCompte}`);
    }
    setError('');
  };

  const modifierRechercheCompte = (valeur, champ) => {
    const estSource = champ === 'source';
    if (estSource) {
      setRechercheSource(valeur);
      setCompteSourceSelectionne(null);
      setFormData((actuel) => ({ ...actuel, numeroCompteSource: '' }));
    } else {
      setRechercheDestination(valeur);
      setCompteDestinationSelectionne(null);
      setFormData((actuel) => ({ ...actuel, numeroCompteDestination: '' }));
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!compteSourceSelectionne
      || (formData.type === 'VIREMENT' && !compteDestinationSelectionne)) {
      setError('Sélectionnez un compte dans la liste des résultats.');
      return;
    }
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

  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: 'var(--text-primary)' };
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--input-border)', boxSizing: 'border-box', fontSize: '14px', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)' };
  const cardStyle = { backgroundColor: 'var(--card-bg)', borderRadius: '10px', border: '1px solid var(--border-color)', padding: '24px' };
  const cardTitleStyle = { fontSize: '15px', fontWeight: '700', color: 'var(--heading)', marginBottom: '18px' };

  const renderRechercheCompte = ({
    label,
    champ,
    recherche,
    comptesFiltres,
    numeroCompteSelectionne,
  }) => {
    return (
      <div>
        <label htmlFor={`recherche-compte-${champ}`} style={labelStyle}>
          {label} <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <input
          id={`recherche-compte-${champ}`}
          type="search"
          value={recherche}
          onChange={(event) => modifierRechercheCompte(event.target.value, champ)}
          placeholder="Rechercher par nom ou numéro de compte"
          autoComplete="off"
          required
          style={inputStyle}
        />
        {recherche && !numeroCompteSelectionne && (
          <div
            role="listbox"
            style={{
              maxHeight: '220px', overflowY: 'auto', marginTop: '4px',
              border: '1px solid var(--border-color)', borderRadius: '6px',
              backgroundColor: 'var(--card-bg)',
            }}
          >
            {comptesFiltres.length ? comptesFiltres.map((compte) => (
              <button
                key={compte.id}
                type="button"
                role="option"
                aria-selected="false"
                onClick={() => selectionnerCompte(compte, champ)}
                style={{
                  display: 'block', width: '100%', padding: '9px 12px',
                  textAlign: 'left', border: 'none',
                  borderBottom: '1px solid var(--border-color)',
                  backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)',
                  cursor: 'pointer', fontSize: '13px',
                }}
              >
                <strong>{compte.nomClient || 'Client inconnu'}</strong>
                <span style={{ display: 'block', color: 'var(--muted)', marginTop: '3px' }}>
                  {compte.numeroCompte} · {compte.typeCompte}
                </span>
              </button>
            )) : (
              <div style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: '13px' }}>
                Aucun compte actif correspondant.
              </div>
            )}
          </div>
        )}
        {numeroCompteSelectionne && (
          <div style={{ marginTop: '5px', color: '#166534', fontSize: '12px' }}>
            Compte sélectionné : {numeroCompteSelectionne}
          </div>
        )}
      </div>
    );
  };

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
          {chargementComptes && (
            <div style={{ marginBottom: '16px', color: 'var(--muted)', fontSize: '13px' }}>
              Chargement des comptes...
            </div>
          )}
          {erreurComptes && (
            <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '6px', backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '13px' }}>
              {erreurComptes}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Type de transaction <span style={{ color: '#dc2626' }}>*</span></label>
              <select name="type" value={formData.type} onChange={handleChange} style={{ ...inputStyle, backgroundColor: 'var(--card-bg)' }}>
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

            {renderRechercheCompte({
              label: 'Compte source',
              champ: 'source',
              recherche: rechercheSource,
              comptesFiltres: comptesSourceFiltres,
              numeroCompteSelectionne: compteSourceSelectionne?.numeroCompte,
            })}

            {formData.type === 'VIREMENT' && (
              renderRechercheCompte({
                label: 'Compte destination',
                champ: 'destination',
                recherche: rechercheDestination,
                comptesFiltres: comptesDestinationFiltres,
                numeroCompteSelectionne: compteDestinationSelectionne?.numeroCompte,
              })
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
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
            {DESCRIPTIONS_TYPE[formData.type]}
          </p>
          {formData.type === 'VIREMENT' && soldeEstime !== null && (
            <div
              aria-live="polite"
              style={{
                marginTop: '16px',
                padding: '12px',
                borderRadius: '6px',
                backgroundColor: soldeEstime < 0 ? '#fef2f2' : '#eff6ff',
                color: soldeEstime < 0 ? '#b91c1c' : '#1d4ed8',
                fontSize: '13px',
              }}
            >
              Solde estimé après le virement : <strong>{formatMontant(soldeEstime)}</strong>
            </div>
          )}
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
