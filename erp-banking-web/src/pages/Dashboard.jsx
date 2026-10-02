import { useEffect, useMemo, useState } from 'react';
import { Users, Wallet, ArrowLeftRight, Landmark, TrendingUp, PieChart as PieChartIcon, AlertTriangle } from 'lucide-react';
import {BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,CartesianGrid, PieChart, Pie, Cell,} from 'recharts';
import { clientService } from '../service/clientService';
import { getComptes } from '../service/compteService';
import demandeCreditService from '../service/demandeCreditService';
import { getCredits } from '../service/creditService';
import { repartitionTypeComptes } from '../utils/typeCompte';

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
};

const PIE_COLORS = [c.accentBlue, c.accentGreen, c.accentGold, c.accentRed, c.accentPurple];

function StatCard({ label, value, delta, sparkColor, icon: Icon }) {
  return (
    <div style={{
      backgroundColor: c.panel, border: `1px solid ${c.panelBorder}`, borderRadius: '8px',
      padding: '20px', flex: 1, minWidth: '200px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '12px', color: c.textDim, fontWeight: '500', marginBottom: '4px' }}>{label}</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: c.text }}>{value || '—'}</div>
        </div>
        {Icon && <Icon size={24} color={sparkColor} />}
      </div>
      <div style={{ fontSize: '11px', color: sparkColor, fontWeight: '600' }}>
        {delta}
      </div>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalComptes: 0,
    encoursCredit: 0,
    totalDemandes: 0,
  });
  const [creditsParStatut, setCreditsParStatut] = useState([]);
  const [comptes, setComptes] = useState([]);
  const [sourcesErreur, setSourcesErreur] = useState({});
  const [chargement, setChargement] = useState(true);

  // Format montant en Ar
  const formatMontant = (montant) => {
    if (!montant) return '0 Ar';
    return new Intl.NumberFormat('fr-FR').format(montant) + ' Ar';
  };

  // Récupérer les statistiques
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
      ]);

      const valeur = (i) => (results[i].status === 'fulfilled' ? results[i].value : null);

      const clients = valeur(0)?.data || valeur(0) || [];
      const comptesData = valeur(1)?.data || valeur(1) || [];
      const demandes = valeur(2)?.data || valeur(2) || [];
      const credits = valeur(3)?.data || valeur(3) || [];

      setComptes(Array.isArray(comptesData) ? comptesData : []);

      const enErreur = {};
      const SOURCES = [
        ['clients', 0],
        ['comptes', 1],
        ['demandes', 2],
        ['credits', 3],
      ];
      SOURCES.forEach(([source, i]) => {
        if (results[i].status === 'rejected') {
          enErreur[source] = results[i].reason?.response?.status || 'erreur';
        }
      });
      setSourcesErreur(enErreur);

      // Calculer les statistiques par statut
      const statuts = {};
      (demandes || []).forEach(d => {
        const s = d.statut || 'INCONNU';
        statuts[s] = (statuts[s] || 0) + 1;
      });

      const statsArray = Object.keys(statuts).map(s => ({
        statut: s,
        valeur: statuts[s],
      }));

      // Encours = capital restant des crédits actifs / en cours.
      // On ne peut pas se fier au statut des DEMANDES : StatutDemandeCredit
      // n'a pas de EN_COURS, et une demande ACCEPTEE ne porte pas le capital
      // restant réellement décaissé.
      const encours = (credits || [])
        .filter(cr => cr.statut === 'ACTIF' || cr.statut === 'EN_COURS')
        .reduce((sum, cr) => sum + (Number(cr.capitalRestant) || 0), 0);

      setStats({
        totalClients: (Array.isArray(clients) ? clients : []).length,
        totalComptes: (Array.isArray(comptesData) ? comptesData : []).length,
        encoursCredit: encours,
        totalDemandes: (demandes || []).length,
      });

      setCreditsParStatut(statsArray);
      setChargement(false);
    };

    chargerStats();
  }, []);

  const repartitionComptes = useMemo(() => repartitionTypeComptes(comptes), [comptes]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: c.bg, fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ===== Contenu principal ===== */}
      <main style={{ padding: '28px 32px' }}>

        {/* Titre */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: c.text, margin: '0 0 8px' }}>Tableau de bord</h1>
          <p style={{ fontSize: '13px', color: c.textDim, margin: 0 }}>Bienvenue dans votre espace de gestion bancaire</p>
        </div>

        {/* Sources en échec : sans ça, l'utilisateur voit des « — » et zéro
            graphique sans comprendre pourquoi. */}
        {!chargement && Object.keys(sourcesErreur).length > 0 && (
          <div style={{
            padding: '10px 14px', borderRadius: '6px', marginBottom: '20px',
            backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '12px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <AlertTriangle size={14} />
            Chargement partiel : {Object.keys(sourcesErreur).map(s => `${s} (${sourcesErreur[s]})`).join(', ')}
          </div>
        )}

        {/* Stat cards */}
        {!chargement && (
          <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
            <StatCard 
              label="Total clients" 
              value={stats.totalClients}
              delta="Clients actifs"
              sparkColor={c.accentGreen}
              icon={Users}
            />
            <StatCard 
              label="Comptes actifs" 
              value={stats.totalComptes}
              delta="Tous les comptes"
              sparkColor={c.accentBlue}
              icon={Landmark}
            />
            <StatCard 
              label="Encours de crédit" 
              value={formatMontant(stats.encoursCredit)}
              delta="Capital restant"
              sparkColor={c.accentGold}
              icon={Wallet}
            />
            <StatCard 
              label="Demandes totales" 
              value={stats.totalDemandes}
              delta="Toutes les demandes"
              sparkColor={c.accentRed}
              icon={ArrowLeftRight}
            />
          </div>
        )}

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>

          {/* Bar Chart - Crédits par statut */}
          <div style={{ backgroundColor: c.panel, border: `1px solid ${c.panelBorder}`, borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <TrendingUp size={18} color={c.accentBlue} />
              <span style={{ fontSize: '14px', fontWeight: '600', color: c.text }}>Demandes par statut</span>
            </div>
            {creditsParStatut.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={creditsParStatut}>
                  <CartesianGrid stroke={c.panelBorder} vertical={false} />
                  <XAxis 
                    dataKey="statut" 
                    tick={{ fill: c.textDim, fontSize: 11 }} 
                    axisLine={{ stroke: c.panelBorder }} 
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: c.textDim, fontSize: 11 }} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: c.panel, border: `1px solid ${c.panelBorder}`, borderRadius: '6px', fontSize: '12px' }}
                    labelStyle={{ color: c.text }}
                    cursor={{ fill: 'rgba(16,185,129,0.1)' }}
                  />
                  <Bar dataKey="valeur" fill={c.accentGreen} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: c.textFaint }}>
                Pas de données disponibles
              </div>
            )}
          </div>

          {/* Pie Chart - Répartition des comptes par type */}
          <div style={{ backgroundColor: c.panel, border: `1px solid ${c.panelBorder}`, borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <PieChartIcon size={18} color={c.accentBlue} />
              <span style={{ fontSize: '14px', fontWeight: '600', color: c.text }}>Répartition des comptes</span>
            </div>
            {chargement ? (
              <div style={{ padding: '40px', textAlign: 'center', color: c.textFaint, fontSize: '12px' }}>
                Chargement...
              </div>
            ) : sourcesErreur.comptes ? (
              <div style={{ padding: '40px', textAlign: 'center', color: c.textFaint, fontSize: '12px' }}>
                {sourcesErreur.comptes === 403
                  ? "Vous n'avez pas les droits pour consulter les comptes."
                  : `Répartition indisponible (erreur ${sourcesErreur.comptes}).`}
              </div>
            ) : repartitionComptes.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={repartitionComptes}
                      dataKey="valeur"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                    >
                      {repartitionComptes.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: c.panel, border: `1px solid ${c.panelBorder}`, borderRadius: '6px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 16px', marginTop: '8px' }}>
                  {repartitionComptes.map((item, i) => (
                    <div key={item.type} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: c.textDim }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span>{item.type}</span>
                      <span style={{ fontWeight: '600', color: c.text }}>{item.valeur}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: c.textFaint, fontSize: '12px' }}>
                Aucun compte enregistré
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
