import { useEffect, useState } from 'react';
import { CalendarClock, Download, ScrollText } from 'lucide-react';
import {
  calculerTotaux,
  filtrerLignes,
  getJournal,
  getStatutsFiltrables,
  telechargerCsv,
} from '../service/journalService';
import {
  calculerTotauxEcheances,
  getEcheancierGlobal,
  STATUTS_ECHEANCE_FILTRABLES,
  telechargerCsvEcheances,
} from '../service/echeancierService';
// BLOC « RAPPORT DE GUICHET » MIS EN COMMENTAIRE — voir ONGLETS plus haut.
// import { anneesDisponibles, CATEGORIES_RAPPORT, calculerTotauxRapport,
//   getGuichetsRapport, getRapportGuichet, GRANULARITES, joursDuMois,
//   MOIS_LIBELLES, telechargerCsvRapport, TOUS_LES_GUICHETS, TOUS_LES_TYPES,
// } from '../service/rapportGuichetService';
import JournalTable from '../features/comptabilite/JournalTable';
import EcheancierTable from '../features/comptabilite/EcheancierTable';
// import RapportGuichetTable from '../features/comptabilite/RapportGuichetTable';
import ConsultationEcriture from '../features/comptabilite/ConsultationEcriture';

/*
 * ONGLET « RAPPORT DE GUICHET » — MIS EN COMMENTAIRE
 *
 * Suspendu car il ne se peuple pas de donnees fiables : sur la base
 * actuelle, les 3 transactions existantes ont transactions.guichet_id = NULL
 * et ressortent en "NON RATTACHE", alors que les 5 utilisateurs sont bien
 * rattaches a un guichet (00001 a 00005). Aucun historique ne permet de
 * retro-attribuer ces mouvements a leur agent.
 *
 * Reserves supplementaires : le virement est impute au guichet de l'agent
 * qui l'a saisi (convention, pas verite comptable) et le remboursement est
 * repere par un prefixe de description, donc jamais rattache a un guichet.
 *
 * Pour reactiver : decommenter l'entree 'guichet' dans ONGLETS ci-dessous,
 * le bloc {onglet === 'guichet' && (...)} en bas de fichier, ainsi que les
 * imports rapportGuichetService, RapportGuichetTable et l'icone Store.
 */
const ONGLETS = [
  { id: 'journal', label: 'Journal', icon: ScrollText, sousTitre: 'Journal des écritures' },
  { id: 'echeancier', label: 'Échéancier', icon: CalendarClock, sousTitre: 'Échéances de remboursement des crédits' },
  // { id: 'guichet', label: 'Rapport de guichet', icon: Store, sousTitre: 'Dépôts, retraits, virements et remboursements par guichet' },
];

const formatMontant = (valeur) =>
  new Intl.NumberFormat('fr-FR').format(Math.round(valeur || 0)) + ' Ar';

const horodatage = () => new Date().toISOString().replace(/[-:]/g, '').slice(0, 15);

const messageErreur = (err, message) =>
  err.response?.status === 403
    ? "Vous n'avez pas les droits pour consulter les données comptables."
    : err.response?.data?.message || message;

const Carte = ({ label, value, couleur }) => (
  <div
    style={{
      backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px',
      padding: '16px 20px', minWidth: '180px', flex: 1,
    }}
  >
    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '6px' }}>{label}</div>
    <div style={{ fontSize: '20px', fontWeight: '700', color: couleur || 'var(--heading)' }}>{value}</div>
  </div>
);

const styleSelect = {
  padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--input-border)',
  fontSize: '13px', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)',
};

const Alerte = ({ children }) => (
  <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '6px', backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '13px' }}>
    {children}
  </div>
);

const Chargement = ({ children }) => (
  <div style={{ padding: '20px', color: 'var(--muted)' }}>{children}</div>
);

