import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import demandeCreditService from '../../service/demandeCreditService';

const BASE_URL = 'http://localhost:8080';

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

  const [pieceActive, setPieceActive] = useState(0);
  const [imagesErreur, setImagesErreur] = useState({});
  const galerieRef = useRef(null);

  const onGalerieScroll = () => {
    const el = galerieRef.current;
    if (!el || el.clientWidth === 0) return;
    setPieceActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  const allerA = (index) => {
    const el = galerieRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' });
  };

  const charger = async () => {
    setChargement(true);
    setErreur(null);
    try {
      const data = await demandeCreditService.getById(id);
      setDemande(data);
      setPieceActive(0);
      setImagesErreur({});
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
      // Demande acceptée : ouverture automatique du formulaire de nouvelle offre
      navigate(`/credits?demandeCreditId=${id}`);
    } catch (err) {
      console.error('Erreur approbation:', err.response?.data || err.message);
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
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--faint)', fontSize: '14px' }}>Chargement...</div>;
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
  const pieces = Array.isArray(demande.piecesJointes) ? demande.piecesJointes : [];

  return (
    <div style={{ padding: '24px', maxWidth: '1100px' }}>
      <button
        onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500', marginBottom: '18px', padding: 0 }}
      >
        <ArrowLeft size={16} /> Retour
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--heading)', margin: 0 }}>
          Demande {demande.reference || `#${demande.id}`}
        </h1>
        <span style={{
          padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '600',
          backgroundColor: 'var(--table-header)', color: 'var(--text-secondary)',
        }}>
          {demande.statut}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

      {/* ===================== COLONNE GAUCHE : INFOS ===================== */}
      <div style={{ flex: '1 1 460px', minWidth: '320px', backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '20px', boxSizing: 'border-box' }}>
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
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--faint)', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: '500', textAlign: 'right' }}>{valeur}</span>
          </div>
        ))}

      </div>

      {/* ===================== COLONNE DROITE : PIECES JOINTES ===================== */}
      <div style={{ width: '420px', maxWidth: '100%', backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '20px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>
            Pièces jointes
          </div>
          <span style={{
            backgroundColor: 'var(--table-header)', color: 'var(--text-secondary)',
            borderRadius: '999px', padding: '2px 10px', fontSize: '12px', fontWeight: '600',
          }}>
            {pieces.length}
          </span>
        </div>

        {pieces.length > 0 ? (
          <>
            <div
              ref={galerieRef}
              onScroll={onGalerieScroll}
              style={{
                display: 'flex',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--table-header)',
              }}
            >
              {pieces.map((piece, index) => {
                const isImage = piece.typeFichier?.startsWith('image/');
                const isPdf = piece.typeFichier === 'application/pdf';
                const nomFichierDisque = piece.cheminFichier?.split('/').pop() || '';
                const urlFichier = `${BASE_URL}/uploads/credits/${encodeURIComponent(nomFichierDisque)}`;
                const imageErreur = imagesErreur[piece.id];

                return (
                  <div
                    key={`${piece.id}-${index}`}
                    style={{
                      flex: '0 0 100%',
                      scrollSnapAlign: 'start',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      minHeight: '340px',
                      boxSizing: 'border-box',
                    }}
                  >
                    {isImage && !imageErreur ? (
                      <img
                        src={urlFichier}
                        alt={piece.nomFichier}
                        onError={() => setImagesErreur((prev) => ({ ...prev, [piece.id]: true }))}
                        style={{
                          width: '100%',
                          height: '260px',
                          objectFit: 'contain',
                          borderRadius: '6px',
                          backgroundColor: 'var(--card-bg)',
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '260px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        backgroundColor: 'var(--card-bg)',
                        borderRadius: '6px',
                        color: 'var(--text-secondary)',
                      }}>
                        <FileText size={40} />
                        <span style={{ fontSize: '12px' }}>
                          {isImage
                            ? 'Image indisponible'
                            : isPdf
                              ? 'Document PDF'
                              : 'Fichier'}
                        </span>
                      </div>
                    )}

                    <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
                      <span
                        title={piece.nomFichier}
                        style={{
                          flex: 1, minWidth: 0, fontSize: '12px', fontWeight: '500',
                          color: 'var(--text-primary)', overflow: 'hidden',
                          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}
                      >
                        {piece.nomFichier}
                      </span>
                      <a
                        href={urlFichier}
                        download={piece.nomFichier}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          padding: '6px 10px', backgroundColor: '#2563eb', color: 'white',
                          borderRadius: '4px', fontSize: '12px', fontWeight: '600',
                          textDecoration: 'none', cursor: 'pointer', flexShrink: 0,
                        }}
                      >
                        <Download size={12} /> Télécharger
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                {Math.min(pieceActive, pieces.length - 1) + 1} / {pieces.length}
              </span>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {pieces.map((piece, index) => (
                  <button
                    key={piece.id}
                    onClick={() => allerA(index)}
                    aria-label={`Pièce ${index + 1}`}
                    style={{
                      width: index === Math.min(pieceActive, pieces.length - 1) ? '16px' : '8px',
                      height: '8px',
                      borderRadius: '999px',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      backgroundColor: index === Math.min(pieceActive, pieces.length - 1) ? '#2563eb' : 'var(--border-color)',
                      transition: 'width 0.2s, background-color 0.2s',
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--muted)', textAlign: 'center' }}>
              Faites glisser horizontalement pour parcourir les fichiers
            </div>
          </>
        ) : (
          <div style={{ color: 'var(--muted)', fontSize: '13px' }}>Aucune pièce jointe</div>
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
              padding: '10px 18px', borderRadius: '8px', border: '1px solid #dc2626', backgroundColor: 'var(--card-bg)', color: '#dc2626',
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
          <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', width: '380px', maxWidth: '90vw', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--heading)', marginTop: 0, marginBottom: '12px' }}>
              Motif du rejet
            </h3>
            <textarea
              rows={3}
              value={motifRejet}
              onChange={(e) => { setMotifRejet(e.target.value); setErreurMotif(''); }}
              placeholder="Expliquez la raison du rejet..."
              style={{
                width: '100%', padding: '9px 10px', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box',
                border: erreurMotif ? '1px solid #dc2626' : '1px solid var(--input-border)', resize: 'vertical', marginBottom: '4px',
                backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)',
              }}
            />
            {erreurMotif && <div style={{ color: '#dc2626', fontSize: '12px', marginBottom: '10px' }}>{erreurMotif}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
              <button
                onClick={() => setRejetOuvert(false)}
                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--input-border)', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
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