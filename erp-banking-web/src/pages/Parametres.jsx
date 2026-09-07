import { useEffect, useState } from 'react';
import {Shield, Mail, Phone, Landmark, Sun, Moon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import authService from '../service/authService';

function ChampProfil({ icon: Icon, label, valeur }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', borderBottom: '1px solid var(--app-panel-border)' }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'var(--app-bg)', flexShrink: 0,
      }}>
        <Icon size={16} color="var(--app-text-dim)" />
      </div>
      <div>
        <div style={{ fontSize: '11px', color: 'var(--app-text-dim)', fontWeight: '500', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '14px', color: 'var(--app-text)', fontWeight: '600' }}>{valeur || '—'}</div>
      </div>
    </div>
  );
}

function Parametres() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profil, setProfil] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const charger = async () => {
      try {
        const data = await authService.getCurrentUser();
        setProfil(data);
      } catch {
        setProfil(user);
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, [user]);

  const estSombre = theme === 'dark';
  const nomComplet = profil?.prenom || profil?.nom
    ? `${profil?.prenom ?? ''} ${profil?.nom ?? ''}`.trim()
    : null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--app-bg)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <main style={{ padding: '28px 32px', maxWidth: '640px' }}>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--app-text)', margin: '0 0 8px' }}>Paramètres</h1>
          <p style={{ fontSize: '13px', color: 'var(--app-text-dim)', margin: 0 }}>Profil et préférences d'affichage</p>
        </div>

        {/* ===== Profil ===== */}
        <div style={{
          backgroundColor: 'var(--app-panel)', border: '1px solid var(--app-panel-border)', borderRadius: '8px',
          padding: '24px', marginBottom: '20px', boxShadow: '0 1px 3px var(--app-shadow)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', fontWeight: '700', color: '#fff', flexShrink: 0,
            }}>
              {(nomComplet || profil?.email || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--app-text)' }}>
                {chargement ? 'Chargement...' : (nomComplet || profil?.email || 'Utilisateur')}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--app-text-dim)' }}>{profil?.email}</div>
            </div>
          </div>

          <ChampProfil icon={Shield} label="Rôle" valeur={profil?.role} />
          <ChampProfil icon={Mail} label="Email" valeur={profil?.email} />
          {profil?.telephone && <ChampProfil icon={Phone} label="Téléphone" valeur={profil?.telephone} />}
          {profil?.codeGuichet && <ChampProfil icon={Landmark} label="Guichet" valeur={profil?.codeGuichet} />}
        </div>

        {/* ===== Apparence ===== */}
        <div style={{
          backgroundColor: 'var(--app-panel)', border: '1px solid var(--app-panel-border)', borderRadius: '8px',
          padding: '24px', boxShadow: '0 1px 3px var(--app-shadow)',
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--app-text)', marginBottom: '4px' }}>Apparence</div>
          <div style={{ fontSize: '12px', color: 'var(--app-text-dim)', marginBottom: '18px' }}>
            Choisis le mode d'affichage de l'application.
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => !estSombre || toggleTheme()}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '14px', borderRadius: '8px', cursor: 'pointer',
                border: !estSombre ? '2px solid #3b82f6' : '1px solid var(--app-panel-border)',
                backgroundColor: !estSombre ? 'rgba(59,130,246,0.08)' : 'var(--app-bg)',
                color: 'var(--app-text)', fontSize: '13px', fontWeight: '600',
              }}
            >
              <Sun size={16} color={!estSombre ? '#3b82f6' : 'var(--app-text-dim)'} />
              Clair
            </button>

            <button
              onClick={() => estSombre || toggleTheme()}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '14px', borderRadius: '8px', cursor: 'pointer',
                border: estSombre ? '2px solid #3b82f6' : '1px solid var(--app-panel-border)',
                backgroundColor: estSombre ? 'rgba(59,130,246,0.08)' : 'var(--app-bg)',
                color: 'var(--app-text)', fontSize: '13px', fontWeight: '600',
              }}
            >
              <Moon size={16} color={estSombre ? '#3b82f6' : 'var(--app-text-dim)'} />
              Sombre
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}

export default Parametres;
