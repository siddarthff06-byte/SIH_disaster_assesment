/**
 * In-browser reimplementation of the Python analysis pipeline:
 *  - preprocess.py  → loadImageData()
 *  - run_inference.py → computeChangeMask()
 *  - severity.py    → computeSeverity()
 */

const GRID_SIZE = 32

/**
 * Loads an image File and returns an ImageData object at the target size.
 */
function loadImageData(file, size = 512) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, size, size)
      resolve(ctx.getImageData(0, 0, size, size))
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Converts RGBA pixel array to grayscale values.
 * Mirrors Python: cv2.cvtColor(img, COLOR_RGB2GRAY)
 */
function toGray(data) {
  const gray = new Float32Array(data.length / 4)
  for (let i = 0; i < gray.length; i++) {
    const r = data[i * 4]
    const g = data[i * 4 + 1]
    const b = data[i * 4 + 2]
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b
  }
  return gray
}

/**
 * Computes a boolean change mask.
 * Mirrors Python run_inference.py: compute_change_mask()
 * change_mask[i] = 1 if |after[i] - before[i]| > threshold
 */
function computeChangeMask(beforeGray, afterGray, threshold = 30) {
  const mask = new Uint8Array(beforeGray.length)
  for (let i = 0; i < mask.length; i++) {
    mask[i] = Math.abs(afterGray[i] - beforeGray[i]) > threshold ? 1 : 0
  }
  return mask
}

/**
 * Classifies each grid cell's severity.
 * Mirrors Python severity.py: compute_severity()
 *
 * before_mask = all ones (full image = structure present)
 * after_mask  = ~change_mask (pixels that did NOT change = still standing)
 * loss_ratio  = 1 - (after_area / before_area)
 */
function computeSeverity(changeMask, width, height, gridSize = GRID_SIZE) {
  const stepH = Math.floor(height / gridSize)
  const stepW = Math.floor(width / gridSize)
  const results = []

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      let beforeArea = 0
      let afterArea = 0

      for (let y = i * stepH; y < (i + 1) * stepH; y++) {
        for (let x = j * stepW; x < (j + 1) * stepW; x++) {
          beforeArea++                                     // before_mask = ones
          if (changeMask[y * width + x] === 0) afterArea++ // after_mask = ~change_mask
        }
      }

      if (beforeArea < 5) continue

      const lossRatio = 1 - afterArea / (beforeArea + 1e-6)

      let severity
      if (lossRatio < 0.2) severity = 'intact'
      else if (lossRatio < 0.6) severity = 'damaged'
      else severity = 'destroyed'

      results.push({
        building_id: `B_${i}_${j}`,
        row: i,
        col: j,
        loss_ratio: Math.round(lossRatio * 1000) / 1000,
        severity,
      })
    }
  }

  return results
}

/**
 * Main entry point — runs the full pipeline on two image Files.
 * Returns { results, beforeUrl, afterUrl, changeMask, width, height }
 */
export async function runAnalysis(beforeFile, afterFile, threshold = 30) {
  const SIZE = 512

  const [beforeData, afterData] = await Promise.all([
    loadImageData(beforeFile, SIZE),
    loadImageData(afterFile, SIZE),
  ])

  const beforeGray = toGray(beforeData.data)
  const afterGray = toGray(afterData.data)
  const changeMask = computeChangeMask(beforeGray, afterGray, threshold)

  const results = computeSeverity(changeMask, SIZE, SIZE)

  return {
    results,
    beforeUrl: URL.createObjectURL(beforeFile),
    afterUrl: URL.createObjectURL(afterFile),
    changeMask,
    width: SIZE,
    height: SIZE,
    threshold,
  }
}
