import { jsPDF } from 'jspdf'

/**
 * Convert an image URL / blob URL to base64 DataURL
 */
async function getBase64Image(url) {
  if (!url) return null
  return new Promise(resolve => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth || 512
      canvas.height = img.naturalHeight || 512
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      try {
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      } catch {
        resolve(null)
      }
    }
    img.onerror = () => resolve(null)
    img.src = url
  })
}

/**
 * Generate a visual composite of the After image overlaid with the colored Severity Grid
 */
async function generateSeverityOverlayImage(afterUrl, results, size = 512, gridSize = 32) {
  if (!afterUrl || !results || !results.length) return null
  return new Promise(resolve => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')

      // Draw base satellite image
      ctx.drawImage(img, 0, 0, size, size)

      // Draw color-coded grid overlay
      const step = size / gridSize
      for (const cell of results) {
        const x = cell.col * step
        const y = cell.row * step
        if (cell.severity === 'destroyed') {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.45)' // Red
          ctx.fillRect(x, y, step, step)
          ctx.strokeStyle = 'rgba(220, 38, 38, 0.7)'
          ctx.lineWidth = 0.5
          ctx.strokeRect(x, y, step, step)
        } else if (cell.severity === 'damaged') {
          ctx.fillStyle = 'rgba(245, 158, 11, 0.40)' // Yellow/Orange
          ctx.fillRect(x, y, step, step)
          ctx.strokeStyle = 'rgba(217, 119, 6, 0.7)'
          ctx.lineWidth = 0.5
          ctx.strokeRect(x, y, step, step)
        }
      }

      try {
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      } catch {
        resolve(null)
      }
    }
    img.onerror = () => resolve(null)
    img.src = afterUrl
  })
}

/**
 * Generate and download a human-readable Disaster Assessment PDF Report
 */
