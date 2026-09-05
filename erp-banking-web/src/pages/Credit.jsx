import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import DemandeCreditTable from '../features/credit/DemandeCreditTable';
import CreditTable from '../features/credit/CreditTable';
import DemandeCreditForm from '../features/credit/DemandeCreditForm';
import CreditForm from '../features/credit/CreditForm';
import {
   getCredits,
  creerDemandeCredit, creerCredit,
} from '../service/creditService';
import demandeCreditService from '../service/demandeCreditService';
import OffreCreditTable from '../features/credit/OffreCreditTable';
import offreCreditService from '../service/offreCreditService';
import OffreCreditForm from '../features/credit/OffreCreditForm';

const ONGLETS = [
  { id: 'demandes', label: 'Demandes de crédit' },
  { id: 'offres', label: 'Offres de crédits'},
  { id: 'credits', label: 'Crédits' },
];

function Credit() {
  const [ongletActif, setOngletActif] = useState('demandes');
  const [demandes, setDemandes] = useState([]);
  const [credits, setCredits] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [formOuvert, setFormOuvert] = useState(false);
  const [offres, setOffres] = useState([]);

  const chargerDonnees = async () => {
    setChargement(true);
    setErreur(null);
    try {
      const [demandesData,offresData, creditsData] = await Promise.all([
        demandeCreditService.getAll(),
        offreCreditService.getAll(),
        getCredits(),
      ]);
      setDemandes(demandesData);
      setOffres(offresData);
      setCredits(creditsData);
    } catch (err) {
      console.error(err);
      setErreur("Impossible de charger les données de crédit.");
    } finally {
      setChargement(false);
    }
};

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    chargerDonnees();
  }, []);

  const handleApprouver = async (id) => {
  try{
    await demandeCreditService.updateStatut(id, 'ACCEPTER');
    chargerDonnees();
  }catch (err) {
    console.error('Erreur approbation:', err.response?.data || err.message);
  }};
  
  const handleRejeter = async (id, motif) => {
  try{
    await demandeCreditService.updateStatut(id, 'REJETER', motif);
    chargerDonnees();
  }catch (err) {
    console.error('Erreur rejet:', err.response?.data || err.message);
  }};

  const handleCreerDemande = async (donnees) => {
    await creerDemandeCredit(donnees);
    await chargerDonnees();
  };

  const handleCreerCredit = async (donnees) => {
    await creerCredit(donnees);
    await chargerDonnees();
  };

  const fermerFormulaire = () => setFormOuvert(false);
  const handleCreerOffre = async (donnees) => {
  try {
    await offreCreditService.creer(donnees);
    await chargerDonnees();
  } catch (err) {
    console.error(
      "Erreur création offre :",
      err.response?.data || err.message
    );
    throw err;
  }
};

  if (formOuvert && ongletActif === 'demandes') {
    return (
      <DemandeCreditForm
        onClose={fermerFormulaire}
        onSubmit={handleCreerDemande}
      />
    );
  }

  if (formOuvert && ongletActif === 'offres') {
  return (
    <OffreCreditForm
      onClose={fermerFormulaire}
      onSubmit={handleCreerOffre}
    />
  );
}

  if (formOuvert && ongletActif === 'credits') {
    return (
      <CreditForm
        onClose={fermerFormulaire}
        onSubmit={handleCreerCredit}
      />
    );
  }

    const handleAccepterOffre = async (id) => {
      try {
          await offreCreditService.accepter(id);

          await chargerDonnees();

          // On peut ensuite afficher automatiquement l'onglet crédits
          setOngletActif('credits');

      } catch (err) {
          console.error(
              "Erreur acceptation offre:",
              err.response?.data || err.message
          );

          setErreur(
              err.response?.data?.message ||
              "Impossible d'accepter cette offre."
          );
      }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
          Crédit
        </h1>
        <button
          onClick={() => setFormOuvert(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px',
            borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: 'white',
            fontSize: '13px', fontWeight: '600', cursor: 'pointer',
          }}
        >
          <Plus size={16} />
          {ongletActif === 'demandes' ? 'Nouvelle demande' : ongletActif === 'offres'?'Nouvelle crédit' : 'Nouveau crédit'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
        {ONGLETS.map((onglet) => (
          <button
            key={onglet.id}
            onClick={() => setOngletActif(onglet.id)}
            style={{
              padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '14px', fontWeight: '600',
              color: ongletActif === onglet.id ? '#2563eb' : '#64748b',
              borderBottom: ongletActif === onglet.id ? '2px solid #2563eb' : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            {onglet.label}
          </button>
        ))}
      </div>

      {erreur && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
          {erreur}
        </div>
      )}

      {chargement ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
          Chargement...
        </div>
      ) : ongletActif === 'demandes' ? (
        <DemandeCreditTable demandes={demandes} onApprouver={handleApprouver} onRejeter={handleRejeter} />
      ): ongletActif === 'offres' ? (

        <OffreCreditTable offres={offres} onAccepter={handleAccepterOffre} onActualiser={chargerDonnees}/>
      ) : (
        <CreditTable credits={credits} />
      )}
    </div>
  );
}

export default Credit;