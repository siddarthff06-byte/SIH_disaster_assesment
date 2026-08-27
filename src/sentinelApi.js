/**
 * Sentinel Hub / Copernicus Data Space API service
 *
 * Auth flow:  client_id + client_secret → OAuth2 Bearer token
 * Images:     Sentinel-2 L2A true-colour via Process API → PNG blob
 * Geocoding:  Nominatim (OpenStreetMap) — no key required
 */

const TOKEN_URL =
  '/cdse-auth/auth/realms/CDSE/protocol/openid-connect/token'
const PROCESS_URL = '/sentinel-process/api/v1/process'
const GEOCODE_URL = 'https://nominatim.openstreetmap.org/search'

// ─── Auth ────────────────────────────────────────────────────────────────────

/**
 * Exchange OAuth2 client credentials for a Bearer token.
 * Token is valid for ~1 hour.
 */
export async function getToken(clientId, clientSecret) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Authentication failed (${res.status}): ${text}`)
  }

  const data = await res.json()
  return data.access_token
}

// ─── Geocoding ────────────────────────────────────────────────────────────────

/**
 * Geocode a place name to { lat, lon, displayName }.
 * Uses Nominatim (OpenStreetMap) — no API key required.
 */
export async function geocodeLocation(query) {
  const url = `${GEOCODE_URL}?q=${encodeURIComponent(query)}&format=json&limit=1`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'VISTA-DisasterAssessment/1.0 (VISTA)' },
  })

  if (!res.ok) throw new Error('Geocoding request failed')
  const data = await res.json()
  if (!data.length) throw new Error(`Location "${query}" not found — try a more specific name`)

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  }
}

// ─── Bounding box ─────────────────────────────────────────────────────────────

/**
 * Compute a square bounding box around lat/lon with the given radius in km.
 * Returns [lon_min, lat_min, lon_max, lat_max] (CRS84).
 */
export function computeBbox(lat, lon, radiusKm = 5) {
  const deltaLat = radiusKm / 111.0
  const deltaLon = radiusKm / (111.0 * Math.cos((lat * Math.PI) / 180))
  return [
    +(lon - deltaLon).toFixed(6),
    +(lat - deltaLat).toFixed(6),
    +(lon + deltaLon).toFixed(6),
    +(lat + deltaLat).toFixed(6),
  ]
}

// ─── EvalScript ───────────────────────────────────────────────────────────────

/**
 * Sentinel Hub EvalScript — Sentinel-2 L2A true-colour (Bands B04/B03/B02).
 * Brightness boosted 3.5× so the image looks natural at standard zoom.
 */
const TRUE_COLOR_EVALSCRIPT = `//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B02", "B03", "B04"] }],
    output: { bands: 3 }
  };
}
function evaluatePixel(sample) {
  return [sample.B04 * 3.5, sample.B03 * 3.5, sample.B02 * 3.5];
}`

// ─── Process API ──────────────────────────────────────────────────────────────

/**
 * Fetch a 512×512 true-colour PNG from Sentinel Hub for the given area & date.
 *
 * @param token        OAuth2 Bearer token
 * @param lat/lon      Centre of the area of interest
 * @param fromDate     ISO date string, e.g. "2024-07-20"
 * @param toDate       ISO date string (inclusive end of range), e.g. "2024-07-27"
 * @param radiusKm     Half-width of the bounding box in km (default 5)
 * @param maxCloud     Max cloud coverage % (0–100, default 30)
 * @returns            A File object (PNG) ready to drop into the analysis pipeline
 */
export async function fetchSentinelImage(
  token,
  lat,
  lon,
  fromDate,
  toDate,
  radiusKm = 5,
  maxCloud = 30
) {
  const bbox = computeBbox(lat, lon, radiusKm)

  const payload = {
    input: {
      bounds: {
        properties: { crs: 'http://www.opengis.net/def/crs/OGC/1.3/CRS84' },
        bbox,
      },
      data: [
        {
          type: 'sentinel-2-l2a',
          dataFilter: {
            timeRange: {
              from: `${fromDate}T00:00:00Z`,
              to: `${toDate}T23:59:59Z`,
            },
            maxCloudCoverage: maxCloud,
          },
        },
      ],
    },
    output: {
      width: 512,
      height: 512,
      responses: [
        {
          identifier: 'default',
          format: { type: 'image/png' },
        },
      ],
    },
    evalscript: TRUE_COLOR_EVALSCRIPT,
  }

  const res = await fetch(PROCESS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'image/png',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    let msg = `Sentinel Hub error (${res.status})`
    try {
      const json = await res.json()
      msg += `: ${json.error?.message ?? JSON.stringify(json)}`
    } catch {
      msg += `: ${await res.text()}`
    }
    throw new Error(msg)
  }

  const blob = await res.blob()

  // Sanity-check: a completely black/empty tile means no imagery was found.
  // Valid 512×512 PNGs are always well above 5 kB even when mostly dark.
  if (blob.size < 5000) {
    throw new Error(
      'No Sentinel-2 imagery found for this area and date range. ' +
        'Try picking a different date or increasing the cloud coverage limit in Advanced Options.'
    )
  }

  // Derive a readable filename
  const label = `sentinel_${fromDate}_to_${toDate}.png`
  return new File([blob], label, { type: 'image/png' })
}

// ─── Convenience: fetch both before + after in parallel ───────────────────────

export async function fetchBeforeAfter(
  token,
  lat,
  lon,
  { beforeFrom, beforeTo, afterFrom, afterTo, radiusKm = 5, maxCloud = 30 }
) {
  const [beforeFile, afterFile] = await Promise.all([
    fetchSentinelImage(token, lat, lon, beforeFrom, beforeTo, radiusKm, maxCloud),
    fetchSentinelImage(token, lat, lon, afterFrom, afterTo, radiusKm, maxCloud),
  ])
  return { beforeFile, afterFile }
}
