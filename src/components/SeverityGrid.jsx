const SEVERITY_COLORS = {
  intact: { fill: 'rgba(34, 197, 94, 0.45)', border: 'rgba(34, 197, 94, 0.8)' },
  damaged: { fill: 'rgba(245, 158, 11, 0.45)', border: 'rgba(245, 158, 11, 0.8)' },
  destroyed: { fill: 'rgba(239, 68, 68, 0.5)', border: 'rgba(239, 68, 68, 0.9)' },
}

const GRID_SIZE = 32

export default function SeverityGrid({ results, afterUrl, width, height }) {
  const [hovered, setHovered] = React.useState(null)
  const [filter, setFilter] = React.useState('all')

  // Build lookup map for fast rendering
  const cellMap = {}
  for (const r of results) {
    cellMap[`${r.row}_${r.col}`] = r
  }

  const filtered = filter === 'all' ? results : results.filter(r => r.severity === filter)
  const filteredSet = new Set(filtered.map(r => `${r.row}_${r.col}`))

  const cellW = (width / GRID_SIZE)
  const cellH = (height / GRID_SIZE)

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
        }}>Step 2 — Results</div>
        <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1, marginBottom: 12 }}>
          Severity Heatmap
        </h2>
        <p style={{ color: 'var(--text)', maxWidth: 520, margin: '0 auto' }}>
          The after-event image overlaid with the 32×32 damage classification grid.
          Hover any cell for details.
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{
        display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32, flexWrap: 'wrap',
      }}>
        {['all', 'intact', 'damaged', 'destroyed'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 18px', borderRadius: 8, border: '1px solid',
            borderColor: filter === f
              ? (f === 'all' ? 'var(--accent-border)' : `var(--${f})`)
              : 'var(--border)',
            background: filter === f
              ? (f === 'all' ? 'var(--accent-bg)' : `var(--${f}-bg)`)
              : 'transparent',
            color: filter === f
              ? (f === 'all' ? 'var(--accent)' : `var(--${f})`)
              : 'var(--text)',
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
            textTransform: 'capitalize',
            transition: 'all 0.15s',
          }}>
            {f === 'all' ? 'All Cells' : `${f.charAt(0).toUpperCase() + f.slice(1)}`}
          </button>
        ))}
      </div>

      {/* Grid + image */}
      <div style={{
        display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap',
      }}>
        {/* Heatmap */}
        <div style={{
          flex: '0 0 auto', position: 'relative',
          border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <img src={afterUrl} alt="After" style={{ width: 512, height: 512, display: 'block' }} />

          {/* SVG overlay */}
          <svg
            style={{ position: 'absolute', inset: 0, width: 512, height: 512 }}
            viewBox={`0 0 ${width} ${height}`}
          >
            {results.map(cell => {
              const isVisible = filteredSet.has(`${cell.row}_${cell.col}`)
              const colors = SEVERITY_COLORS[cell.severity]
              const isHov = hovered?.building_id === cell.building_id
              return (
                <rect
                  key={cell.building_id}
                  x={cell.col * cellW}
                  y={cell.row * cellH}
                  width={cellW}
                  height={cellH}
                  fill={isVisible ? colors.fill : 'transparent'}
                  stroke={isVisible ? colors.border : 'transparent'}
                  strokeWidth={isHov ? 2 : 0.5}
                  opacity={isHov ? 1 : isVisible ? 0.85 : 0}
                  style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
                  onMouseEnter={() => setHovered(cell)}
                  onMouseLeave={() => setHovered(null)}
                />
              )
            })}
          </svg>

          {/* Tooltip */}
          {hovered && (
            <div style={{
              position: 'absolute', top: 12, left: 12,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(8px)',
              borderRadius: 10, padding: '10px 14px',
              color: '#fff', fontSize: 12, lineHeight: 1.6,
              border: `1px solid ${SEVERITY_COLORS[hovered.severity].border}`,
              pointerEvents: 'none', minWidth: 160,
            }}>
              <div style={{ fontWeight: 700, marginBottom: 4, fontFamily: 'var(--mono)' }}>
                {hovered.building_id}
              </div>
              <div>Grid: ({hovered.row}, {hovered.col})</div>
              <div>Loss Ratio: <strong>{(hovered.loss_ratio * 100).toFixed(1)}%</strong></div>
              <div style={{
                marginTop: 6, fontWeight: 600,
                color: SEVERITY_COLORS[hovered.severity].border,
                textTransform: 'uppercase', letterSpacing: 1, fontSize: 11,
              }}>
                ● {hovered.severity}
              </div>
            </div>
          )}
        </div>

        {/* Legend + info panel */}
        <div style={{ flex: 1, minWidth: 220 }}>
          {/* Legend */}
          <div style={{
            background: 'var(--bg-subtle)', border: '1px solid var(--border)',
            borderRadius: 12, padding: 24, marginBottom: 20,
          }}>
            <div style={{ fontWeight: 600, color: 'var(--text-h)', marginBottom: 16 }}>
              Legend
            </div>
            {Object.entries(SEVERITY_COLORS).map(([label, colors]) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 4,
                  background: colors.fill,
                  border: `2px solid ${colors.border}`,
                  flexShrink: 0,
                }} />
                <span style={{
                  fontSize: 13, fontWeight: 600, color: 'var(--text-h)',
                  textTransform: 'capitalize',
                }}>{label}</span>
                <span style={{ fontSize: 12, color: 'var(--text)', marginLeft: 'auto' }}>
                  {label === 'intact' && '< 20% loss'}
                  {label === 'damaged' && '20–60% loss'}
                  {label === 'destroyed' && '> 60% loss'}
                </span>
              </div>
            ))}
          </div>

          {/* Hovered cell detail */}
          {hovered ? (
            <div style={{
              background: 'var(--bg-subtle)', border: `1px solid ${SEVERITY_COLORS[hovered.severity].border}`,
              borderRadius: 12, padding: 20,
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text)', marginBottom: 12 }}>
                Selected Cell
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700, color: 'var(--text-h)', marginBottom: 8 }}>
                {hovered.building_id}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                {[
                  ['Row', hovered.row],
                  ['Column', hovered.col],
                  ['Loss Ratio', `${(hovered.loss_ratio * 100).toFixed(1)}%`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text)' }}>{k}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-h)' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: 12, padding: '6px 12px', borderRadius: 8, textAlign: 'center',
                background: SEVERITY_COLORS[hovered.severity].fill,
                border: `1px solid ${SEVERITY_COLORS[hovered.severity].border}`,
                fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
                color: SEVERITY_COLORS[hovered.severity].border,
              }}>
                {hovered.severity}
              </div>
            </div>
          ) : (
            <div style={{
              background: 'var(--bg-subtle)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 20, textAlign: 'center', color: 'var(--text)',
              fontSize: 13,
            }}>
              Hover a cell on the heatmap to see details
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// Need React for hooks
import React from 'react'
