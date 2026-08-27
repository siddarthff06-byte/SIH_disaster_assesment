export default function StatsPanel({ results, beforeUrl, afterUrl, onExport }) {
  const total = results.length
  const counts = { intact: 0, damaged: 0, destroyed: 0 }
  for (const r of results) counts[r.severity]++

  const pct = (n) => total ? ((n / total) * 100).toFixed(1) : 0

  const stats = [
    {
      label: 'Total Cells',
      value: total,
      sub: `${32}×${32} grid`,
      color: 'var(--accent)',
      bg: 'var(--accent-bg)',
      border: 'var(--accent-border)',
      icon: '📐',
    },
    {
      label: 'Intact',
      value: counts.intact,
      sub: `${pct(counts.intact)}% of area`,
      color: 'var(--intact)',
      bg: 'var(--intact-bg)',
      border: 'rgba(34,197,94,0.3)',
      icon: '✅',
    },
    {
      label: 'Damaged',
      value: counts.damaged,
      sub: `${pct(counts.damaged)}% of area`,
      color: 'var(--damaged)',
      bg: 'var(--damaged-bg)',
      border: 'rgba(245,158,11,0.3)',
      icon: '⚠️',
    },
    {
      label: 'Destroyed',
      value: counts.destroyed,
      sub: `${pct(counts.destroyed)}% of area`,
      color: 'var(--destroyed)',
      bg: 'var(--destroyed-bg)',
      border: 'rgba(239,68,68,0.3)',
      icon: '🔴',
    },
  ]

  // Severity bar segments
  const barSegments = [
    { key: 'intact', color: 'var(--intact)', pct: pct(counts.intact) },
    { key: 'damaged', color: 'var(--damaged)', pct: pct(counts.damaged) },
    { key: 'destroyed', color: 'var(--destroyed)', pct: pct(counts.destroyed) },
  ]

  // Average loss ratio
  const avgLoss = results.length
    ? (results.reduce((s, r) => s + r.loss_ratio, 0) / results.length * 100).toFixed(1)
    : 0

  return (
    <section style={{
      maxWidth: 1200, margin: '0 auto', padding: '80px 24px',
      borderTop: '1px solid var(--border)',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{
          fontSize: 12, fontWeight: 600, color: 'var(--accent)',
          textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12,
        }}>Step 3 — Summary</div>
        <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1, marginBottom: 12 }}>
          Assessment Report
        </h2>
        <p style={{ color: 'var(--text)' }}>
          Aggregated statistics from the {total} classified building cells.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16, marginBottom: 40,
      }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: s.bg,
            border: `1px solid ${s.border}`,
            borderRadius: 16, padding: '24px 20px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div style={{
              fontSize: 42, fontWeight: 700,
              color: s.color, lineHeight: 1, marginBottom: 4,
              fontFamily: 'var(--mono)',
            }}>
              {s.value}
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-h)', marginBottom: 4 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Stacked bar */}
      <div style={{
        background: 'var(--bg-subtle)', border: '1px solid var(--border)',
        borderRadius: 16, padding: 28, marginBottom: 32,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 16,
        }}>
          <div style={{ fontWeight: 600, color: 'var(--text-h)' }}>Damage Distribution</div>
          <div style={{ fontSize: 13, color: 'var(--text)' }}>
            Avg. loss ratio: <strong style={{ color: 'var(--text-h)' }}>{avgLoss}%</strong>
          </div>
        </div>
        <div style={{
          display: 'flex', height: 20, borderRadius: 99, overflow: 'hidden',
          border: '1px solid var(--border)',
        }}>
          {barSegments.map(seg => (
            <div key={seg.key} style={{
              width: `${seg.pct}%`, background: seg.color,
              transition: 'width 0.6s ease',
              minWidth: seg.pct > 0 ? 2 : 0,
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 24, marginTop: 12, flexWrap: 'wrap' }}>
          {barSegments.map(seg => (
            <div key={seg.key} style={{
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
            }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: seg.color }} />
              <span style={{ textTransform: 'capitalize', color: 'var(--text)' }}>{seg.key}</span>
              <strong style={{ color: 'var(--text-h)' }}>{seg.pct}%</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Before / After comparison */}
      <div style={{
        background: 'var(--bg-subtle)', border: '1px solid var(--border)',
        borderRadius: 16, padding: 28, marginBottom: 32,
      }}>
        <div style={{ fontWeight: 600, color: 'var(--text-h)', marginBottom: 16 }}>
          Image Comparison
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[{ url: beforeUrl, label: 'Before', emoji: '🌿' },
            { url: afterUrl, label: 'After', emoji: '🔥' }].map(img => (
            <div key={img.label} style={{ flex: 1, minWidth: 200 }}>
              <div style={{
                fontSize: 12, fontWeight: 600, color: 'var(--text)',
                textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
              }}>
                {img.emoji} {img.label}
              </div>
              <img src={img.url} alt={img.label} style={{
                width: '100%', borderRadius: 10,
                border: '1px solid var(--border)', display: 'block',
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* Export */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={onExport} style={{
          padding: '12px 28px', borderRadius: 10,
          background: 'linear-gradient(135deg, var(--accent), #6366f1)',
          border: 'none', color: '#fff',
          fontSize: 15, fontWeight: 600, cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(170,59,255,0.3)',
        }}>
          ⬇ Export severity_output.json
        </button>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{
          padding: '12px 28px', borderRadius: 10,
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
          color: 'var(--text-h)',
          fontSize: 15, fontWeight: 500, cursor: 'pointer',
        }}>
          ↑ Run Another Analysis
        </button>
      </div>
    </section>
  )
}
