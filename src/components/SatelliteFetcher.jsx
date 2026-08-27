import { useState } from 'react'
import { getToken, geocodeLocation, fetchBeforeAfter } from '../sentinelApi'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LS_ID  = 'vista_client_id'
const LS_SEC = 'vista_client_secret'

/** Expand a single date ±WINDOW days to give Sentinel Hub a search window */
const WINDOW_DAYS = 30
const fmtDate = d => d.toISOString().slice(0, 10)
function dateWindow(isoDate) {
  const base = new Date(isoDate)
  const from = new Date(base); from.setDate(from.getDate() - WINDOW_DAYS)
  const to   = new Date(base); to.setDate(to.getDate()   + WINDOW_DAYS)
  return { from: fmtDate(from), to: fmtDate(to) }
}

function Input({ icon, ...props }) {
  return (
    <div style={{ position: 'relative' }}>
      {icon && (
        <span style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          fontSize: 15, pointerEvents: 'none',
        }}>{icon}</span>
      )}
      <input {...props} style={{
        width: '100%', boxSizing: 'border-box',
        padding: icon ? '10px 12px 10px 36px' : '10px 12px',
        borderRadius: 8, border: '1px solid var(--border)',
        background: 'var(--bg)', color: 'var(--text-h)',
        fontSize: 14, fontFamily: 'var(--sans)',
        outline: 'none', transition: 'border-color 0.15s',
        ...(props.style || {}),
      }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e  => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  )
}

