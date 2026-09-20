export default function Navbar() {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 24px',
        height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--accent), #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: 1,
          }}>V</div>
          <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--text-h)', letterSpacing: -0.3 }}>
            VISTA
          </span>
          <span style={{
            fontSize: 11, fontWeight: 500, color: 'var(--accent)',
            background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
            borderRadius: 99, padding: '2px 8px', letterSpacing: 0.3,
          }}>
            Beta
          </span>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: 'var(--intact)',
            boxShadow: '0 0 0 3px rgba(34,197,94,0.2)',
            animation: 'pulse 2s ease infinite',
          }} />
          <span style={{ fontSize: 13, color: 'var(--text)' }}>Disaster Assessment Engine</span>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </nav>
  )
}
