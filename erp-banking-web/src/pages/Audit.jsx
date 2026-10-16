import AuditPanel from '../features/audit/AuditPanel';

function Audit() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <main style={{ padding: '28px 32px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 8px' }}>
            Audit
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Journal des actions effectuées dans le système
          </p>
        </div>

        <AuditPanel />
      </main>
    </div>
  );
}

export default Audit;
