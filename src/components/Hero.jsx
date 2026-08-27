export default function Hero({ onStart }) {
  return (
    <section style={{
      minHeight: 'calc(100svh - 56px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '80px 24px',
      position: 'relative', overflow: 'hidden',
      textAlign: 'center',
    }}>
      {/* Background grid pattern */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(var(--border) 1px, transparent 1px),
          linear-gradient(90deg, var(--border) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        opacity: 0.4,
        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent)',
      }} />

      {/* Glow blobs */}
      <div style={{
        position: 'absolute', top: '20%', left: '25%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(170,59,255,0.12), transparent 70%)',
        filter: 'blur(40px)', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', top: '30%', right: '20%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(239,68,68,0.08), transparent 70%)',
        filter: 'blur(40px)', zIndex: 0,
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 700 }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
          borderRadius: 99, padding: '6px 16px', marginBottom: 32,
          fontSize: 13, fontWeight: 500, color: 'var(--accent)',
        }}>
          <span style={{ fontSize: 16 }}>🛰️</span>
          VISTA · Visual Intelligence for Structure and Threat Assessment
        </div>

        <h1 style={{
          fontSize: 'clamp(48px, 8vw, 80px)',
          fontWeight: 700,
          letterSpacing: '-3px',
          lineHeight: 1.05,
          marginBottom: 24,
          color: 'var(--text-h)',
        }}>
          Post-Disaster<br />
          <span style={{
            background: 'linear-gradient(135deg, var(--accent), #6366f1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Building Assessment
          </span>
        </h1>

        <p style={{
          fontSize: 18, lineHeight: 1.7, color: 'var(--text)',
          marginBottom: 48, maxWidth: 560, margin: '0 auto 48px',
        }}>
          Upload <strong style={{ color: 'var(--text-h)' }}>before</strong> and{' '}
          <strong style={{ color: 'var(--text-h)' }}>after</strong> satellite images of a disaster zone.
          VISTA analyses pixel-level changes across a 32×32 grid and classifies every building
          cell as <span style={{ color: 'var(--intact)' }}>intact</span>,{' '}
          <span style={{ color: 'var(--damaged)' }}>damaged</span>, or{' '}
          <span style={{ color: 'var(--destroyed)' }}>destroyed</span>.
        </p>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onStart} style={{
            padding: '14px 32px', borderRadius: 10,
            background: 'linear-gradient(135deg, var(--accent), #6366f1)',
            border: 'none', color: '#fff',
            fontSize: 16, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 24px rgba(170,59,255,0.35)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(170,59,255,0.45)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(170,59,255,0.35)'
            }}
          >
            Start Analysis →
          </button>
          <a href="https://github.com/siddarthff06-byte/SIH_disaster_assesment"
            target="_blank" rel="noopener"
            style={{
              padding: '14px 32px', borderRadius: 10,
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              color: 'var(--text-h)',
              fontSize: 16, fontWeight: 500,
              textDecoration: 'none',
              transition: 'border-color 0.15s',
              display: 'inline-block',
            }}
          >
            View on GitHub
          </a>
        </div>

        {/* Pipeline steps */}
        <div style={{
          display: 'flex', gap: 0, justifyContent: 'center',
          marginTop: 80, flexWrap: 'wrap',
        }}>
          {[
            { icon: '🖼️', label: 'Upload Images', sub: 'Before & After' },
            { icon: '→', label: '', sub: '', arrow: true },
            { icon: '🔍', label: 'Change Detection', sub: 'Pixel diff analysis' },
            { icon: '→', label: '', sub: '', arrow: true },
            { icon: '📊', label: 'Severity Grid', sub: '32×32 classification' },
            { icon: '→', label: '', sub: '', arrow: true },
            { icon: '📋', label: 'CSV Report', sub: 'Export results' },
          ].map((step, i) =>
            step.arrow ? (
              <div key={i} style={{
                display: 'flex', alignItems: 'center',
                color: 'var(--border)', fontSize: 20, padding: '0 8px',

              }}>→</div>
            ) : (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 6, padding: '16px 24px',
                border: '1px solid var(--border)',
                borderRadius: 12,
                background: 'var(--bg-subtle)',
                minWidth: 120,
              }}>
                <span style={{ fontSize: 24 }}>{step.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-h)' }}>{step.label}</span>
                <span style={{ fontSize: 11, color: 'var(--text)' }}>{step.sub}</span>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  )
}