const SelecteurStatut = ({ id, valeur, options, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <label htmlFor={id} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Statut</label>
    <select id={id} value={valeur} onChange={onChange} style={styleSelect}>
      {options.map((s) => (
        <option key={s} value={s}>{s === 'TOUS' ? 'Tous les statuts' : s}</option>
      ))}
    </select>
  </div>
);

// COMPOSANT FiltresGuichet MIS EN COMMENTAIRE — reserve au rapport de guichet
// suspendu (voir ONGLETS plus haut). A decommenter avec le bloc de rendu et
// l'import de rapportGuichetService si le rapport est reactive.
/*
const FiltresGuichet = ({
  granularite, setGranularite, annee, setAnnee, mois, setMois, jour, setJour,
  guichet, setGuichet, categorie, setCategorie, guichets,
}) => {
  const annees = anneesDisponibles();
  const jours = joursDuMois(annee, mois);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label htmlFor="granularite" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Granularité</label>
        <select
          id="granularite"
          value={granularite}
          onChange={(e) => {
            setGranularite(e.target.value);
            setMois('');
            setJour('');
          }}
          style={styleSelect}
        >
          {GRANULARITES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label htmlFor="annee" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Année</label>
        <select
          id="annee"
          value={annee}
          onChange={(e) => {
            setAnnee(e.target.value);
            if (jour && !joursDuMois(e.target.value, mois).includes(Number(jour))) setJour('');
          }}
          style={styleSelect}
        >
          <option value="">Toutes</option>
          {annees.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {granularite !== 'ANNEE' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="mois" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Mois</label>
          <select
            id="mois"
            value={mois}
            onChange={(e) => {
              setMois(e.target.value);
              if (jour && !joursDuMois(annee, e.target.value).includes(Number(jour))) setJour('');
            }}
            style={styleSelect}
          >
            <option value="">Tous</option>
            {MOIS_LIBELLES.map((libelle, index) => (
              <option key={libelle} value={index + 1}>{libelle}</option>
            ))}
          </select>
        </div>
      )}

      {granularite === 'JOUR' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="jour" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Jour</label>
          <select id="jour" value={jour} onChange={(e) => setJour(e.target.value)} style={styleSelect}>
            <option value="">Tous</option>
            {jours.map((j) => <option key={j} value={j}>{j}</option>)}
          </select>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label htmlFor="guichet" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Guichet</label>
        <select
          id="guichet"
          value={guichet}
          onChange={(e) => setGuichet(e.target.value)}
          disabled={guichets.length === 0}
          style={{ ...styleSelect, opacity: guichets.length === 0 ? 0.6 : 1 }}
        >
          <option value="">Tous les guichets</option>
          {guichets.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label htmlFor="categorie" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Type</label>
        <select
          id="categorie"
          value={categorie}
          onChange={(e) => setCategorie(e.target.value)}
          style={styleSelect}
        >
          {CATEGORIES_RAPPORT.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>
    </div>
  );
};
*/

const Comptabilite = () => {
  const [onglet, setOnglet] = useState('journal');
  const ongletActif = ONGLETS.find((o) => o.id === onglet) || ONGLETS[0];

  // Journal
  const [lignes, setLignes] = useState([]);
  const [statut, setStatut] = useState('TOUS');
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [ecriture, setEcriture] = useState(null);

  // Échéancier
  const [echeances, setEcheances] = useState([]);
  const [statutEcheance, setStatutEcheance] = useState('TOUS');
  const [chargementEcheances, setChargementEcheances] = useState(true);
  const [erreurEcheances, setErreurEcheances] = useState('');

  // RAPPORT DE GUICHET — MIS EN COMMENTAIRE (voir ONGLETS plus haut).
  // const [rapport, setRapport] = useState([]);
  // const [granularite, setGranularite] = useState('ANNEE');
  // const [annee, setAnnee] = useState('');
  // const [mois, setMois] = useState('');
  // const [jour, setJour] = useState('');
  // const [guichet, setGuichet] = useState(TOUS_LES_GUICHETS);
  // const [categorie, setCategorie] = useState(TOUS_LES_TYPES);
  // const [guichets, setGuichets] = useState([]);
  // const [chargementRapport, setChargementRapport] = useState(true);
  // const [erreurRapport, setErreurRapport] = useState('');

  // useEffect(() => {
  //   let annule = false;
  //
  //   getGuichetsRapport().then(
  //     (data) => { if (!annule) setGuichets(Array.isArray(data) ? data : []); },
  //     () => { if (!annule) setGuichets([]); },
  //   );
  //
  //   return () => { annule = true; };
  // }, []);

  useEffect(() => {
    let annule = false;

    getJournal(statut).then(
      (data) => {
        if (annule) return;
        setLignes(Array.isArray(data) ? data : []);
        setErreur('');
        setChargement(false);
      },
      (err) => {
        if (annule) return;
        setErreur(messageErreur(err, 'Impossible de charger le journal comptable.'));
        setLignes([]);
        setChargement(false);
      },
    );

    return () => { annule = true; };
  }, [statut]);

  useEffect(() => {
    let annule = false;

    getEcheancierGlobal(statutEcheance).then(
      (data) => {
        if (annule) return;
        setEcheances(Array.isArray(data) ? data : []);
        setErreurEcheances('');
        setChargementEcheances(false);
      },
      (err) => {
        if (annule) return;
        setErreurEcheances(messageErreur(err, "Impossible de charger l'échéancier."));
        setEcheances([]);
        setChargementEcheances(false);
      },
    );

    return () => { annule = true; };
  }, [statutEcheance]);

  // RAPPORT DE GUICHET — MIS EN COMMENTAIRE (voir ONGLETS plus haut).
  // useEffect(() => {
  //   let annule = false;
  //
  //   getRapportGuichet({ granularite, annee, mois, jour, guichet, categorie }).then(
  //     (data) => {
  //       if (annule) return;
  //       setRapport(Array.isArray(data) ? data : []);
  //       setErreurRapport('');
  //       setChargementRapport(false);
  //     },
  //     (err) => {
  //       if (annule) return;
  //       setErreurRapport(messageErreur(err, 'Impossible de charger le rapport de guichet.'));
  //       setRapport([]);
  //       setChargementRapport(false);
  //     },
  //   );
  //
  //   return () => { annule = true; };
  // }, [granularite, annee, mois, jour, guichet, categorie]);

  const totauxJournal = calculerTotaux(lignes);
  const equilibre = Math.abs(totauxJournal.debit - totauxJournal.credit) < 1;
  const totauxEcheances = calculerTotauxEcheances(echeances);
  // const totauxRapport = calculerTotauxRapport(rapport);

  // Avec l'onglet guichet commente, seuls journal et echeancier subsistent.
  const enCours = onglet === 'echeancier' ? chargementEcheances : chargement;
  const contenuVide = onglet === 'echeancier' ? echeances.length === 0 : lignes.length === 0;

  const exporter = () => {
    if (onglet === 'echeancier') telechargerCsvEcheances(echeances, `echeancier_${horodatage()}.csv`);
    else telechargerCsv(lignes, `journal_${horodatage()}.csv`);
    // else telechargerCsvRapport(rapport, `rapport_guichet_${horodatage()}.csv`);
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '20px', margin: 0, color: 'var(--heading)' }}>Comptabilité</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>{ongletActif.sousTitre}</p>
        </div>

        <button
          onClick={exporter}
          disabled={enCours || contenuVide}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '6px',
            border: 'none', backgroundColor: '#2563eb', color: 'white', cursor: contenuVide ? 'not-allowed' : 'pointer',
            opacity: contenuVide ? 0.6 : 1, fontWeight: '500', fontSize: '14px',
          }}
        >
          <Download size={16} />
          Exporter (CSV)
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
        {ONGLETS.map((o) => {
          const Icon = o.icon;
          const actif = onglet === o.id;
          return (
            <button
              key={o.id}
              onClick={() => setOnglet(o.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px',
                border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                color: actif ? '#2563eb' : 'var(--text-secondary)',
                borderBottom: actif ? '2px solid #2563eb' : '2px solid transparent',
              }}
            >
              <Icon size={16} />
              {o.label}
            </button>
          );
        })}
      </div>

      {onglet === 'journal' && (
        <>
          {erreur && <Alerte>{erreur}</Alerte>}

          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <Carte label="Nombre d'écritures" value={lignes.length} />
            <Carte label="Total débit" value={formatMontant(totauxJournal.debit)} couleur="#16a34a" />
            <Carte label="Total crédit" value={formatMontant(totauxJournal.credit)} couleur="#dc2626" />
            <Carte label="Équilibre" value={equilibre ? 'Journal équilibré' : 'Déséquilibré'} couleur={equilibre ? '#16a34a' : '#dc2626'} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <SelecteurStatut
              id="statut-journal"
              valeur={statut}
              options={getStatutsFiltrables()}
              onChange={(e) => { setStatut(e.target.value); setChargement(true); }}
            />
          </div>

          {chargement ? <Chargement>Chargement du journal...</Chargement> : (
            <JournalTable lignes={filtrerLignes(lignes, '')} onConsulter={setEcriture} />
          )}

          {ecriture && <ConsultationEcriture ecriture={ecriture} onClose={() => setEcriture(null)} />}
        </>
      )}

      {onglet === 'echeancier' && (
        <>
          {erreurEcheances && <Alerte>{erreurEcheances}</Alerte>}

          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <Carte label="Nombre d'échéances" value={echeances.length} />
            <Carte label="Montant total" value={formatMontant(totauxEcheances.total)} />
            <Carte label="Déjà payé" value={formatMontant(totauxEcheances.payee)} couleur="#16a34a" />
            <Carte label="Reste dû" value={formatMontant(totauxEcheances.resteDu)} couleur="#dc2626" />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <SelecteurStatut
              id="statut-echeancier"
              valeur={statutEcheance}
              options={STATUTS_ECHEANCE_FILTRABLES}
              onChange={(e) => { setStatutEcheance(e.target.value); setChargementEcheances(true); }}
            />
          </div>

          {chargementEcheances ? <Chargement>Chargement de l'échéancier...</Chargement> : (
            <EcheancierTable echeances={echeances} />
          )}
        </>
      )}

      {/*
      ONGLET RAPPORT DE GUICHET MIS EN COMMENTAIRE — voir ONGLETS plus haut.
      {onglet === 'guichet' && (
        <>
          {erreurRapport && <Alerte>{erreurRapport}</Alerte>}

          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <Carte label="Guichets" value={new Set(rapport.map((l) => l.codeGuichet)).size} />
            <Carte label="Transactions" value={totauxRapport.operations} />
            <Carte label="Dépôts" value={formatMontant(totauxRapport.depots)} couleur="#16a34a" />
            <Carte label="Retraits" value={formatMontant(totauxRapport.retraits)} couleur="#dc2626" />
            <Carte label="Virements" value={formatMontant(totauxRapport.virements)} couleur="#2563eb" />
            <Carte label="Remboursements" value={formatMontant(totauxRapport.remboursements)} couleur="#7c3aed" />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <FiltresGuichet
              granularite={granularite}
              setGranularite={setGranularite}
              annee={annee}
              setAnnee={setAnnee}
              mois={mois}
              setMois={setMois}
              jour={jour}
              setJour={setJour}
              guichet={guichet}
              setGuichet={setGuichet}
              categorie={categorie}
              setCategorie={setCategorie}
              guichets={guichets}
            />
          </div>

          {chargementRapport ? <Chargement>Chargement du rapport de guichet...</Chargement> : (
            <RapportGuichetTable lignes={rapport} />
          )}

          <p style={{ marginTop: '12px', fontSize: '12px', color: 'var(--muted)' }}>
            « NON RATTACHE » regroupe les opérations sans guichet identifié : opérations antérieures
            au suivi, et remboursements d'échéance, qui sont enregistrés sans guichet. Les
            remboursements sont isolés des retraits pour ne pas être comptés deux fois.
          </p>
        </>
      )}
      */}
    </div>
  );
};

export default Comptabilite;