function ImagePreview({ label, emoji, file }) {
  if (!file) return null
  return (
    <div style={{ flex: 1 }}>
      <div style={{
        fontSize: 12, fontWeight: 600, color: 'var(--text)',
        textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
      }}>{emoji} {label}</div>
      <img
        src={URL.createObjectURL(file)}
        alt={label}
        style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)', display: 'block' }}
      />
      <div style={{ fontSize: 11, color: 'var(--text)', marginTop: 6, fontFamily: 'var(--mono)' }}>
        {file.name}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SatelliteFetcher({ onReady }) {
  // Credentials — pulled from environment variables
  const clientId = import.meta.env.VITE_CLIENT_ID || ''
  const clientSecret = import.meta.env.VITE_CLIENT_SECRET || ''

  // Location
  const [locationQuery, setLocationQuery] = useState('')
  const [location,      setLocation]      = useState(null)
  const [geocoding,     setGeocoding]     = useState(false)

  // Single dates (before / after)
  const today   = new Date()
  const daysAgo = n => { const d = new Date(today); d.setDate(d.getDate() - n); return fmtDate(d) }
  const [beforeDate, setBeforeDate] = useState(daysAgo(60))
  const [afterDate,  setAfterDate]  = useState(daysAgo(5))

  // Options
  const [radiusKm, setRadiusKm] = useState(5)
  const [maxCloud, setMaxCloud] = useState(70)

  // State
  const [fetching,    setFetching]    = useState(false)
  const [fetchStatus, setFetchStatus] = useState('')
  const [error,       setError]       = useState(null)
  const [preview,     setPreview]     = useState(null)

  // ── Geocode ──
  const handleGeocode = async () => {
    if (!locationQuery.trim()) return
    setGeocoding(true); setError(null); setLocation(null)
    try { setLocation(await geocodeLocation(locationQuery.trim())) }
    catch (e) { setError(e.message) }
    finally { setGeocoding(false) }
  }

  // ── Fetch images ──
  const handleFetch = async () => {
    if (!clientId || !clientSecret || !location) return
    setFetching(true); setError(null); setPreview(null)
    try {
      setFetchStatus('Authenticating with Copernicus…')
      const token = await getToken(clientId.trim(), clientSecret.trim())

      setFetchStatus('Fetching satellite images…')
      await new Promise(r => setTimeout(r, 50))

      const before = dateWindow(beforeDate)
      const after  = dateWindow(afterDate)

      const { beforeFile, afterFile } = await fetchBeforeAfter(
        token, location.lat, location.lon,
        { beforeFrom: before.from, beforeTo: before.to,
          afterFrom:  after.from,  afterTo:  after.to,
          radiusKm, maxCloud }
      )
      setFetchStatus('')
      setPreview({ beforeFile, afterFile })
    } catch (e) {
      setError(e.message); setFetchStatus('')
    } finally { setFetching(false) }
  }

  const ready = clientId && clientSecret && location

  return (
    <div>

      {/* ── Location ── */}
      <div style={{
        background: 'var(--bg-subtle)', border: '1px solid var(--border)',
        borderRadius: 12, padding: 24, marginBottom: 24,
      }}>
        <div style={{ fontWeight: 600, color: 'var(--text-h)', marginBottom: 4, fontSize: 15 }}>
          📍 Disaster Location
        </div>
        <div style={{ fontSize: 12, color: 'var(--text)', marginBottom: 12 }}>
          Enter a city, region, or landmark — we'll geocode it automatically.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <Input
              icon="🔍" type="text"
              placeholder="e.g. Wayanad, Kerala  or  Kahramanmaraş, Turkey"
              value={locationQuery}
              onChange={e => setLocationQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGeocode()}
            />
          </div>
          <button
            onClick={handleGeocode}
            disabled={geocoding || !locationQuery.trim()}
            style={{
              padding: '10px 20px', borderRadius: 8,
              background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
              color: 'var(--accent)', fontWeight: 600, fontSize: 13,
              cursor: geocoding ? 'wait' : 'pointer', whiteSpace: 'nowrap',
            }}
          >
            {geocoding ? '…' : 'Search'}
          </button>
        </div>

        {location && (
          <div style={{
            marginTop: 10, padding: '10px 14px',
            background: 'var(--intact-bg)', border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 8, fontSize: 13, display: 'flex', gap: 12, alignItems: 'center',
          }}>
            <span>✅</span>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-h)' }}>{location.displayName}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text)', marginTop: 2 }}>
                {location.lat.toFixed(5)}°N &nbsp; {location.lon.toFixed(5)}°E
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Single date pickers ── */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Before Event', emoji: '🌿', value: beforeDate, onChange: setBeforeDate },
          { label: 'After Event',  emoji: '🔥', value: afterDate,  onChange: setAfterDate  },
        ].map(({ label, emoji, value, onChange }) => (
          <div key={label} style={{
            flex: 1, minWidth: 200,
            background: 'var(--bg-subtle)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '14px 16px',
          }}>
            <div style={{
              fontSize: 12, fontWeight: 600, color: 'var(--text)',
              textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
            }}>
              {emoji} {label}
            </div>
            <Input type="date" value={value} onChange={e => onChange(e.target.value)} />
            <div style={{ fontSize: 11, color: 'var(--text)', marginTop: 6 }}>
              Sentinel Hub searches ±{WINDOW_DAYS} days for the clearest image
            </div>
          </div>
        ))}
      </div>

      {/* ── Advanced options ── */}
      <details style={{ marginBottom: 24 }}>
        <summary style={{
          cursor: 'pointer', fontSize: 13, fontWeight: 600,
          color: 'var(--text)', userSelect: 'none', padding: '10px 0',
        }}>
          ⚙ Advanced Options
        </summary>
        <div style={{
          marginTop: 12, background: 'var(--bg-subtle)', border: '1px solid var(--border)',
          borderRadius: 10, padding: 20, display: 'flex', gap: 32, flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-h)', marginBottom: 4 }}>
              Area Radius: <code>{radiusKm} km</code>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text)', marginBottom: 8 }}>
              Half-width of the bounding box around the location
            </div>
            <input type="range" min="1" max="30" value={radiusKm}
              onChange={e => setRadiusKm(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent)' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-h)', marginBottom: 4 }}>
              Max Cloud Cover: <code>{maxCloud}%</code>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text)', marginBottom: 8 }}>
              Reject images with more cloud coverage than this
            </div>
            <input type="range" min="0" max="90" value={maxCloud}
              onChange={e => setMaxCloud(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent)' }}
            />
          </div>
        </div>
      </details>

      {/* ── Error ── */}
      {error && (
        <div style={{
          background: 'var(--destroyed-bg)', border: '1px solid rgba(239,68,68,0.4)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 20,
          fontSize: 13, color: 'var(--destroyed)',
        }}>
          ⚠ {error}
        </div>
      )}

      {/* ── Fetch button ── */}
      <button
        onClick={handleFetch}
        disabled={!ready || fetching}
        style={{
          width: '100%', padding: '14px 0', borderRadius: 10, border: 'none',
          background: ready && !fetching ? 'linear-gradient(135deg, #0ea5e9, #6366f1)' : 'var(--border)',
          color: ready && !fetching ? '#fff' : 'var(--text)',
          fontSize: 15, fontWeight: 600,
          cursor: ready && !fetching ? 'pointer' : 'not-allowed',
          boxShadow: ready && !fetching ? '0 4px 20px rgba(99,102,241,0.3)' : 'none',
          transition: 'all 0.2s', marginBottom: 24,
        }}
      >
        {fetching
          ? `🛰️ ${fetchStatus || 'Fetching…'}`
          : !clientId || !clientSecret
            ? 'Missing VITE_CLIENT_ID or VITE_CLIENT_SECRET in .env'
            : !location
              ? 'Search for a location above'
              : '🛰️ Fetch Satellite Images'}
      </button>

      {/* ── Preview ── */}
      {preview && (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-h)', marginBottom: 16, fontSize: 15 }}>
            ✅ Images fetched from Sentinel-2
          </div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            <ImagePreview label="Before" emoji="🌿" file={preview.beforeFile} />
            <ImagePreview label="After"  emoji="🔥" file={preview.afterFile}  />
          </div>
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => onReady(preview.beforeFile, preview.afterFile)}
              style={{
                padding: '14px 40px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, var(--accent), #6366f1)',
                color: '#fff', fontSize: 16, fontWeight: 600,
                cursor: 'pointer', boxShadow: '0 4px 24px rgba(170,59,255,0.3)',
              }}
            >
              🔍 Run Analysis on These Images
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
