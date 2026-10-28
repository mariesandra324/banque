import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Users,
  Wallet,
  ArrowLeftRight,
  Landmark,
  AlertTriangle,
  RefreshCw,
  CalendarDays,
  Inbox,
  WalletCards,
  Activity,
  Store,
  DoorOpen,
  DoorClosed,
  ArrowRight,
  History,
  BookOpen,
  BarChart3,
  ClipboardList,
} from 'lucide-react';
import Swal from 'sweetalert2';
import {
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  Area,
  AreaChart,
  Line,
  ComposedChart,
  ReferenceLine,
} from 'recharts';
import { clientService } from '../service/clientService';
import { getComptes } from '../service/compteService';
import demandeCreditService from '../service/demandeCreditService';
import { getCredits } from '../service/creditService';
import { getAllTransactions } from '../service/transactionService';
import { repartitionTypeComptes } from '../utils/typeCompte';
import {
  PERIODES,
  METRIQUES,
  construireBuckets,
  serieSolde,
  serieTransactions,
  serieCredits,
  seriePerformance,
} from '../utils/evolution';
import { getMonGuichet, getPositionCash, ouvrirSession, fermerSession } from '../service/caisseService';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

// ============ Couleurs (variables du thème clair/sombre) ============
const c = {
  bg: 'var(--bg-primary)',
  panel: 'var(--card-bg)',
  panelBorder: 'var(--border-color)',
  text: 'var(--text-primary)',
  textDim: 'var(--text-secondary)',
  textFaint: 'var(--muted)',
  accentGreen: '#10b981',
  accentGold: '#f59e0b',
  accentBlue: '#3b82f6',
  accentRed: '#ef4444',
  accentPurple: '#8b5cf6',
  accentSlate: '#64748b',
};

// Variante de badge associée à un statut de demande
const BADGE_STATUT_DEMANDE = {
  EN_ATTENTE: 'gold',
  ACCEPTER: 'green',
  REJETER: 'red',
  ANNULER: 'slate',
};

// Statuts de crédit suivis dans le détail de l'encours
const STATUTS_ENCOURS = [
  { code: 'ACTIF', libelle: 'Crédits actifs', couleur: c.accentGreen },
  { code: 'EN_COURS', libelle: 'Crédits en cours', couleur: c.accentBlue },
  { code: 'EN_RETARD', libelle: 'Crédits en retard', couleur: c.accentRed },
];

const formatMontant = (montant) =>
  new Intl.NumberFormat('fr-FR').format(Math.round(Number(montant) || 0)) + ' Ar';

const formatNombre = (valeur) => new Intl.NumberFormat('fr-FR').format(Number(valeur) || 0);

// "EN_ATTENTE" -> "En attente"
const libelleStatut = (statut) => {
  const brut = String(statut || 'INCONNU').replace(/_/g, ' ').toLowerCase();
  return brut.charAt(0).toUpperCase() + brut.slice(1);
};

