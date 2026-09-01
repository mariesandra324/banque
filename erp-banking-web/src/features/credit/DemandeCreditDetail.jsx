import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import demandeCreditService from '../../service/demandeCreditService';

const formatMontant = (montant) =>
  new Intl.NumberFormat('fr-FR').format(montant || 0) + ' Ar';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('fr-FR');
};

function DemandeCreditDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [demande, setDemande] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [action, setAction] = useState(false); 

  const [rejetOuvert, setRejetOuvert] = useState(false);
  const [motifRejet, setMotifRejet] = useState('');
  const [erreurMotif, setErreurMotif] = useState('');

  const charger = async () => {
    setChargement(true);
    setErreur(null);
    try {
      const data = await demandeCreditService.getById(id);
      setDemande(data);
    } catch (err) {
      console.error(err);
      setErreur("Impossible de charger cette demande de crédit.");
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleApprouver = async () => {
    setAction(true);
    try {
      await demandeCreditService.updateStatut(id, 'ACCEPTER');
      await charger();
    } catch (err) {
      console.error('Erreur approbation:', err.response?.data || err.message);
    } finally {
      setAction(false);
    }
  };

  const confirmerRejet = async () => {
    if (!motifRejet.trim()) {
      setErreurMotif('Le motif est obligatoire pour rejeter une demande.');
      return;
    }
    setAction(true);
    try {
      await demandeCreditService.updateStatut(id, 'REJETER', motifRejet.trim());
      setRejetOuvert(false);
      await charger();
    } catch (err) {
      console.error('Erreur rejet:', err.response?.data || err.message);
    } finally {
      setAction(false);
    }
  };

  if (chargement) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>Chargement...</div>;
  }

  if (erreur || !demande) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '13px' }}>
          {erreur || 'Demande introuvable.'}
        </div>
      </div>
    );
  }

  const estEnAttente = (demande.statut || '').toUpperCase().includes('ATTENTE');

  return (
    <div style={{ padding: '24px', maxWidth: '640px' }}>
      <button
        onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '13px', fontWeight: '500', marginBottom: '18px', padding: 0 }}
      >
        <ArrowLeft size={16} /> Retour
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
          Demande {demande.reference || `#${demande.id}`}
        </h1>
        <span style={{
          padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '600',
          backgroundColor: '#f1f5f9', color: '#475569',
        }}>
          {demande.statut}
        </span>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '20px' }}>
        {[
          ['Client', `${demande.clientNom || ''} ${demande.clientPrenom || ''}`],
          ['Montant demandé', formatMontant(demande.montantDemande)],
          ['Durée', `${demande.duree ?? '-'} mois`],
          ["Taux d'intérêt", demande.tauxInteret ? `${demande.tauxInteret}%` : '-'],
          ['Motif', demande.motif || '-'],
          ['Profession', demande.profession || '-'],
          ['Type de contrat', demande.typeContrat || '-'],
          ['Revenu mensuel', demande.revenuMensuel ? formatMontant(demande.revenuMensuel) : '-'],
          ['Charges mensuelles', demande.chargesMensuelles ? formatMontant(demande.chargesMensuelles) : '-'],
          ['Date de la demande', formatDate(demande.dateDemande)],
          ['Date de décision', formatDate(demande.dateDecision)],
          ['Motif de rejet', demande.motifRejet || '-'],
        ].map(([label, valeur]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
            <span style={{ color: '#64748b' }}>{label}</span>
            <span style={{ color: '#1f2937', fontWeight: '500', textAlign: 'right' }}>{valeur}</span>
          </div>
        ))}

        <div style={{ paddingTop: '14px', borderTop: '1px solid #f1f5f9', marginTop: '12px' }}>
          <div style={{ color: '#64748b', fontSize: '13px', marginBottom: '10px', fontWeight: '600' }}>
            Pièces jointes
          </div>

          {Array.isArray(demande.piecesJointes) && demande.piecesJointes.length > 0 ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {demande.piecesJointes.map((piece, index) => {
                const isImage = piece.typeFichier?.startsWith('image/');
                const isPdf = piece.typeFichier === 'application/pdf';
                const urlFichier = `http://localhost:8080/uploads/credits/${piece.cheminFichier.split('/').pop()}`;

                return (
                  <div key={`${piece.id}-${index}`} style={{
                    padding: '10px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <FileText size={18} color='#64748b' />
                      <span style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937' }}>
                        {piece.nomFichier}
                      </span>
                      <a
                        href={urlFichier}
                        download={piece.nomFichier}
                        style={{
                          marginLeft: 'auto',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 10px',
                          backgroundColor: '#2563eb',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textDecoration: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <Download size={12} /> Télécharger
                      </a>
                    </div>

                    {isImage && (
                      <div style={{
                        marginTop: '10px',
                        display: 'flex',
                        justifyContent: 'center',
                        backgroundColor: 'white',
                        padding: '8px',
                        borderRadius: '6px',
                      }}>
                        <img
                          src={urlFichier}
                          alt={piece.nomFichier}
                          style={{
                            maxWidth: '200px',
                            maxHeight: '200px',
                            borderRadius: '4px',
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {isPdf && (
                      <div style={{
                        marginTop: '10px',
                        fontSize: '12px',
                        color: '#64748b',
                        padding: '8px',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        textAlign: 'center',
                      }}>
                        📄 Document PDF - Cliquez sur "Télécharger" pour voir
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ color: '#94a3b8', fontSize: '13px' }}>Aucune pièce jointe</div>
          )}
        </div>
      </div>

      {estEnAttente && (
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleApprouver}
            disabled={action}
            style={{
              padding: '10px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#16a34a', color: 'white',
              fontSize: '13px', fontWeight: '600', cursor: action ? 'not-allowed' : 'pointer', opacity: action ? 0.7 : 1,
            }}
          >
            Approuver la demande
          </button>
          <button
            onClick={() => { setRejetOuvert(true); setMotifRejet(''); setErreurMotif(''); }}
            disabled={action}
            style={{
              padding: '10px 18px', borderRadius: '8px', border: '1px solid #dc2626', backgroundColor: 'white', color: '#dc2626',
              fontSize: '13px', fontWeight: '600', cursor: action ? 'not-allowed' : 'pointer', opacity: action ? 0.7 : 1,
            }}
          >
            Rejeter la demande
          </button>
        </div>
      )}

      {rejetOuvert && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
        }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '380px', maxWidth: '90vw', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1f2937', marginTop: 0, marginBottom: '12px' }}>
              Motif du rejet
            </h3>
            <textarea
              rows={3}
              value={motifRejet}
              onChange={(e) => { setMotifRejet(e.target.value); setErreurMotif(''); }}
              placeholder="Expliquez la raison du rejet..."
              style={{
                width: '100%', padding: '9px 10px', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box',
                border: erreurMotif ? '1px solid #dc2626' : '1px solid #d1d5db', resize: 'vertical', marginBottom: '4px',
              }}
            />
            {erreurMotif && <div style={{ color: '#dc2626', fontSize: '12px', marginBottom: '10px' }}>{erreurMotif}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
              <button
                onClick={() => setRejetOuvert(false)}
                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button
                onClick={confirmerRejet}
                disabled={action}
                style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#dc2626', color: 'white', fontSize: '13px', fontWeight: '600', cursor: action ? 'not-allowed' : 'pointer', opacity: action ? 0.7 : 1 }}
              >
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DemandeCreditDetail;