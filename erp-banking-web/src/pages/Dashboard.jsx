import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Users,
  Wallet,
  ArrowLeftRight,
  Landmark,
  TrendingUp,
  PieChart as PieChartIcon,
  AlertTriangle,
  RefreshCw,
  CalendarDays,
  Inbox,
  WalletCards,
  Activity,
  Store,
  DoorOpen,
  DoorClosed,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LabelList,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
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
import { getMonGuichet, ouvrirSession, fermerSession } from '../service/caisseService';
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

const PIE_COLORS = [c.accentBlue, c.accentGreen, c.accentGold, c.accentRed, c.accentPurple];

// Couleur d'un statut de demande de crédit
const COULEUR_STATUT_DEMANDE = {
  EN_ATTENTE: c.accentGold,
  ACCEPTER: c.accentGreen,
  REJETER: c.accentRed,
  ANNULER: c.accentSlate,
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
  const [monGuichetData, setMonGuichetData] = useState(null);
  const [erreurGuichet, setErreurGuichet] = useState(false);
  const [soldeOuverture, setSoldeOuverture] = useState('');
  const [soldeFermeture, setSoldeFermeture] = useState('');

  const handleOuvrirSession = async () => {
    try {
      await ouvrirSession({ guichetId: monGuichetData?.guichetId, soldeOuverture: Number(soldeOuverture) || 0 });
      const res = await getMonGuichet();
      setMonGuichetData(res.data);
      setErreurGuichet(false);
      setSoldeOuverture('');
    } catch (e) {
      alert(e.response?.data?.message || "Erreur ouverture session");
    }
  };

  const handleFermerSession = async () => {
    try {
      await fermerSession({ soldeFermeture: Number(soldeFermeture) || 0 });
      const res = await getMonGuichet();
      setMonGuichetData(res.data);
      setErreurGuichet(false);
      setSoldeFermeture('');
    } catch (e) {
      alert(e.response?.data?.message || "Erreur fermeture session");
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
  const [demandesParStatut, setDemandesParStatut] = useState([]);
  const [dernieresDemandes, setDernieresDemandes] = useState([]);
  const [encoursParStatut, setEncoursParStatut] = useState([]);
  const [comptes, setComptes] = useState([]);
  const [credits, setCredits] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [sourcesErreur, setSourcesErreur] = useState({});
  const [chargement, setChargement] = useState(true);
  const [majLe, setMajLe] = useState(null);

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
      ]);

      const valeur = (i) => (results[i].status === 'fulfilled' ? results[i].value : null);

      const clients = valeur(0)?.data || valeur(0) || [];
      const comptesData = valeur(1)?.data || valeur(1) || [];
      const demandes = valeur(2)?.data || valeur(2) || [];
      const creditsData = valeur(3)?.data || valeur(3) || [];
      const transactionsData = valeur(4)?.data || valeur(4) || [];

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

      const statsArray = Object.keys(statuts).map((s) => ({
        statut: s,
        libelle: libelleStatut(s),
        valeur: statuts[s],
      }));

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

      setDemandesParStatut(statsArray);
      setMajLe(new Date());
      setChargement(false);
    };

    chargerStatsRef.current = chargerStats;
    chargerStats();
  }, []);

  const repartitionComptes = useMemo(() => repartitionTypeComptes(comptes), [comptes]);

  const totalComptesRepartition = useMemo(
    () => repartitionComptes.reduce((sum, item) => sum + item.valeur, 0),
    [repartitionComptes]
  );

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

  const serieSoldeCourbe = useMemo(
    () => serieSolde(buckets, transactions, comptes, compteSelectionne || null),
    [buckets, transactions, comptes, compteSelectionne]
  );

  const serieTransactionsCourbe = useMemo(
    () => serieTransactions(buckets, transactions),
    [buckets, transactions]
  );

  const serieCreditsCourbe = useMemo(
    () => serieCredits(buckets, credits),
    [buckets, credits]
  );

  const seriePerformanceCourbe = useMemo(
    () => seriePerformance(buckets, transactions, credits),
    [buckets, transactions, credits]
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
        ? transactions.length === 0 && comptes.length === 0
        : metrique === 'credits'
          ? credits.length === 0
          : transactions.length === 0,
    [metrique, transactions.length, credits.length, comptes.length]
  );

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
          <h1 className="dash-title">Tableau de bord</h1>
          <p className="dash-subtitle">Vue d'ensemble de votre activité bancaire</p>
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
              <div className="dash-skeleton dash-skeleton--stat" />
              <div className="dash-skeleton dash-skeleton--stat" />
              <div className="dash-skeleton dash-skeleton--stat" />
              <div className="dash-skeleton dash-skeleton--stat" />
            </>
          ) : (
            <>
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

      {/* ===== Dashboard AGENT - Mon Guichet ===== */}
      {role === 'AGENT' && (
        <section className="dash-panel" style={{ marginBottom: 24 }}>
          <div className="dash-panel-head">
            <span className="dash-panel-title">
              <Store size={17} />
              Mon Guichet
            </span>
            <button onClick={() => navigate('/mon-guichet')} style={{ background: 'transparent', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 500 }}>Gérer mon guichet</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16, padding: '16px' }}>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16 }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Guichet</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{monGuichetData?.codeGuichet || '-'}</div>
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                {monGuichetData?.sessionOuverte ? <><DoorOpen size={16} color={c.accentGreen}/><span style={{ color: c.accentGreen, fontWeight: 500 }}>Ouvert</span></> : <><DoorClosed size={16} color={c.accentGold}/><span style={{ color: c.accentGold, fontWeight: 500 }}>Fermé</span></>}
              </div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16 }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Solde disponible (estimé)</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>
                {erreurGuichet ? 'Indisponible' : monGuichetData ? formatMontant(monGuichetData.soldeDisponible) : 'Chargement...'}
              </div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16 }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 10 }}>Gestion session</div>
              {!monGuichetData?.sessionOuverte ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="number" placeholder="Solde ouverture" value={soldeOuverture} onChange={(e)=>setSoldeOuverture(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid var(--input-border)', background: 'var(--card-bg)', color: 'var(--text-primary)' }}/>
                  <button onClick={handleOuvrirSession} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: c.accentGreen, color: 'white', cursor: 'pointer' }}>Ouvrir</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="number" placeholder="Solde fermeture" value={soldeFermeture} onChange={(e)=>setSoldeFermeture(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid var(--input-border)', background: 'var(--card-bg)', color: 'var(--text-primary)' }}/>
                  <button onClick={handleFermerSession} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: c.accentGold, color: 'white', cursor: 'pointer' }}>Fermer</button>
                </div>
              )}
            </div>
          </div>
          <div style={{ padding: '0 16px 16px 16px' }}>
            <div style={{ fontWeight: 600, marginBottom: 10 }}>5 dernières transactions du guichet</div>
            {(monGuichetData?.dernieresTransactions||[]).length === 0 ? <div style={{ color: 'var(--text-secondary)' }}>Aucune transaction</div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(monGuichetData?.dernieresTransactions||[]).map(tx => (
                  <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--faint)' }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{tx.reference}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{tx.type} • {tx.dateTransaction ? new Date(tx.dateTransaction).toLocaleString('fr-FR') : ''}</div>
                    </div>
                    <div style={{ fontWeight: 600 }}>{formatMontant(tx.montant)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===== Courbe d'évolution ===== */}
      <section className="dash-panel dash-panel--evolution">
        <div className="dash-panel-head">
          <div className="dash-tabs" role="tablist" aria-label="Indicateur affiché">
            {METRIQUES.map((item) => (
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
      

      {/* ===== Graphiques ===== */}
      {role !== 'AGENT' && (
        <>
        <section className="dash-grid">
          <Panel
            title="Demandes par statut"
            icon={TrendingUp}
            hint={majLe ? `Mis à jour à ${formatHeure(majLe)}` : null}
          >
          {chargement ? (
            <div className="dash-skeleton dash-skeleton--chart" />
          ) : demandesParStatut.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={demandesParStatut} margin={{ top: 18, right: 6, left: -18, bottom: 0 }}>
                <CartesianGrid stroke={c.panelBorder} vertical={false} />
                <XAxis
                  dataKey="libelle"
                  tick={{ fill: c.textDim, fontSize: 11 }}
                  axisLine={{ stroke: c.panelBorder }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: c.textDim, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: c.text, fontWeight: '600' }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
                />
                <Bar dataKey="valeur" radius={[6, 6, 0, 0]} maxBarSize={56}>
                  {demandesParStatut.map((item) => (
                    <Cell
                      key={item.statut}
                      fill={COULEUR_STATUT_DEMANDE[item.statut] || c.accentBlue}
                    />
                  ))}
                  <LabelList
                    dataKey="valeur"
                    position="top"
                    fill={c.textDim}
                    fontSize={11}
                    fontWeight={600}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Aucune demande enregistrée pour le moment" />
          )}
        </Panel>

        <Panel title="Répartition des comptes" icon={PieChartIcon} hint={`${formatNombre(totalComptesRepartition)} comptes`}>
          {chargement ? (
            <div className="dash-skeleton dash-skeleton--chart" />
          ) : sourcesErreur.comptes ? (
            <EmptyState
              message={
                sourcesErreur.comptes === 403
                  ? "Vous n'avez pas les droits pour consulter les comptes."
                  : `Répartition indisponible (erreur ${sourcesErreur.comptes}).`
              }
            />
          ) : repartitionComptes.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie
                    data={repartitionComptes}
                    dataKey="valeur"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={82}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {repartitionComptes.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="dash-legend">
                {repartitionComptes.map((item, i) => (
                  <span className="dash-legend-item" key={item.type}>
                    <span
                      className="dash-legend-swatch"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    {item.type}
                    <span className="dash-legend-value">
                      {formatNombre(item.valeur)}
                      {totalComptesRepartition > 0 && (
                        <span style={{ color: c.textFaint, fontWeight: '500' }}>
                          {' '}
                          ({Math.round((item.valeur / totalComptesRepartition) * 100)}%)
                        </span>
                      )}
                    </span>
                  </span>
                ))}
              </div>
            </>
          ) : (
            <EmptyState message="Aucun compte enregistré" />
          )}
        </Panel>
      </section>

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
