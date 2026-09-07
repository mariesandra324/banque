import { useEffect, useState, useMemo } from 'react';
import { Users, Landmark, PieChart as PieChartIcon, BarChart2, TrendingUp, ArrowLeftRight, Wallet } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import { clientService } from '../service/clientService';
import { getComptes } from '../service/compteService';
import { getAllTransactions } from '../service/transactionService';
import { getDemandesCredit, getCredits } from '../service/creditService';

// ============ Couleurs (reprises du Dashboard) ============
const c = {
  bg: '#f8fafc',
  panel: '#ffffff',
  panelBorder: '#e2e8f0',
  text: '#1f2937',
  textDim: '#6b7280',
  textFaint: '#9ca3af',
  accentGreen: '#10b981',
  accentGold: '#f59e0b',
  accentBlue: '#3b82f6',
  accentRed: '#ef4444',
  accentPurple: '#8b5cf6',
};

const PIE_COLORS = [c.accentBlue, c.accentGreen, c.accentGold, c.accentRed, c.accentPurple];

// Liste des onglets de rapport disponibles (facile à étendre pour les prochains modules)
const ONGLETS = [
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'comptes', label: 'Comptes', icon: Landmark },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'credits', label: 'Crédits', icon: Wallet },
];

function StatCard({ label, value, sublabel, color, icon: Icon }) {
  return (
    <div style={{
      backgroundColor: c.panel, border: `1px solid ${c.panelBorder}`, borderRadius: '8px',
      padding: '20px', flex: 1, minWidth: '200px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '12px', color: c.textDim, fontWeight: '500', marginBottom: '4px' }}>{label}</div>
          <div style={{ fontSize: '26px', fontWeight: '700', color: c.text }}>{value ?? '—'}</div>
        </div>
        {Icon && <Icon size={22} color={color} />}
      </div>
      {sublabel && <div style={{ fontSize: '11px', color, fontWeight: '600' }}>{sublabel}</div>}
    </div>
  );
}

function ChartPanel({ title, icon: Icon, children }) {
  return (
    <div style={{ backgroundColor: c.panel, border: `1px solid ${c.panelBorder}`, borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        {Icon && <Icon size={18} color={c.accentBlue} />}
        <span style={{ fontSize: '14px', fontWeight: '600', color: c.text }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', color: c.textFaint, fontSize: '12px' }}>
      Pas assez de données pour ce graphique
    </div>
  );
}

// ---------- Utilitaires ----------

function calculerAge(dateNaissance) {
  if (!dateNaissance) return null;
  const naissance = new Date(dateNaissance);
  const diff = Date.now() - naissance.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function moisLabel(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
}

const formatMontant = (montant) =>
  new Intl.NumberFormat('fr-FR').format(Math.round(montant || 0)) + ' Ar';

// ---------- Calculs : Clients ----------

function calculerStatsClients(clients) {
  const total = clients.length;

  const tranches = { '< 25 ans': 0, '25-40 ans': 0, '40-60 ans': 0, '60 ans +': 0, 'Non renseigné': 0 };
  clients.forEach((cl) => {
    const age = calculerAge(cl.dateNaissance);
    if (age === null) tranches['Non renseigné']++;
    else if (age < 25) tranches['< 25 ans']++;
    else if (age < 40) tranches['25-40 ans']++;
    else if (age < 60) tranches['40-60 ans']++;
    else tranches['60 ans +']++;
  });
  const repartitionAge = Object.entries(tranches)
    .filter(([, valeur]) => valeur > 0)
    .map(([tranche, valeur]) => ({ tranche, valeur }));

  const parMois = {};
  clients.forEach((cl) => {
    if (!cl.dateCreation) return;
    const label = moisLabel(cl.dateCreation);
    parMois[label] = (parMois[label] || 0) + 1;
  });
  const evolutionInscriptions = Object.entries(parMois).map(([mois, valeur]) => ({ mois, valeur }));

  const moisActuel = moisLabel(new Date().toISOString());
  const nouveauxCeMois = parMois[moisActuel] || 0;

  return { total, repartitionAge, evolutionInscriptions, nouveauxCeMois };
}

// ---------- Calculs : Comptes ----------

function calculerStatsComptes(comptes) {
  const total = comptes.length;
  const soldeTotal = comptes.reduce((sum, cp) => sum + (Number(cp.solde) || 0), 0);
  const soldeMoyen = total > 0 ? soldeTotal / total : 0;

  const parType = {};
  comptes.forEach((cp) => {
    const type = cp.typeCompte || 'Non renseigné';
    parType[type] = (parType[type] || 0) + 1;
  });
  const repartitionType = Object.entries(parType).map(([type, valeur]) => ({ type, valeur }));

  const parStatut = {};
  comptes.forEach((cp) => {
    const statut = cp.statut || 'Non renseigné';
    parStatut[statut] = (parStatut[statut] || 0) + 1;
  });
  const repartitionStatut = Object.entries(parStatut).map(([statut, valeur]) => ({ statut, valeur }));

  const soldeParType = {};
  const countParType = {};
  comptes.forEach((cp) => {
    const type = cp.typeCompte || 'Non renseigné';
    soldeParType[type] = (soldeParType[type] || 0) + (Number(cp.solde) || 0);
    countParType[type] = (countParType[type] || 0) + 1;
  });
  const soldeMoyenParType = Object.keys(soldeParType).map((type) => ({
    type,
    valeur: Math.round(soldeParType[type] / countParType[type]),
  }));

  return { total, soldeTotal, soldeMoyen, repartitionType, repartitionStatut, soldeMoyenParType };
}

// ---------- Calculs : Transactions ----------

function calculerStatsTransactions(transactions) {
  const total = transactions.length;

  const transactionsReussies = transactions.filter((t) => t.statut === 'SUCCES');
  const montantTotal = transactionsReussies.reduce((sum, t) => sum + (Number(t.montant) || 0), 0);

  const parType = {};
  transactions.forEach((t) => {
    const type = t.type || 'Non renseigné';
    parType[type] = (parType[type] || 0) + 1;
  });
  const repartitionType = Object.entries(parType).map(([type, valeur]) => ({ type, valeur }));

  const parStatut = {};
  transactions.forEach((t) => {
    const statut = t.statut || 'Non renseigné';
    parStatut[statut] = (parStatut[statut] || 0) + 1;
  });
  const repartitionStatut = Object.entries(parStatut).map(([statut, valeur]) => ({ statut, valeur }));

  const parMois = {};
  transactions.forEach((t) => {
    if (!t.dateTransaction) return;
    const label = moisLabel(t.dateTransaction);
    parMois[label] = (parMois[label] || 0) + 1;
  });
  const evolutionVolume = Object.entries(parMois).map(([mois, valeur]) => ({ mois, valeur }));

  return { total, montantTotal, repartitionType, repartitionStatut, evolutionVolume };
}

// ---------- Calculs : Crédits (Demandes + Crédits accordés) ----------

function calculerStatsCredits(demandes, credits) {
  const totalDemandes = demandes.length;
  const totalCredits = credits.length;

  const parStatutDemande = {};
  demandes.forEach((d) => {
    const statut = d.statut || 'Non renseigné';
    parStatutDemande[statut] = (parStatutDemande[statut] || 0) + 1;
  });
  const repartitionStatutDemande = Object.entries(parStatutDemande).map(([statut, valeur]) => ({ statut, valeur }));

  const parStatutCredit = {};
  credits.forEach((cr) => {
    const statut = cr.statut || 'Non renseigné';
    parStatutCredit[statut] = (parStatutCredit[statut] || 0) + 1;
  });
  const repartitionStatutCredit = Object.entries(parStatutCredit).map(([statut, valeur]) => ({ statut, valeur }));

  const montantTotalDemande = demandes.reduce((sum, d) => sum + (Number(d.montantDemande) || 0), 0);

  // Encours = capital restant des crédits encore actifs / en cours
  const encoursTotal = credits
    .filter((cr) => cr.statut === 'ACTIF' || cr.statut === 'EN_COURS')
    .reduce((sum, cr) => sum + (Number(cr.capitalRestant) || 0), 0);

  const demandesTraitees = demandes.filter((d) => d.statut === 'ACCEPTER' || d.statut === 'REJETER');
  const demandesAcceptees = demandes.filter((d) => d.statut === 'ACCEPTER');
  const tauxAcceptation = demandesTraitees.length > 0
    ? Math.round((demandesAcceptees.length / demandesTraitees.length) * 100)
    : null;

  return {
    totalDemandes, totalCredits, repartitionStatutDemande, repartitionStatutCredit,
    montantTotalDemande, encoursTotal, tauxAcceptation,
  };
}

// ---------- Composants graphiques réutilisables ----------

function GraphiquePie({ data, dataKeyName }) {
  if (data.length === 0) return <EmptyState />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="valeur"
          nameKey={dataKeyName}
          cx="50%" cy="50%"
          outerRadius={90}
          label={(entry) => `${entry[dataKeyName]}: ${entry.valeur}`}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: c.panel, border: `1px solid ${c.panelBorder}`, borderRadius: '6px', fontSize: '12px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function GraphiqueBarres({ data, dataKeyName, couleur = c.accentBlue, formatterY }) {
  if (data.length === 0) return <EmptyState />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid stroke={c.panelBorder} vertical={false} />
        <XAxis dataKey={dataKeyName} tick={{ fill: c.textDim, fontSize: 11 }} axisLine={{ stroke: c.panelBorder }} tickLine={false} />
        <YAxis tick={{ fill: c.textDim, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} tickFormatter={formatterY} />
        <Tooltip contentStyle={{ backgroundColor: c.panel, border: `1px solid ${c.panelBorder}`, borderRadius: '6px', fontSize: '12px' }} cursor={{ fill: 'rgba(59,130,246,0.1)' }} />
        <Bar dataKey="valeur" fill={couleur} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function GraphiqueLigne({ data }) {
  if (data.length === 0) return <EmptyState />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid stroke={c.panelBorder} vertical={false} />
        <XAxis dataKey="mois" tick={{ fill: c.textDim, fontSize: 11 }} axisLine={{ stroke: c.panelBorder }} tickLine={false} />
        <YAxis tick={{ fill: c.textDim, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ backgroundColor: c.panel, border: `1px solid ${c.panelBorder}`, borderRadius: '6px', fontSize: '12px' }} />
        <Line type="monotone" dataKey="valeur" stroke={c.accentBlue} strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ---------- Composant principal ----------

function Rapports() {
  const [onglet, setOnglet] = useState('clients');
  const [clients, setClients] = useState([]);
  const [comptes, setComptes] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [credits, setCredits] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    const charger = async () => {
      setChargement(true);
      try {
        const [clientsData, comptesRes, transactionsData, demandesData, creditsData] = await Promise.all([
          clientService.getAllClients(),
          getComptes(),
          getAllTransactions(),
          getDemandesCredit(),
          getCredits(),
        ]);
        setClients(Array.isArray(clientsData) ? clientsData : []);
        setComptes(Array.isArray(comptesRes?.data) ? comptesRes.data : []);
        setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
        setDemandes(Array.isArray(demandesData) ? demandesData : []);
        setCredits(Array.isArray(creditsData) ? creditsData : []);
        setErreur(null);
      } catch (err) {
        console.error('Erreur chargement rapports :', err);
        setErreur(err.message || 'Impossible de charger les données pour le rapport.');
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, []);

  const statsClients = useMemo(() => calculerStatsClients(clients), [clients]);
  const statsComptes = useMemo(() => calculerStatsComptes(comptes), [comptes]);
  const statsTransactions = useMemo(() => calculerStatsTransactions(transactions), [transactions]);
  const statsCredits = useMemo(() => calculerStatsCredits(demandes, credits), [demandes, credits]);

  if (chargement) {
    return <div style={{ padding: '20px' }}>Chargement des rapports...</div>;
  }

  if (erreur) {
    return <div style={{ padding: '20px', color: 'red' }}>Erreur : {erreur}</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: c.bg, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <main style={{ padding: '28px 32px' }}>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: c.text, margin: '0 0 8px' }}>Rapports</h1>
          <p style={{ fontSize: '13px', color: c.textDim, margin: 0 }}>Statistiques par module</p>
        </div>

        {/* Onglets */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', borderBottom: `1px solid ${c.panelBorder}`, flexWrap: 'wrap' }}>
          {ONGLETS.map((o) => {
            const Icon = o.icon;
            const actif = onglet === o.id;
            return (
              <button
                key={o.id}
                onClick={() => setOnglet(o.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: '600',
                  color: actif ? c.accentBlue : c.textDim,
                  borderBottom: actif ? `2px solid ${c.accentBlue}` : '2px solid transparent',
                }}
              >
                <Icon size={16} />
                {o.label}
              </button>
            );
          })}
        </div>

        {/* ===== Onglet Clients ===== */}
        {onglet === 'clients' && (
          <>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <StatCard label="Total clients" value={statsClients.total} sublabel="Tous statuts confondus" color={c.accentGreen} icon={Users} />
              <StatCard label="Nouveaux ce mois-ci" value={statsClients.nouveauxCeMois} sublabel="Basé sur la date de création" color={c.accentBlue} icon={TrendingUp} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <ChartPanel title="Répartition par tranche d'âge" icon={PieChartIcon}>
                <GraphiquePie data={statsClients.repartitionAge} dataKeyName="tranche" />
              </ChartPanel>

              <ChartPanel title="Évolution des inscriptions" icon={BarChart2}>
                <GraphiqueLigne data={statsClients.evolutionInscriptions} />
              </ChartPanel>
            </div>
          </>
        )}

        {/* ===== Onglet Comptes ===== */}
        {onglet === 'comptes' && (
          <>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <StatCard label="Total comptes" value={statsComptes.total} sublabel="Tous types confondus" color={c.accentGreen} icon={Landmark} />
              <StatCard label="Solde cumulé" value={formatMontant(statsComptes.soldeTotal)} sublabel="Somme de tous les comptes" color={c.accentGold} icon={TrendingUp} />
              <StatCard label="Solde moyen" value={formatMontant(statsComptes.soldeMoyen)} sublabel="Par compte" color={c.accentBlue} icon={BarChart2} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <ChartPanel title="Répartition par type de compte" icon={PieChartIcon}>
                <GraphiquePie data={statsComptes.repartitionType} dataKeyName="type" />
              </ChartPanel>

              <ChartPanel title="Répartition par statut" icon={BarChart2}>
                <GraphiqueBarres data={statsComptes.repartitionStatut} dataKeyName="statut" couleur={c.accentBlue} />
              </ChartPanel>
            </div>

            <ChartPanel title="Solde moyen par type de compte" icon={TrendingUp}>
              <GraphiqueBarres data={statsComptes.soldeMoyenParType} dataKeyName="type" couleur={c.accentGold} formatterY={(v) => `${v / 1000}k`} />
            </ChartPanel>
          </>
        )}

        {/* ===== Onglet Transactions ===== */}
        {onglet === 'transactions' && (
          <>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <StatCard label="Total transactions" value={statsTransactions.total} sublabel="Tous statuts confondus" color={c.accentGreen} icon={ArrowLeftRight} />
              <StatCard label="Montant total transigé" value={formatMontant(statsTransactions.montantTotal)} sublabel="Transactions réussies uniquement" color={c.accentGold} icon={TrendingUp} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <ChartPanel title="Répartition par type" icon={PieChartIcon}>
                <GraphiquePie data={statsTransactions.repartitionType} dataKeyName="type" />
              </ChartPanel>

              <ChartPanel title="Répartition par statut" icon={BarChart2}>
                <GraphiqueBarres data={statsTransactions.repartitionStatut} dataKeyName="statut" couleur={c.accentRed} />
              </ChartPanel>
            </div>

            <ChartPanel title="Évolution du volume par mois" icon={TrendingUp}>
              <GraphiqueLigne data={statsTransactions.evolutionVolume} />
            </ChartPanel>
          </>
        )}

        {/* ===== Onglet Crédits ===== */}
        {onglet === 'credits' && (
          <>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <StatCard label="Total demandes" value={statsCredits.totalDemandes} sublabel="Toutes décisions confondues" color={c.accentBlue} icon={Wallet} />
              <StatCard label="Crédits accordés" value={statsCredits.totalCredits} sublabel="Total des crédits créés" color={c.accentGreen} icon={Landmark} />
              <StatCard
                label="Taux d'acceptation"
                value={statsCredits.tauxAcceptation !== null ? `${statsCredits.tauxAcceptation}%` : '—'}
                sublabel="Sur les demandes traitées"
                color={c.accentGold}
                icon={TrendingUp}
              />
              <StatCard label="Encours total" value={formatMontant(statsCredits.encoursTotal)} sublabel="Capital restant (crédits actifs)" color={c.accentRed} icon={BarChart2} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <ChartPanel title="Demandes par statut" icon={PieChartIcon}>
                <GraphiquePie data={statsCredits.repartitionStatutDemande} dataKeyName="statut" />
              </ChartPanel>

              <ChartPanel title="Crédits par statut" icon={BarChart2}>
                <GraphiqueBarres data={statsCredits.repartitionStatutCredit} dataKeyName="statut" couleur={c.accentPurple} />
              </ChartPanel>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Rapports;