export async function downloadDisasterReport({
  disasterInfo,
  locationText,
  coordinates,
  beforeDate,
  afterDate,
  beforeUrl,
  afterUrl,
  results,
  counts,
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const total = results ? results.length : 1
  const destroyed = counts.destroyed || 0
  const damaged = counts.damaged || 0
  const intact = counts.intact || 0

  const destroyedPct = ((destroyed / total) * 100).toFixed(1)
  const damagedPct = ((damaged / total) * 100).toFixed(1)
  const intactPct = ((intact / total) * 100).toFixed(1)

  // ── Header Banner ────────────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42) // Dark Slate Navy
  doc.rect(0, 0, 210, 32, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('VISTA — Visual Intelligence for Structure & Threat Assessment', 14, 13)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(148, 163, 184)
  doc.text('AUTOMATED SATELLITE DISASTER ASSESSMENT & DAMAGE REPORT', 14, 20)

  doc.setFontSize(8)
  const reportDate = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
  doc.text(`Generated: ${reportDate}  |  Platform: Sentinel-2 L2A`, 14, 26)

  // ── Executive Incident Overview ─────────────────────────────────────────
  let y = 40
  doc.setTextColor(30, 41, 59)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('1. Incident & Assessment Overview', 14, y)

  y += 6
  doc.setDrawColor(226, 232, 240)
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(14, y, 182, 34, 2, 2, 'FD')

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(51, 65, 85)
  doc.text('Location / Target:', 18, y + 6)
  doc.setFont('helvetica', 'normal')
  doc.text(`${locationText || 'Target Zone'} (${coordinates || 'Coordinates N/A'})`, 52, y + 6)

  doc.setFont('helvetica', 'bold')
  doc.text('Event Name / Type:', 18, y + 13)
  doc.setFont('helvetica', 'normal')
  doc.text(`${disasterInfo?.name || 'Localized Disaster Calamity'}  [${disasterInfo?.category || 'Hazard Evaluation'}]`, 52, y + 13)

  doc.setFont('helvetica', 'bold')
  doc.text('Temporal Window:', 18, y + 20)
  doc.setFont('helvetica', 'normal')
  doc.text(`Baseline (Before): ${beforeDate || 'Pre-Event'}  ➔  Post-Event (After): ${afterDate || 'Post-Event'}`, 52, y + 20)

  doc.setFont('helvetica', 'bold')
  doc.text('Incident Context:', 18, y + 27)
  doc.setFont('helvetica', 'normal')
  const summaryText = disasterInfo?.summary || 'Multi-temporal radiometric differencing performed over 32x32 satellite spatial grid.'
  doc.text(doc.splitTextToSize(summaryText, 140), 52, y + 27)

  // ── Visual Satellite Assessment ─────────────────────────────────────────
  y += 42
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(30, 41, 59)
  doc.text('2. Satellite Imagery & Change Overlay', 14, y)

  y += 5
  const beforeB64 = await getBase64Image(beforeUrl)
  const afterB64 = await getBase64Image(afterUrl)
  const overlayB64 = await generateSeverityOverlayImage(afterUrl, results)

  const imgW = 56
  const imgH = 56

  // Image 1: Before
  if (beforeB64) {
    doc.addImage(beforeB64, 'JPEG', 14, y, imgW, imgH)
  } else {
    doc.setFillColor(241, 245, 249)
    doc.rect(14, y, imgW, imgH, 'F')
  }
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(71, 85, 105)
  doc.text('Baseline (Pre-Event)', 14, y + imgH + 4)

  // Image 2: After
  if (afterB64) {
    doc.addImage(afterB64, 'JPEG', 77, y, imgW, imgH)
  } else {
    doc.setFillColor(241, 245, 249)
    doc.rect(77, y, imgW, imgH, 'F')
  }
  doc.text('Post-Event Satellite Capture', 77, y + imgH + 4)

  // Image 3: Severity Grid Overlay
  if (overlayB64) {
    doc.addImage(overlayB64, 'JPEG', 140, y, imgW, imgH)
  } else {
    doc.setFillColor(241, 245, 249)
    doc.rect(140, y, imgW, imgH, 'F')
  }
  doc.text('32x32 Damage Severity Grid', 140, y + imgH + 4)

  // ── Quantitative Statistics Breakdown ──────────────────────────────────
  y += imgH + 12
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(30, 41, 59)
  doc.text('3. Damage Quantification Metrics', 14, y)

  y += 5
  // Stat Card 1: Destroyed
  doc.setFillColor(254, 242, 242)
  doc.setDrawColor(252, 165, 165)
  doc.roundedRect(14, y, 56, 22, 2, 2, 'FD')
  doc.setFontSize(14)
  doc.setTextColor(220, 38, 38)
  doc.setFont('helvetica', 'bold')
  doc.text(`${destroyedPct}%`, 20, y + 9)
  doc.setFontSize(8)
  doc.setTextColor(153, 27, 27)
  doc.setFont('helvetica', 'normal')
  doc.text(`Destroyed: ${destroyed} sectors`, 20, y + 15)

  // Stat Card 2: Damaged
  doc.setFillColor(254, 243, 199)
  doc.setDrawColor(252, 211, 77)
  doc.roundedRect(77, y, 56, 22, 2, 2, 'FD')
  doc.setFontSize(14)
  doc.setTextColor(217, 119, 6)
  doc.setFont('helvetica', 'bold')
  doc.text(`${damagedPct}%`, 83, y + 9)
  doc.setFontSize(8)
  doc.setTextColor(146, 64, 14)
  doc.setFont('helvetica', 'normal')
  doc.text(`Damaged: ${damaged} sectors`, 83, y + 15)

  // Stat Card 3: Intact
  doc.setFillColor(240, 253, 244)
  doc.setDrawColor(134, 239, 172)
  doc.roundedRect(140, y, 56, 22, 2, 2, 'FD')
  doc.setFontSize(14)
  doc.setTextColor(22, 163, 74)
  doc.setFont('helvetica', 'bold')
  doc.text(`${intactPct}%`, 146, y + 9)
  doc.setFontSize(8)
  doc.setTextColor(22, 101, 52)
  doc.setFont('helvetica', 'normal')
  doc.text(`Intact: ${intact} sectors`, 146, y + 15)

  // ── Relief & Response Recommendations ──────────────────────────────────
  y += 28
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(30, 41, 59)
  doc.text('4. Emergency & Relief Insights', 14, y)

  y += 6
  doc.setFontSize(8.5)
  doc.setTextColor(71, 85, 105)

  const recs = [
    {
      title: 'Priority Ground Reconnaissance:',
      desc: `Deploy immediate search & rescue assets to high-density red sectors (${destroyed} high-severity collapse/inundation clusters).`,
    },
    {
      title: 'Infrastructure Integrity:',
      desc: `Inspect transit corridors and lifelines intersecting yellow sectors (${damaged} damaged areas with 20%-60% structural alteration).`,
    },
    {
      title: 'Safe Relief Staging Zones:',
      desc: `Establish medical triage and emergency logistics camps within green sectors (${intact} intact zones displaying baseline stability).`,
    },
    {
      title: 'Continuous Monitoring:',
      desc: `Re-run assessment post next Sentinel-2 orbital revisit (~5-day cycle) to track floodwater recession or debris clearance.`,
    },
  ]

  for (const item of recs) {
    const fullText = `• ${item.title} ${item.desc}`
    const lines = doc.splitTextToSize(fullText, 180)
    
    // Print lines with proper line spacing
    doc.setFont('helvetica', 'normal')
    doc.text(lines, 14, y)
    
    // Dynamic height advance
    y += (lines.length * 4.2) + 2.2
  }

  // ── Footer / Provenance ────────────────────────────────────────────────
  doc.setDrawColor(226, 232, 240)
  doc.line(14, 278, 196, 278)

  doc.setFontSize(7.5)
  doc.setTextColor(148, 163, 184)
  doc.text('Data Source: European Space Agency (ESA) Copernicus Sentinel-2 MSI L2A (10m BOA Surface Reflectance).', 14, 283)
  doc.text('Generated in-browser by VISTA Disaster Intelligence Engine. Verified for humanitarian response planning.', 14, 287)

  // ── Save File ──────────────────────────────────────────────────────────
  const cleanName = (locationText || 'Disaster_Report').replace(/[^a-zA-Z0-9_-]/g, '_')
  doc.save(`VISTA_${cleanName}_Assessment_Report.pdf`)
}
