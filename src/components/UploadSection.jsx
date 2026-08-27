import { useRef, useState } from 'react'
import SatelliteFetcher from './SatelliteFetcher'

// ─── Manual upload card ───────────────────────────────────────────────────────

function UploadCard({ label, emoji, file, onFile }) {
  const inputRef = useRef()
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('image/')) onFile(f)
  }

  return (
    <div style={{ flex: 1, minWidth: 280 }}>
      <div style={{
        fontSize: 13, fontWeight: 600, color: 'var(--text)',
        textTransform: 'uppercase', letterSpacing: 1,
        marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span>{emoji}</span> {label} Image
      </div>

      <div
        onClick={() => !file && inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragging ? 'var(--accent)' : file ? 'var(--intact)' : 'var(--border)'}`,
          borderRadius: 16,
          background: dragging ? 'var(--accent-bg)' : file ? 'var(--intact-bg)' : 'var(--bg-subtle)',
          minHeight: 240,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          cursor: file ? 'default' : 'pointer',
          overflow: 'hidden', position: 'relative',
          transition: 'border-color 0.2s, background 0.2s',
        }}
      >
        {file ? (
          <>
            <img
              src={URL.createObjectURL(file)}
              alt={label}
              style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }}
            />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '8px 14px',
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ color: '#fff', fontSize: 12, fontFamily: 'var(--mono)' }}>
                {file.name}
              </span>
              <button
                onClick={e => { e.stopPropagation(); onFile(null) }}
                style={{
                  background: 'rgba(255,255,255,0.2)', border: 'none',
                  borderRadius: 6, color: '#fff', fontSize: 12,
                  padding: '3px 8px', cursor: 'pointer',
                }}
              >
                ✕ Remove
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{emoji}</div>
            <div style={{ fontWeight: 600, color: 'var(--text-h)', marginBottom: 6 }}>
              Drop image here
            </div>
            <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 16 }}>
              or click to browse
            </div>
            <div style={{
              display: 'inline-block', padding: '6px 16px', borderRadius: 8,
              background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
              color: 'var(--accent)', fontSize: 13, fontWeight: 500,
            }}>
              Choose File
            </div>
            <div style={{ fontSize: 11, color: 'var(--text)', marginTop: 12 }}>
              PNG, JPG, WEBP supported
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef} type="file" accept="image/*"
        style={{ display: 'none' }}
        onChange={e => onFile(e.target.files[0] || null)}
      />
    </div>
  )
}

// ─── Tab button ───────────────────────────────────────────────────────────────

function Tab({ active, onClick, icon, label, sub }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '14px 20px', borderRadius: 10,
      border: `1px solid ${active ? 'var(--accent-border)' : 'var(--border)'}`,
      background: active ? 'var(--accent-bg)' : 'var(--bg-subtle)',
      cursor: 'pointer', textAlign: 'left',
      transition: 'all 0.15s',
    }}>
      <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
      <div style={{
        fontWeight: 600, fontSize: 14,
        color: active ? 'var(--accent)' : 'var(--text-h)',
      }}>{label}</div>
      <div style={{ fontSize: 12, color: 'var(--text)', marginTop: 2 }}>{sub}</div>
    </button>
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────

export default function UploadSection({ onAnalyze }) {
  const [tab, setTab] = useState('upload')   // 'upload' | 'satellite'
  const [beforeFile, setBeforeFile] = useState(null)
  const [afterFile, setAfterFile] = useState(null)
  const [threshold, setThreshold] = useState(30)

  const manualReady = beforeFile && afterFile

  // Called by SatelliteFetcher when both images are ready
  const handleSatelliteReady = (bf, af) => {
    onAnalyze(bf, af, threshold)
  }

  return (
    <section id="upload" style={{
      maxWidth: 1200, margin: '0 auto', padding: '80px 24px',
      borderTop: '1px solid var(--border)',
    }}>
      {/* Section header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{
          fontSize: 12, fontWeight: 600, color: 'var(--accent)',
          textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12,
        }}>
          Step 1
        </div>
        <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1, marginBottom: 12 }}>
          Source Your Images
        </h2>
        <p style={{ color: 'var(--text)', maxWidth: 500, margin: '0 auto' }}>
          Upload images manually or fetch live Sentinel-2 satellite data
          directly from the Copernicus Data Space.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
        <Tab
          active={tab === 'upload'}
          onClick={() => setTab('upload')}
          icon="🖼️"
          label="Manual Upload"
          sub="Upload your own before & after images"
        />
        <Tab
          active={tab === 'satellite'}
          onClick={() => setTab('satellite')}
          icon="🛰️"
          label="Fetch from Satellite"
          sub="Pull live Sentinel-2 imagery via Copernicus API"
        />
      </div>

      {/* ── Manual upload tab ── */}
      {tab === 'upload' && (
        <>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
            <UploadCard label="Before" emoji="🌿" file={beforeFile} onFile={setBeforeFile} />
            <UploadCard label="After" emoji="🔥" file={afterFile} onFile={setAfterFile} />
          </div>

          {/* Threshold slider */}
          <div style={{
            background: 'var(--bg-subtle)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '20px 24px', marginBottom: 32,
            display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-h)', marginBottom: 4 }}>
                Change Detection Threshold
              </div>
              <div style={{ fontSize: 12, color: 'var(--text)' }}>
                How much a pixel must change to count as damaged. Higher = less sensitive.
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="range" min="5" max="80" value={threshold}
                onChange={e => setThreshold(Number(e.target.value))}
                style={{ width: 140, accentColor: 'var(--accent)' }}
              />
              <code style={{ minWidth: 36, textAlign: 'center' }}>{threshold}</code>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              disabled={!manualReady}
              onClick={() => onAnalyze(beforeFile, afterFile, threshold)}
              style={{
                padding: '14px 40px', borderRadius: 10,
                background: manualReady
                  ? 'linear-gradient(135deg, var(--accent), #6366f1)'
                  : 'var(--border)',
                border: 'none',
                color: manualReady ? '#fff' : 'var(--text)',
                fontSize: 16, fontWeight: 600,
                cursor: manualReady ? 'pointer' : 'not-allowed',
                boxShadow: manualReady ? '0 4px 24px rgba(170,59,255,0.3)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {manualReady ? '🔍 Run Analysis' : 'Upload both images to continue'}
            </button>
          </div>
        </>
      )}

      {/* ── Satellite tab ── */}
      {tab === 'satellite' && (
        <SatelliteFetcher onReady={handleSatelliteReady} />
      )}
    </section>
  )
}
