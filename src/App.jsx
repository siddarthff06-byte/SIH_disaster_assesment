import { useRef, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import UploadSection from './components/UploadSection'
import SeverityGrid from './components/SeverityGrid'
import StatsPanel from './components/StatsPanel'
import { runAnalysis } from './analysis'

export default function App() {
  const [state, setState] = useState('idle')   // idle | loading | done
  const [analysisData, setAnalysisData] = useState(null)
  const [error, setError] = useState(null)
  const uploadRef = useRef()

  const scrollToUpload = () => {
    uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleAnalyze = async (beforeFile, afterFile, threshold) => {
    setState('loading')
    setError(null)
    try {
      const data = await runAnalysis(beforeFile, afterFile, threshold)
      setAnalysisData(data)
      setState('done')
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err) {
      console.error(err)
      setError('Analysis failed. Please try again with valid images.')
      setState('idle')
    }
  }

  const handleExport = () => {
    if (!analysisData) return
    const headers = 'id,severity,loss_ratio,x,y\n'
    const csv = analysisData.results.map(r => 
      `${r.id},${r.severity},${r.loss_ratio.toFixed(2)},${r.x},${r.y}`
    ).join('\n')
    const blob = new Blob([headers + csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'severity_output.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ minHeight: '100svh', background: 'var(--bg)' }}>
      <Navbar />

      {/* Hero */}
      <Hero onStart={scrollToUpload} />

      {/* Upload */}
      <div ref={uploadRef}>
        <UploadSection onAnalyze={handleAnalyze} />
      </div>

      {/* Error */}
      {error && (
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 24px 32px',
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-block',
            background: 'var(--destroyed-bg)',
            border: '1px solid rgba(239,68,68,0.4)',
            color: 'var(--destroyed)',
            borderRadius: 10, padding: '12px 24px',
            fontSize: 14, fontWeight: 500,
          }}>
            ⚠ {error}
          </div>
        </div>
      )}

      {/* Loading */}
      {state === 'loading' && (
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '60px 24px',
          textAlign: 'center', borderTop: '1px solid var(--border)',
        }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{
              width: 48, height: 48, border: '3px solid var(--border)',
              borderTop: '3px solid var(--accent)',
              borderRadius: '50%', margin: '0 auto 20px',
              animation: 'spin 0.8s linear infinite',
            }} />
            <h3 style={{ fontSize: 22, color: 'var(--text-h)', marginBottom: 8 }}>
              Running Analysis…
            </h3>
            <p style={{ color: 'var(--text)', fontSize: 14 }}>
              Preprocessing images → Detecting changes → Classifying severity
            </p>
          </div>
          <div style={{
            display: 'inline-flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center',
          }}>
            {['Preprocessing', 'Change Mask', 'Grid Classification', 'Building Report'].map((step, i) => (
              <div key={step} style={{
                fontSize: 12, color: 'var(--text)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--accent)',
                  animation: `pulse ${0.5 + i * 0.2}s ease infinite alternate`,
                }} />
                {step}
              </div>
            ))}
          </div>
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes pulse { from { opacity: 0.3; } to { opacity: 1; } }
          `}</style>
        </div>
      )}

      {/* Results */}
      {state === 'done' && analysisData && (
        <div id="results">
          <SeverityGrid
            results={analysisData.results}
            afterUrl={analysisData.afterUrl}
            width={analysisData.width}
            height={analysisData.height}
          />
          <StatsPanel
            results={analysisData.results}
            beforeUrl={analysisData.beforeUrl}
            afterUrl={analysisData.afterUrl}
            onExport={handleExport}
          />
        </div>
      )}

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '32px 24px',
        textAlign: 'center',
        color: 'var(--text)',
        fontSize: 13,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <strong style={{ color: 'var(--text-h)' }}>VISTA</strong> — Disaster Assessment System &nbsp;·&nbsp;
          <a
            href="https://github.com/siddarthff06-byte/SIH_disaster_assesment"
            target="_blank" rel="noopener"
            style={{ color: 'var(--accent)', textDecoration: 'none' }}
          >
            GitHub ↗
          </a>
          <div style={{ marginTop: 8, opacity: 0.6, fontSize: 11 }}>
            Analysis runs entirely in your browser · No data is uploaded to any server
          </div>
        </div>
      </footer>
    </div>
  )
}
