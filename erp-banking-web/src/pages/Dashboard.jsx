import { useEffect, useState } from 'react';
import { Users, Wallet, ArrowLeftRight, Landmark, TrendingUp} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { clientService } from '../service/clientService';
import { getComptes } from '../service/compteService';
import demandeCreditService from '../service/demandeCreditService';

// ============ Couleurs ============
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
};

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
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClients: 0,
    totalComptes: 0,
    encoursCredit: 0,
    totalDemandes: 0,
  });
  const [creditsParStatut, setCreditsParStatut] = useState([]);
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
      try {
        // Récupérer les clients
        const clientsRes = await clientService.getAllClients();
        const clients = clientsRes?.data || clientsRes || [];
        
        // Récupérer les comptes
        const comptesRes = await getComptes();
        const comptes = comptesRes?.data || comptesRes || [];
        
        // Récupérer les demandes de crédit
        const demandes = await demandeCreditService.getAll();
        
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

        // Calculer l'encours de crédit
        const encours = (demandes || [])
          .filter(d => d.statut === 'ACCEPTER' || d.statut === 'EN_COURS')
          .reduce((sum, d) => sum + (d.montantDemande || 0), 0);

        setStats({
          totalClients: (Array.isArray(clients) ? clients : []).length,
          totalComptes: (Array.isArray(comptes) ? comptes : []).length,
          encoursCredit: encours,
          totalDemandes: (demandes || []).length,
        });

        setCreditsParStatut(statsArray);
      } catch (err) {
        console.error('Erreur chargement stats:', err);
      } finally {
        setChargement(false);
      }
    };

    chargerStats();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: c.bg, fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ===== Contenu principal ===== */}
      <main style={{ padding: '28px 32px' }}>

        {/* Titre */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: c.text, margin: '0 0 8px' }}>Tableau de bord</h1>
          <p style={{ fontSize: '13px', color: c.textDim, margin: 0 }}>Bienvenue dans votre espace de gestion bancaire</p>
        </div>

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
              delta="Crédits acceptés"
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

          {/* Placeholder for second chart */}
          <div style={{ backgroundColor: c.panel, border: `1px solid ${c.panelBorder}`, borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: c.text, marginBottom: '20px' }}>Répartition des comptes</div>
            <div style={{ textAlign: 'center', color: c.textFaint, fontSize: '12px', padding: '40px 20px' }}>
              Données en cours de synchronisation...
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
