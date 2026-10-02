import { useState } from 'react';
import { X, CalendarDays } from 'lucide-react';
import api from '../../api/axios';

const formatMontant = (montant) =>
  new Intl.NumberFormat('fr-FR').format(montant || 0) + ' Ar';

const formatDate = (dateString) => {
  if (!dateString) return '-';

  const date = new Date(dateString);

  return isNaN(date.getTime())
    ? dateString
    : date.toLocaleDateString('fr-FR');
};

const STATUTS_CREDIT = {
  ACTIF: {label: 'Actif',bg: '#dbeafe',color: '#1e40af',},
  SOLDE: {label: 'Soldé',bg: '#dcfce7',color: '#166534',},
  EN_RETARD: {label: 'En retard',bg: '#fee2e2',color: '#991b1b',},
};

const labelStyle = {fontSize: '12px', color: 'var(--text-secondary)',marginBottom: '5px',};
const valueStyle = {fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)',};
const thStyle = {padding: '12px 14px',fontSize: '12px',fontWeight: '600',color: 'var(--text-secondary)', whiteSpace: 'nowrap',};
const tdStyle = {padding: '12px 14px', fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap',};

function CreditDetail({
  credit,
  echeances = [],
  loading = false,
  error = '',
  onClose,
  onRemboursementSuccess,
}) {
  const [remboursementLoading, setRemboursementLoading] = useState(false);
  const [selectedEcheance, setSelectedEcheance] = useState(null);

  const effectuerRemboursement = async (echeance) => {
  if (!credit?.id || !echeance?.id) {
    alert("Informations du crédit ou de l'échéance manquantes.");
    return;
  }

  const confirmation = window.confirm(
    `Voulez-vous vraiment rembourser l'échéance n°${echeance.numeroEcheance} ` +
    `d'un montant de ${formatMontant(echeance.montant)} ?`
  );

  if (!confirmation) return;

  try {
    setRemboursementLoading(true);
    setSelectedEcheance(echeance.id);

    await api.post(
      `/credits/${credit.id}/remboursement/${echeance.id}`
    );

    alert("Remboursement effectué avec succès !");

    // Permet au composant parent de recharger les données
    if (onRemboursementSuccess) {
      await onRemboursementSuccess();
    }

  } catch (error) {
    console.error("Erreur remboursement :", error);

    alert(
      error.response?.data?.message || error.message || "Une erreur est survenue lors du remboursement."
    );

  } finally {
    setRemboursementLoading(false);
    setSelectedEcheance(null);
  }
};
  if (!credit) return null;

  const statut =
    STATUTS_CREDIT[credit.statut] || {
      label: credit.statut || '-',
      bg: '#f3f4f6',
      color: '#374151',
    }; 
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '95%',
          maxWidth: '1100px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'var(--card-bg)',
          borderRadius: '14px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
        }}
      >
        {/* HEADER */}
        <div style={{display: 'flex',justifyContent: 'space-between',alignItems: 'center',padding: '20px 24px', borderBottom: '1px solid var(--border-color)',}}>
          <div>
            <h2 style={{margin: 0,fontSize: '20px',color: 'var(--text-primary)',}}>
              Détail du crédit
            </h2>

            <p style={{margin: '5px 0 0', fontSize: '13px',color: 'var(--text-secondary)',}}>
              {credit.numeroCredit}
            </p>
          </div>

          <button onClick={onClose}style={{border: 'none', background: 'none', cursor: 'pointer',color: 'var(--text-secondary)',}}>
            <X size={22} />
          </button>
        </div>

        {/* CONTENU */}
        <div style={{ padding: '24px' }}>

          {/* INFORMATIONS CRÉDIT */}
          <div style={{display: 'grid',gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))',gap: '20px', marginBottom: '30px',}}>
            <div>
              <div style={labelStyle}>Client</div>
              <div style={valueStyle}>{credit.clientNom} {credit.clientPrenom}</div>
            </div>

            <div>
              <div style={labelStyle}>Montant</div>
              <div style={valueStyle}>{formatMontant(credit.montant)}</div>
            </div>

            <div>
              <div style={labelStyle}>Taux d'intérêt</div>
              <div style={valueStyle}>{credit.tauxInteret} %</div>
            </div>

            <div>
              <div style={labelStyle}>Durée</div>
              <div style={valueStyle}>{credit.duree} mois</div>
            </div>

            <div>
              <div style={labelStyle}>Mensualité</div>
              <div style={valueStyle}>{formatMontant(credit.mensualite)}</div>
            </div>

            <div>
              <div style={labelStyle}>Date de début</div>
              <div style={valueStyle}>{formatDate(credit.dateDebut)}</div>
            </div>

            <div>
              <div style={labelStyle}>Capital restant</div>
              <div style={valueStyle}>{formatMontant(credit.capitalRestant)}</div>
            </div>

            <div>
              <div style={labelStyle}>Statut</div>

              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: '600',
                  backgroundColor: statut.bg,
                  color: statut.color,
                }}
              >
                {statut.label}
              </span>
            </div>
          </div>

          {/* ÉCHÉANCIER */}
          <div style={{display: 'flex', alignItems: 'center', gap: '8px',marginBottom: '15px',}}>
            <CalendarDays size={20} color="#2563eb" />

            <h3 style={{margin: 0,fontSize: '17px',color: 'var(--text-primary)',}}>
              Échéancier
            </h3>
          </div>

          {/* LOADING */}
          {loading && (
            <div style={{padding: '30px',textAlign: 'center',color: 'var(--text-secondary)',}}>
              Chargement de l'échéancier...
            </div>
          )}

          {/* ERREUR */}
          {!loading && error && (
            <div style={{padding: '15px',borderRadius: '8px',backgroundColor: '#fee2e2',color: '#991b1b',}}>
              {error}
            </div>
          )}

          {/* TABLEAU */}
          {!loading && !error && echeances.length > 0 && (
            <div style={{overflowX: 'auto',border: '1px solid var(--border-color)',borderRadius: '8px',}}>
              <table style={{width: '100%',borderCollapse: 'collapse',}}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--table-header)',}}>
                    <th style={thStyle}>N°</th>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Montant</th>
                    <th style={thStyle}>Capital</th>
                    <th style={thStyle}>Intérêt</th>
                    <th style={thStyle}>Capital restant</th>
                    <th style={thStyle}>Statut</th>
                    <th style={thStyle}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {echeances.map((echeance) => (
                    <tr key={echeance.id} style={{borderBottom:'1px solid var(--faint)'}}>
                      <td style={tdStyle}>{echeance.numeroEcheance}</td>
                      <td style={tdStyle}>{formatDate(echeance.dateEcheance)}</td>
                      <td style={tdStyle}>{formatMontant(echeance.montant)}</td>
                      <td style={tdStyle}>{formatMontant(echeance.capital)}</td>
                      <td style={tdStyle}>{formatMontant(echeance.interet)}</td>
                      <td style={tdStyle}>{formatMontant(echeance.capitalRestant)}</td>
                      <td style={tdStyle}>{echeance.statut}</td>
                      <td style={tdStyle}>
                        {echeance.statut === 'PAYEE' ? (
                            <span style={{color: '#166534', fontWeight: '600',fontSize: '12px',}}>
                             Payée
                            </span>
                        ) : (
                            <button
                            onClick={() => effectuerRemboursement(echeance)}disabled={remboursementLoading && selectedEcheance === echeance.id}
                            style={{padding: '7px 12px', border: 'none',borderRadius: '7px', backgroundColor: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: '12px',fontWeight: '600',
                                opacity:
                                remboursementLoading &&
                                selectedEcheance === echeance.id
                                    ? 0.6
                                    : 1,
                            }}
                            >
                            {remboursementLoading &&
                            selectedEcheance === echeance.id
                                ? 'Paiement...'
                                : 'Rembourser'}
                            </button>
                        )}
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && echeances.length === 0 && (
              <div style={{padding: '30px',textAlign: 'center',color: 'var(--text-secondary)',border: '1px solid var(--border-color)', borderRadius: '8px',}}>
                Aucun échéancier disponible.
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default CreditDetail;