import { useState } from 'react';
import AuditPanel from '../features/audit/AuditPanel';
import CloturesPanel from '../features/audit/CloturesPanel';
import { useAuth } from '../hooks/useAuth';

const ONGLETS = [
  { id: 'journal', label: 'Audit' },
  { id: 'clotures', label: 'Validation des clôtures' },
];

function Audit() {
  const { user } = useAuth();
  const peutValiderClotures = ['ADMIN', 'GESTIONNAIRE'].includes(user?.role);
  const [ongletActif, setOngletActif] = useState('journal');

  const onglets = ONGLETS.filter(
    (onglet) => onglet.id !== 'clotures' || peutValiderClotures,
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <main style={{ padding: '28px 32px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 8px' }}>
            Audit
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            {ongletActif === 'clotures'
              ? 'Historique des entrées et sorties de caisse par guichet et validation des clôtures'
              : 'Journal des actions effectuées dans le système'}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '4px',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '20px',
            overflowX: 'auto',
          }}
        >
          {onglets.map((onglet) => (
            <button
              key={onglet.id}
              onClick={() => setOngletActif(onglet.id)}
              style={{
                padding: '10px 16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                color: ongletActif === onglet.id ? '#2563eb' : 'var(--muted)',
                borderBottom:
                  ongletActif === onglet.id ? '2px solid #2563eb' : '2px solid transparent',
                marginBottom: '-1px',
              }}
            >
              {onglet.label}
            </button>
          ))}
        </div>

        {ongletActif === 'clotures' && peutValiderClotures ? (
          <CloturesPanel />
        ) : (
          <AuditPanel />
        )}
      </main>
    </div>
  );
}

export default Audit;
