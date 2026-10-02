import { useEffect } from 'react';
import { X } from 'lucide-react';
import { colorerStatut } from '../../service/journalService';

const formatMontant = (valeur) =>
  new Intl.NumberFormat('fr-FR').format(Math.round(valeur || 0)) + ' Ar';

const labelStyle = { display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '12px', color: 'var(--muted)' };
const valeurStyle = { fontSize: '14px', color: 'var(--text-primary)', fontWeight: '600', wordBreak: 'break-word' };

const Ligne = ({ label, children, color }) => (
  <div>
    <span style={labelStyle}>{label}</span>
    <div style={{ ...valeurStyle, ...(color ? { color } : null) }}>{children}</div>
  </div>
);

function ConsultationEcriture({ ecriture, onClose }) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  if (!ecriture) return null;

  const styleStatut = colorerStatut(ecriture.statut);

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
        role="dialog"
        aria-modal="true"
        style={{
          backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)',
          padding: '24px', width: '100%', maxWidth: '560px', boxSizing: 'border-box', maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--heading)', margin: 0 }}>
              Écriture {ecriture.reference}
            </h3>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Consultation de la ligne du journal</div>
          </div>
          <button onClick={onClose} aria-label="Fermer" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
            <X size={18} color="var(--text-secondary)" />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
          <Ligne label="Date">{new Date(ecriture.dateEcriture).toLocaleString('fr-FR')}</Ligne>
          <Ligne label="Type">{ecriture.type}</Ligne>
          <Ligne label="Libellé">{ecriture.libelle}</Ligne>
          <Ligne label="Statut">
            <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', ...styleStatut }}>
              {ecriture.statut}
            </span>
          </Ligne>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '18px', marginBottom: '18px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--heading)', marginBottom: '12px' }}>Montants</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '18px' }}>
            <Ligne label="Débit" color="#16a34a">{formatMontant(ecriture.debit)}</Ligne>
            <Ligne label="Crédit" color="#dc2626">{formatMontant(ecriture.credit)}</Ligne>
            <Ligne label="Montant">{formatMontant(ecriture.montant)}</Ligne>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '18px', marginBottom: '22px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--heading)', marginBottom: '12px' }}>Comptes concernés</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <Ligne label="Compte imputé (débité/crédité)">
              {ecriture.numeroCompte} — {ecriture.libelleCompte}
            </Ligne>
            <Ligne label="Compte source">{ecriture.compteSource || '—'}</Ligne>
            <Ligne label="Compte destination">{ecriture.compteDestination || '—'}</Ligne>
            <Ligne label="Identifiant transaction">#{ecriture.transactionId}</Ligne>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ padding: '9px 18px', borderRadius: '6px', border: '1px solid var(--input-border)', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConsultationEcriture;