const formatDate = (valeur) => {
  if (!valeur) return '';
  const date = new Date(valeur);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatHeure = (date) =>
  date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

function StatCard({ label, value, foot, variant = 'blue', icon: Icon }) {
  return (
    <article className={`dash-stat dash-stat--${variant}`}>
      <div className="dash-stat-top">
        <span className="dash-stat-label">{label}</span>
        {Icon && (
          <span className="dash-stat-icon">
            <Icon size={18} />
          </span>
        )}
      </div>
      <div className="dash-stat-value">{value}</div>
      {foot && (
        <div className="dash-stat-foot">
          <span className="dash-dot" />
          {foot}
        </div>
      )}
    </article>
  );
}

function Panel({ title, icon: Icon, hint, children }) {
  return (
    <section className="dash-panel">
      <div className="dash-panel-head">
        <span className="dash-panel-title">
          {Icon && <Icon size={17} />}
          {title}
        </span>
        {hint && <span className="dash-panel-hint">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ message, icon: Icon = Inbox }) {
  return (
    <div className="dash-empty">
      <Icon size={30} />
      <span>{message}</span>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;
  const peutVoirPositionCash = role === 'ADMIN' || role === 'GESTIONNAIRE';
  const [monGuichetData, setMonGuichetData] = useState(null);
  const [erreurGuichet, setErreurGuichet] = useState(false);

  const rafraichirGuichet = async () => {
    const res = await getMonGuichet();
    setMonGuichetData(res.data);
    setErreurGuichet(false);
  };

  const handleOuvrirSession = async () => {
    const { value } = await Swal.fire({
      title: 'Ouvrir la session',
      text: 'Saisissez le fonds de caisse présent à l’ouverture.',
      input: 'number',
      inputLabel: 'Montant (Ar)',
      inputAttributes: { min: 0, step: 1 },
      showCancelButton: true,
      confirmButtonText: 'Ouvrir',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#1d4ed8',
    });
    if (value === undefined || value === null) return;

    try {
      await ouvrirSession({
        guichetId: monGuichetData?.guichetId,
        soldeOuverture: Number(value) || 0,
      });
      await rafraichirGuichet();
    } catch (e) {
      alert(e.response?.data?.message || 'Erreur ouverture session');
    }
  };

  const handleFermerSession = async () => {
    const { value } = await Swal.fire({
      title: 'Clôturer la session',
      text: 'Saisissez le solde compté en caisse à la fermeture.',
      input: 'number',
      inputLabel: 'Montant (Ar)',
      inputAttributes: { min: 0, step: 1 },
      showCancelButton: true,
      confirmButtonText: 'Fermer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#1d4ed8',
    });
    if (value === undefined || value === null) return;

    try {
      await fermerSession({ soldeFermeture: Number(value) || 0 });
      await rafraichirGuichet();
    } catch (e) {
      alert(e.response?.data?.message || 'Erreur fermeture session');
    }
  };

  useEffect(() => {
    const chargerGuichet = async () => {
      if (role !== 'AGENT') return;
      try {
        const res = await getMonGuichet();
        setMonGuichetData(res.data);
        setErreurGuichet(false);
      } catch {
        setErreurGuichet(true);
      }
    };
    chargerGuichet();
  }, [role]);

  const [stats, setStats] = useState({
    totalClients: 0,
    totalComptes: 0,
    encoursCredit: 0,
    totalDemandes: 0,
    demandesEnAttente: 0,
    creditsEnRetard: 0,
  });
  const [positionCash, setPositionCash] = useState({ positionTotale: 0, guichets: [] });
  const [dernieresDemandes, setDernieresDemandes] = useState([]);
  const [encoursParStatut, setEncoursParStatut] = useState([]);
  const [comptes, setComptes] = useState([]);
  const [credits, setCredits] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [sourcesErreur, setSourcesErreur] = useState({});
  const [chargement, setChargement] = useState(true);

  // Sélecteurs de la courbe d'évolution
  const [periode, setPeriode] = useState('1M');
  const [metrique, setMetrique] = useState('solde');
  const [compteSelectionne, setCompteSelectionne] = useState('');

  // Le chargeur est appelé au montage (effet) et depuis le bouton
  // « Actualiser ». Il est stocké dans une ref pour rester stable.
  const chargerStatsRef = useRef(null);

  useEffect(() => {
    const chargerStats = async () => {
      setChargement(true);

      // Chargement par source : un 403 sur /credits ne doit plus masquer les
      // clients et les comptes, et inversement.
      const results = await Promise.allSettled([
        clientService.getAllClients(),
        getComptes(),
        demandeCreditService.getAll(),
        getCredits(),
        getAllTransactions(),
        ...(peutVoirPositionCash ? [getPositionCash()] : []),
      ]);

      const valeur = (i) => (results[i].status === 'fulfilled' ? results[i].value : null);

      const clients = valeur(0)?.data || valeur(0) || [];
      const comptesData = valeur(1)?.data || valeur(1) || [];
      const demandes = valeur(2)?.data || valeur(2) || [];
      const creditsData = valeur(3)?.data || valeur(3) || [];
      const transactionsData = valeur(4)?.data || valeur(4) || [];
      const positionCashData = peutVoirPositionCash ? valeur(5)?.data || valeur(5) : null;

      setComptes(Array.isArray(comptesData) ? comptesData : []);
      setCredits(Array.isArray(creditsData) ? creditsData : []);
      setTransactions(Array.isArray(transactionsData) ? transactionsData : []);

      const enErreur = {};
      const SOURCES = [
        ['clients', 0],
        ['comptes', 1],
        ['demandes', 2],
        ['credits', 3],
        ['transactions', 4],
        ...(peutVoirPositionCash ? [['caisse', 5]] : []),
      ];
      SOURCES.forEach(([source, i]) => {
        if (results[i].status === 'rejected') {
          enErreur[source] = results[i].reason?.response?.status || 'erreur';
        }
      });
      setSourcesErreur(enErreur);

      // Calculer les statistiques par statut
      const statuts = {};
      (demandes || []).forEach((d) => {
        const s = d.statut || 'INCONNU';
        statuts[s] = (statuts[s] || 0) + 1;
      });

      // Encours = capital restant des crédits actifs / en cours.
      // On ne peut pas se fier au statut des DEMANDES : StatutDemandeCredit
      // n'a pas de EN_COURS, et une demande ACCEPTEE ne porte pas le capital
      // restant réellement décaissé.
      const creditsList = Array.isArray(creditsData) ? creditsData : [];
      const encours = creditsList
        .filter((cr) => cr.statut === 'ACTIF' || cr.statut === 'EN_COURS' || cr.statut === 'EN_RETARD')
        .reduce((sum, cr) => sum + (Number(cr.capitalRestant) || 0), 0);

      // Répartition de l'encours par statut de crédit
      const detailEncours = STATUTS_ENCOURS.map(({ code, libelle, couleur }) => {
        const lignes = creditsList.filter((cr) => cr.statut === code);
        const montant = lignes.reduce((sum, cr) => sum + (Number(cr.capitalRestant) || 0), 0);
        return {
          code,
          libelle,
          couleur,
          montant,
          nombre: lignes.length,
          part: encours > 0 ? Math.round((montant / encours) * 100) : 0,
        };
      });
      setEncoursParStatut(detailEncours);

      // Dernières demandes (les plus récentes en tête)
      const recentes = [...(demandes || [])]
        .filter((d) => d?.dateDemande)
        .sort((a, b) => new Date(b.dateDemande) - new Date(a.dateDemande))
        .slice(0, 5);
      setDernieresDemandes(recentes);

      setStats({
        totalClients: (Array.isArray(clients) ? clients : []).length,
        totalComptes: (Array.isArray(comptesData) ? comptesData : []).length,
        encoursCredit: encours,
        totalDemandes: (demandes || []).length,
        demandesEnAttente: statuts.EN_ATTENTE || 0,
        creditsEnRetard: detailEncours.find((l) => l.code === 'EN_RETARD')?.nombre || 0,
      });

      setPositionCash({
        positionTotale: Number(positionCashData?.positionTotale) || 0,
        guichets: Array.isArray(positionCashData?.guichets) ? positionCashData.guichets : [],
      });
      setChargement(false);
    };

    chargerStatsRef.current = chargerStats;
    chargerStats();
  }, [role, peutVoirPositionCash]);

  const repartitionComptes = useMemo(() => repartitionTypeComptes(comptes), [comptes]);

  const aujourdhui = useMemo(
    () =>
      new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
    []
  );

  // ===== Courbe d'évolution =====
  const buckets = useMemo(() => construireBuckets(periode), [periode]);

  // Un agent ne visualise que les opérations de son propre guichet.
  const transactionsCourbe = useMemo(() => {
    if (role !== 'AGENT' || !monGuichetData?.codeGuichet) return transactions;
    return transactions.filter((tx) => tx.codeGuichet === monGuichetData.codeGuichet);
  }, [role, monGuichetData, transactions]);

  // L'agent n'a pas accès au module crédit : on masque ces indicateurs.
  const metriquesDisponibles = useMemo(
    () =>
      role === 'AGENT'
        ? METRIQUES.filter((m) => m.code === 'solde' || m.code === 'transactions')
        : METRIQUES,
    [role]
  );

  const serieSoldeCourbe = useMemo(
    () => serieSolde(buckets, transactionsCourbe, comptes, compteSelectionne || null),
    [buckets, transactionsCourbe, comptes, compteSelectionne]
  );

  const serieTransactionsCourbe = useMemo(
    () => serieTransactions(buckets, transactionsCourbe),
    [buckets, transactionsCourbe]
  );

  const serieCreditsCourbe = useMemo(
    () => serieCredits(buckets, credits),
    [buckets, credits]
  );

  const seriePerformanceCourbe = useMemo(
    () => seriePerformance(buckets, transactionsCourbe, credits),
    [buckets, transactionsCourbe, credits]
  );

  const serieCourbe = useMemo(() => {
    if (metrique === 'transactions') return serieTransactionsCourbe;
    if (metrique === 'credits') return serieCreditsCourbe;
    if (metrique === 'performance') return seriePerformanceCourbe;
    return serieSoldeCourbe;
  }, [
    metrique,
    serieSoldeCourbe,
    serieTransactionsCourbe,
    serieCreditsCourbe,
    seriePerformanceCourbe,
  ]);

  // Message contextuel affiché sous la courbe
  const resumeCourbe = useMemo(() => {
    if (metrique === 'solde') {
      const dernier = serieSoldeCourbe[serieSoldeCourbe.length - 1]?.valeur ?? 0;
      const premier = serieSoldeCourbe[0]?.valeur ?? 0;
      const variation = dernier - premier;
      return {
        principal: `${formatMontant(dernier)}`,
        detail:
          serieSoldeCourbe.length > 1
            ? `Variation ${variation >= 0 ? '+' : ''}${formatMontant(variation)} sur la période`
            : 'Solde actuel',
      };
    }
    if (metrique === 'transactions') {
      const entrees = serieTransactionsCourbe.reduce((s, p) => s + p.entrees, 0);
      const sorties = serieTransactionsCourbe.reduce((s, p) => s + p.sorties, 0);
      return {
        principal: formatMontant(entrees + sorties),
        detail: `Entrées ${formatMontant(entrees)} · Sorties ${formatMontant(sorties)}`,
      };
    }
    if (metrique === 'credits') {
      const total = serieCreditsCourbe.reduce((s, p) => s + p.valeur, 0);
      const nombre = serieCreditsCourbe.reduce((s, p) => s + p.nombre, 0);
      return {
        principal: formatMontant(total),
        detail: `${nombre} crédit(s) accordé(s) sur la période`,
      };
    }
    const net = seriePerformanceCourbe.reduce((s, p) => s + p.valeur, 0);
    return {
      principal: `${net >= 0 ? '+' : ''}${formatMontant(net)}`,
      detail: 'Flux net (entrées - sorties + crédits)',
    };
  }, [
    metrique,
    serieSoldeCourbe,
    serieTransactionsCourbe,
    serieCreditsCourbe,
    seriePerformanceCourbe,
  ]);

  const evolutionVide = useMemo(
    () =>
      metrique === 'solde'
        ? transactionsCourbe.length === 0 && comptes.length === 0
        : metrique === 'credits'
          ? credits.length === 0
          : transactionsCourbe.length === 0,
    [metrique, transactionsCourbe.length, credits.length, comptes.length]
  );

  // ===== Vue agent : guichet =====
  const sessionGuichet = monGuichetData?.sessionOuverte || null;
  const sessionActive = Boolean(sessionGuichet);
  const transactionsGuichet = monGuichetData?.dernieresTransactions || [];
  const debutJour = new Date();
  debutJour.setHours(0, 0, 0, 0);
  const transactionsJour = transactionsGuichet.filter(
    (tx) => tx.dateTransaction && new Date(tx.dateTransaction) >= debutJour
  ).length;

  const tooltipStyle = {
    backgroundColor: c.panel,
    border: `1px solid ${c.panelBorder}`,
    borderRadius: '8px',
    fontSize: '12px',
    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.12)',
  };

  // Courbe selon la métrique active
  const rendreCourbe = () => {
    if (metrique === 'transactions') {
      return (
        <AreaChart data={serieCourbe} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="gradEntrees" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.accentGreen} stopOpacity={0.35} />
              <stop offset="100%" stopColor={c.accentGreen} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradSorties" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.accentRed} stopOpacity={0.3} />
              <stop offset="100%" stopColor={c.accentRed} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={c.panelBorder} vertical={false} />
          <XAxis dataKey="label" tick={{ fill: c.textDim, fontSize: 11 }} axisLine={{ stroke: c.panelBorder }} tickLine={false} />
          <YAxis tick={{ fill: c.textDim, fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: c.text, fontWeight: '600' }}
            formatter={(valeur, nom) => [formatMontant(valeur), nom]}
          />
          <Area type="monotone" dataKey="entrees" name="Entrées" stroke={c.accentGreen} strokeWidth={2} fill="url(#gradEntrees)" />
          <Area type="monotone" dataKey="sorties" name="Sorties" stroke={c.accentRed} strokeWidth={2} fill="url(#gradSorties)" />
        </AreaChart>
      );
    }

    if (metrique === 'credits') {
      return (
        <ComposedChart data={serieCourbe} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="gradCredits" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.accentPurple} stopOpacity={0.35} />
              <stop offset="100%" stopColor={c.accentPurple} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={c.panelBorder} vertical={false} />
          <XAxis dataKey="label" tick={{ fill: c.textDim, fontSize: 11 }} axisLine={{ stroke: c.panelBorder }} tickLine={false} />
          <YAxis tick={{ fill: c.textDim, fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: c.text, fontWeight: '600' }}
            formatter={(valeur, nom) => [formatMontant(valeur), nom]}
          />
          <Bar dataKey="valeur" name="Crédits accordés" fill="url(#gradCredits)" radius={[5, 5, 0, 0]} maxBarSize={38} />
          <Line
            type="monotone"
            dataKey="cumul"
            name="Cumul"
            stroke={c.accentGold}
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      );
    }

    if (metrique === 'performance') {
      return (
        <ComposedChart data={serieCourbe} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke={c.panelBorder} vertical={false} />
          <XAxis dataKey="label" tick={{ fill: c.textDim, fontSize: 11 }} axisLine={{ stroke: c.panelBorder }} tickLine={false} />
          <YAxis tick={{ fill: c.textDim, fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: c.text, fontWeight: '600' }}
            formatter={(valeur, nom) => [formatMontant(valeur), nom]}
          />
          <ReferenceLine y={0} stroke={c.panelBorder} />
          <Bar dataKey="valeur" name="Performance" radius={[5, 5, 0, 0]} maxBarSize={38}>
            {serieCourbe.map((point, i) => (
              <Cell key={i} fill={point.valeur >= 0 ? c.accentGreen : c.accentRed} />
            ))}
          </Bar>
        </ComposedChart>
      );
    }

    return (
      <AreaChart data={serieCourbe} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="gradSolde" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.accentBlue} stopOpacity={0.35} />
            <stop offset="100%" stopColor={c.accentBlue} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={c.panelBorder} vertical={false} />
        <XAxis dataKey="label" tick={{ fill: c.textDim, fontSize: 11 }} axisLine={{ stroke: c.panelBorder }} tickLine={false} />
        <YAxis tick={{ fill: c.textDim, fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={{ color: c.text, fontWeight: '600' }}
          formatter={(valeur) => [formatMontant(valeur), 'Solde']}
        />
        <Area type="monotone" dataKey="valeur" stroke={c.accentBlue} strokeWidth={2.5} fill="url(#gradSolde)" />
      </AreaChart>
    );
  };

  return (
    <div className="dash-page">
      {/* ===== En-tête ===== */}
      <header className="dash-header">
        <div>
          <h1 className="dash-title">
            {role === 'AGENT'
              ? `Bonjour, ${user?.prenom || user?.nom || ''}`.trim()
              : 'Tableau de bord'}
          </h1>
          <p className="dash-subtitle">
            {role === 'AGENT'
              ? "Voici l'activité de votre guichet aujourd'hui"
              : "Vue d'ensemble de votre activité bancaire"}
          </p>
        </div>
        <div className="dash-header-actions">
          <span className="dash-date">
            <CalendarDays size={14} />
            {aujourdhui}
          </span>
          <button
            type="button"
            className={`dash-refresh ${chargement ? 'dash-refresh--spinning' : ''}`}
            onClick={() => { chargerStatsRef.current?.(); if(role==='AGENT'){ getMonGuichet().then(r=>{ setMonGuichetData(r.data); setErreurGuichet(false); }).catch(()=>setErreurGuichet(true)); } }}
            disabled={chargement}
          >
            <RefreshCw size={14} />
            Actualiser
          </button>
        </div>
      </header>

      {/* Sources en échec : sans ça, l'utilisateur voit des « — » et zéro
          graphique sans comprendre pourquoi. */}
      {!chargement && Object.keys(sourcesErreur).length > 0 && (
        <div className="dash-alert">
          <AlertTriangle size={15} />
          <span>
            Chargement partiel : {Object.keys(sourcesErreur).map((s) => `${s} (${sourcesErreur[s]})`).join(', ')}
          </span>
        </div>
      )}

      {/* ===== Indicateurs ===== */}
      {role !== 'AGENT' && (
        <section className="dash-stats">
          {chargement ? (
            <>
              {Array.from({ length: peutVoirPositionCash ? 5 : 4 }, (_, index) => (
                <div key={index} className="dash-skeleton dash-skeleton--stat" />
              ))}
            </>
          ) : (
            <>
              {peutVoirPositionCash && (
                <StatCard
                  label="Position de cash totale"
                  value={formatMontant(positionCash.positionTotale)}
                  foot={`Structure · ${positionCash.guichets.length} guichet(s)`}
                  variant="blue"
                  icon={WalletCards}
                />
              )}
              <StatCard
                label="Total clients"
                value={formatNombre(stats.totalClients)}
                foot="Clients enregistrés"
                variant="blue"
                icon={Users}
              />
              <StatCard
                label="Comptes"
                value={formatNombre(stats.totalComptes)}
                foot={`${repartitionComptes.length} type(s) de compte`}
                variant="green"
                icon={Landmark}
              />
              <StatCard
                label="Encours de crédit"
                value={formatMontant(stats.encoursCredit)}
                foot="Capital restant dû"
                variant="gold"
                icon={Wallet}
              />
              <StatCard
                label="Demandes"
                value={formatNombre(stats.totalDemandes)}
                foot={
                  stats.demandesEnAttente > 0
                    ? `${stats.demandesEnAttente} en attente de traitement`
                    : 'Aucune demande en attente'
                }
                variant="purple"
                icon={ArrowLeftRight}
              />
            </>
          )}
        </section>
      )}

      {/* ===== Guichets & agents (gestionnaire/admin) ===== */}
      {peutVoirPositionCash && (
        <section className="dash-panel dash-cash-panel">
          <div className="dash-panel-head">
            <span className="dash-panel-title">
              <Store size={17} />
              Guichets et agents
            </span>
            <span className="dash-panel-hint">
              {positionCash.guichets.length} guichet(s)
            </span>
          </div>

          {chargement ? (
            <div className="dash-bars">
              <div className="dash-skeleton dash-skeleton--row" />
              <div className="dash-skeleton dash-skeleton--row" />
              <div className="dash-skeleton dash-skeleton--row" />
            </div>
          ) : positionCash.guichets.length > 0 ? (
            <div className="dash-cash-table-wrap">
              <table className="dash-cash-table">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Guichet</th>
                    <th className="is-right">Solde théorique</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {positionCash.guichets.map((guichet) => (
                    <tr key={`${guichet.utilisateurId}-${guichet.guichetId}`}>
                      <td>
                        <span className="dash-cash-agent">
                          <strong>{guichet.agentNom || 'Agent'}</strong>
                        </span>
                      </td>
                      <td>
                        <span className="dash-cash-code">{guichet.codeGuichet || '—'}</span>
                      </td>
                      <td className="is-right dash-cash-amount">
                        {formatMontant(guichet.soldeTheorique)}
                      </td>
                      <td>
                        <span
                          className={`dash-badge dash-badge--${
                            guichet.statut === 'OUVERT' ? 'green' : 'slate'
                          }`}
                        >
                          {guichet.statut === 'OUVERT' ? 'Ouvert' : 'Fermé'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="Aucun agent affecté à un guichet" />
          )}
        </section>
      )}

      {/* ===== Dashboard AGENT - Mon Guichet ===== */}
      {role === 'AGENT' && (
        <section className="dash-agent">
          <div className="dash-agent-hero">
            <div className="dash-agent-hero-info">
              <span className="dash-agent-eyebrow">
                <Store size={14} />
                Mon guichet
              </span>
              <div className="dash-agent-hero-title">
                <h2>{monGuichetData?.codeGuichet || '—'}</h2>
                <span className={`dash-agent-pill ${sessionActive ? 'is-open' : 'is-closed'}`}>
                  <span className="dash-agent-pill-dot" />
                  {sessionActive ? 'Session ouverte' : 'Session fermée'}
                </span>
              </div>
              <p className="dash-agent-hero-sub">
                {sessionActive
                  ? `Ouverte ${
                      sessionGuichet?.dateOuverture
                        ? `le ${formatDate(sessionGuichet.dateOuverture)} à ${formatHeure(new Date(sessionGuichet.dateOuverture))}`
                        : 'aujourd’hui'
                    }`
                  : 'Ouvrez une session pour commencer à encaisser'}
              </p>
            </div>
            <button
              type="button"
              className="dash-agent-manage"
              onClick={() => navigate('/mon-guichet')}
            >
              Gérer mon guichet
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="dash-agent-grid">
            <article className="dash-agent-kpi">
              <span className="dash-agent-kpi-icon is-blue">
                <Wallet size={18} />
              </span>
              <div className="dash-agent-kpi-body">
                <span className="dash-agent-kpi-label">Solde disponible (estimé)</span>
                <strong className="dash-agent-kpi-value">
                  {erreurGuichet
                    ? 'Indisponible'
                    : monGuichetData
                      ? formatMontant(monGuichetData.soldeDisponible)
                      : '…'}
                </strong>
              </div>
            </article>

            <article className="dash-agent-kpi">
              <span className="dash-agent-kpi-icon is-gold">
                <Landmark size={18} />
              </span>
              <div className="dash-agent-kpi-body">
                <span className="dash-agent-kpi-label">Solde théorique du guichet</span>
                <strong className="dash-agent-kpi-value">
                  {erreurGuichet
                    ? 'Indisponible'
                    : sessionGuichet
                      ? formatMontant(sessionGuichet.soldeTheorique)
                      : '—'}
                </strong>
              </div>
            </article>

            <article className="dash-agent-kpi">
              <span className="dash-agent-kpi-icon is-purple">
                <Activity size={18} />
              </span>
              <div className="dash-agent-kpi-body">
                <span className="dash-agent-kpi-label">Transactions aujourd'hui</span>
                <strong className="dash-agent-kpi-value">{formatNombre(transactionsJour)}</strong>
              </div>
            </article>

            <article className="dash-agent-kpi">
              <span className={`dash-agent-kpi-icon ${sessionActive ? 'is-green' : 'is-gold'}`}>
                {sessionActive ? <DoorOpen size={18} /> : <DoorClosed size={18} />}
              </span>
              <div className="dash-agent-kpi-body">
                <span className="dash-agent-kpi-label">Statut de la caisse</span>
                <strong className="dash-agent-kpi-value">
                  {sessionActive ? 'Ouverte' : 'Fermée'}
                </strong>
              </div>
            </article>
          </div>

          <div className="dash-panel dash-agent-actionbar">
            <div className="dash-agent-actionbar-copy">
              <span className="dash-agent-actionbar-title">
                {sessionActive ? <DoorClosed size={17} /> : <DoorOpen size={17} />}
                {sessionActive ? 'Session en cours' : 'Aucune session ouverte'}
              </span>
              <span className="dash-agent-actionbar-sub">
                {sessionActive
                  ? 'Clôturez la caisse en fin de journée.'
                  : 'Ouvrez la caisse pour commencer les opérations.'}
              </span>
            </div>
            <div className="dash-agent-actions-buttons">
              <button
                type="button"
                className={`dash-agent-btn ${sessionActive ? 'is-gold' : 'is-green'}`}
                onClick={sessionActive ? handleFermerSession : handleOuvrirSession}
              >
                {sessionActive ? <DoorClosed size={15} /> : <DoorOpen size={15} />}
                {sessionActive ? 'Fermer la session' : 'Ouvrir la session'}
              </button>
              <button
                type="button"
                className="dash-agent-shortcut"
                onClick={() => navigate('/transactions')}
              >
                <ArrowLeftRight size={16} />
                Transactions
                <ArrowRight size={14} />
              </button>
              <button
                type="button"
                className="dash-agent-shortcut"
                onClick={() => navigate('/mon-guichet', { state: { tab: 'historique' } })}
              >
                <History size={16} />
                Historique
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </section>
      )}

      {role === 'COMPTABLE' && (
        <section
          aria-label="Raccourcis comptable"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '14px',
            marginBottom: '20px',
          }}
        >
          {[
            { label: 'Comptabilité', detail: 'Journal et échéancier', icon: BookOpen, path: '/comptabilite' },
            { label: 'Rapports', detail: 'Consulter les rapports', icon: BarChart3, path: '/rapports' },
            { label: 'Audit', detail: 'Consulter les événements', icon: ClipboardList, path: '/audit' },
          ].map(({ label, detail, icon: Icon, path }) => (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '18px',
                textAlign: 'left',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                cursor: 'pointer',
              }}
            >
              <Icon size={20} color={c.accentBlue} />
              <span style={{ display: 'grid', gap: '4px', flex: 1 }}>
                <strong style={{ fontSize: '14px' }}>{label}</strong>
                <span style={{ color: 'var(--muted)', fontSize: '12px' }}>{detail}</span>
              </span>
              <ArrowRight size={16} color="var(--muted)" />
            </button>
          ))}
        </section>
      )}

      {/* ===== Courbe d'évolution ===== */}
      <section className="dash-panel dash-panel--evolution">
        <div className="dash-panel-head">
          <div className="dash-tabs" role="tablist" aria-label="Indicateur affiché">
            {metriquesDisponibles.map((item) => (
              <button
                key={item.code}
                type="button"
                role="tab"
                aria-selected={metrique === item.code}
                className={`dash-tab ${metrique === item.code ? 'dash-tab--active' : ''}`}
                onClick={() => setMetrique(item.code)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="dash-periods" role="group" aria-label="Période affichée">
            {PERIODES.map((item) => (
              <button
                key={item.code}
                type="button"
                title={item.label}
                className={`dash-period ${periode === item.code ? 'dash-period--active' : ''}`}
                onClick={() => setPeriode(item.code)}
              >
                {item.code}
              </button>
            ))}
          </div>
        </div>

        <div className="dash-evolution-summary">
          <div>
            <span className="dash-evolution-value">{resumeCourbe.principal}</span>
            <span className="dash-evolution-detail">{resumeCourbe.detail}</span>
          </div>

            {metrique === 'solde' && comptes.length > 0 && (
              <select
                className="dash-select"
                value={compteSelectionne}
                onChange={(e) => setCompteSelectionne(e.target.value)}
                aria-label="Type de compte analysé"
              >
                <option value="">Tous les types de comptes</option>
                {[...new Set(comptes.map((cp) => cp.typeCompte).filter(Boolean))]
                  .sort()
                  .map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
              </select>
            )}
        </div>

        <div className="dash-evolution-chart">
          {chargement ? (
            <div className="dash-skeleton dash-skeleton--chart" />
          ) : evolutionVide ? (
            <EmptyState message="Pas assez de données sur la période sélectionnée" icon={Activity} />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              {rendreCourbe()}
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* ===== Transactions AGENT — sous la courbe ===== */}
      {role === 'AGENT' && (
        <section className="dash-agent-actions">
          <section className="dash-panel dash-agent-activity">
            <div className="dash-panel-head">
              <span className="dash-panel-title">
                <ArrowLeftRight size={17} />
                Dernières transactions du guichet
              </span>
              <span className="dash-panel-hint">5 plus récentes</span>
            </div>
            {transactionsGuichet.length === 0 ? (
              <EmptyState message="Aucune transaction sur ce guichet" />
            ) : (
              <div className="dash-agent-tx-list">
                {transactionsGuichet.map((tx) => (
                  <div className="dash-agent-tx" key={tx.id}>
                    <span className="dash-agent-tx-icon">
                      <ArrowLeftRight size={15} />
                    </span>
                    <div className="dash-agent-tx-main">
                      <span className="dash-agent-tx-ref">{tx.reference || 'Transaction'}</span>
                      <span className="dash-agent-tx-meta">
                        {libelleStatut(tx.type)}
                        {tx.dateTransaction
                          ? ` · ${new Date(tx.dateTransaction).toLocaleString('fr-FR')}`
                          : ''}
                      </span>
                    </div>
                    <span className="dash-agent-tx-amount">{formatMontant(tx.montant)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </section>
      )}

      {/* ===== Graphiques ===== */}
      {role !== 'AGENT' && (
        <>
      {/* ===== Encours & activité récente ===== */}
      <section className="dash-grid dash-grid--even">
        <Panel title="Encours par statut" icon={WalletCards} hint={`${formatMontant(stats.encoursCredit)} au total`}>
          {chargement ? (
            <div className="dash-skeleton dash-skeleton--chart" />
          ) : (
            <>
              <div className="dash-bars">
                {encoursParStatut.map((ligne) => (
                  <div className="dash-bar-row" key={ligne.code}>
                    <div className="dash-bar-head">
                      <span className="dash-bar-label">
                        <span className="dash-legend-swatch" style={{ backgroundColor: ligne.couleur }} />
                        {ligne.libelle}
                        <span style={{ color: c.textFaint, fontWeight: '500' }}>({ligne.nombre})</span>
                      </span>
                      <span className="dash-bar-value">{formatMontant(ligne.montant)}</span>
                    </div>
                    <div className="dash-bar-track">
                      <div
                        className="dash-bar-fill"
                        style={{ width: `${ligne.part}%`, backgroundColor: ligne.couleur }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {stats.creditsEnRetard > 0 && (
                <div className="dash-alert" style={{ marginBottom: 0, marginTop: 18 }}>
                  <AlertTriangle size={15} />
                  <span>
                    {stats.creditsEnRetard} crédit(s) en retard de remboursement. Une relance est recommandée.
                  </span>
                </div>
              )}
            </>
          )}
        </Panel>

        <Panel title="Dernières demandes" icon={ArrowLeftRight} hint="5 plus récentes">
          {chargement ? (
            <div className="dash-bars">
              <div className="dash-skeleton dash-skeleton--row" />
              <div className="dash-skeleton dash-skeleton--row" />
              <div className="dash-skeleton dash-skeleton--row" />
            </div>
          ) : dernieresDemandes.length > 0 ? (
            <div className="dash-list">
              {dernieresDemandes.map((demande) => (
                <div className="dash-list-item" key={demande.id}>
                  <div className="dash-list-main">
                    <div className="dash-list-title">
                      {[demande.clientPrenom, demande.clientNom].filter(Boolean).join(' ') || 'Client inconnu'}
                    </div>
                    <div className="dash-list-sub">
                      {formatDate(demande.dateDemande)}
                      {demande.duree ? ` · ${demande.duree} mois` : ''}
                    </div>
                  </div>
                  <div className="dash-list-side">
                    <span className="dash-list-amount">{formatMontant(demande.montantDemande)}</span>
                    <span className={`dash-badge dash-badge--${BADGE_STATUT_DEMANDE[demande.statut] || 'slate'}`}>
                      {libelleStatut(demande.statut)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Aucune demande récente" />
          )}
        </Panel>
      </section>
        </>
      )}
    </div>
  );
}

export default Dashboard;
