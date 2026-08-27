/**
 * VISTA Curated Disaster Knowledge Base & Event Catalog
 * 
 * Includes verified global and regional calamity coordinates, optimal date windows,
 * cloud tolerances, and humanitarian impact context.
 */

export const DISASTER_EVENTS = [
  {
    id: 'nepal-floods-2026',
    name: 'Nepal Monsoon Floods & Landslides',
    tag: '🇳🇵 Nepal (Recent/Ongoing)',
    query: 'Kathmandu, Nepal',
    location: {
      lat: 27.7172,
      lon: 85.3240,
      displayName: 'Kathmandu Valley, Bagmati Province, Nepal',
    },
    category: 'Flood & Inundation',
    beforeDate: '2026-06-15',
    afterDate: '2026-08-26',
    radiusKm: 8,
    maxCloud: 65,
    summary: 'Heavy monsoon torrential downpours causing major river swell, urban inundation, and landslides across central and eastern Nepal.',
    cause: 'Intense South Asian Monsoon downpours exceeding drainage capacity and triggering hill slopes.',
  },
  {
    id: 'vizag-floods',
    name: 'Visakhapatnam & Coastal Andhra Inundation',
    tag: '🇮🇳 Vizag / AP Floods',
    query: 'Visakhapatnam, Andhra Pradesh',
    location: {
      lat: 17.6868,
      lon: 83.2185,
      displayName: 'Visakhapatnam, Andhra Pradesh, India',
    },
    category: 'Coastal Flood & Cyclone Storm Surge',
    beforeDate: '2024-08-15',
    afterDate: '2024-09-08',
    radiusKm: 7,
    maxCloud: 50,
    summary: 'Depression in Bay of Bengal triggering intense localized flooding, coastal inundation, and civic infrastructure damage.',
    cause: 'Bay of Bengal deep depression and intense rainfall leading to urban flooding.',
  },
  {
    id: 'odisha-floods',
    name: 'Odisha Mahanadi Basin Floods',
    tag: '🇮🇳 Odisha Floods',
    query: 'Cuttack, Odisha',
    location: {
      lat: 20.4625,
      lon: 85.8828,
      displayName: 'Cuttack, Mahanadi River Delta, Odisha, India',
    },
    category: 'Riverine Flood',
    beforeDate: '2024-07-10',
    afterDate: '2024-08-20',
    radiusKm: 9,
    maxCloud: 60,
    summary: 'Upper catchment discharge leading to massive inundation across downstream Mahanadi delta agricultural and settlement zones.',
    cause: 'Heavy monsoon discharge from Hirakud reservoir and regional delta rainfall.',
  },
  {
    id: 'wayanad-landslide-2024',
    name: 'Wayanad Landslides (Kerala)',
    tag: '🇮🇳 Wayanad Landslide',
    query: 'Meppadi, Wayanad, Kerala',
    location: {
      lat: 11.5534,
      lon: 76.1264,
      displayName: 'Chooralmala & Meppadi, Wayanad, Kerala, India',
    },
    category: 'Debris Flow & Landslide',
    beforeDate: '2024-05-15',
    afterDate: '2024-08-15',
    radiusKm: 6,
    maxCloud: 60,
    summary: 'Catastrophic nighttime debris flow and slope failure wiping out Chooralmala and Mundakkai villages.',
    cause: 'Extreme rainfall exceeding 570mm in 48 hours over saturated Western Ghats hill terrain.',
  },
  {
    id: 'maui-wildfires-2023',
    name: 'Maui Wildfires (Lahaina, Hawaii)',
    tag: '🇺🇸 Maui Wildfires',
    query: 'Lahaina, Hawaii',
    location: {
      lat: 20.8739,
      lon: -156.6777,
      displayName: 'Lahaina, Maui County, Hawaii, United States',
    },
    category: 'Urban Wildfire',
    beforeDate: '2023-07-25',
    afterDate: '2023-08-15',
    radiusKm: 5,
    maxCloud: 20,
    summary: 'Rapid firestorm driven by hurricane winds consuming historic Lahaina town and coastal structures.',
    cause: 'Hurricane Dora gradient winds interacting with severe drought dry-brush conditions.',
  },
  {
    id: 'turkey-earthquake-2023',
    name: 'Kahramanmaraş Earthquake (Turkey/Syria)',
    tag: '🇹🇷 Turkey Earthquake',
    query: 'Kahramanmaraş, Turkey',
    location: {
      lat: 37.5858,
      lon: 36.9371,
      displayName: 'Kahramanmaraş, Mediterranean Region, Turkey',
    },
    category: 'Earthquake (Mw 7.8)',
    beforeDate: '2023-01-20',
    afterDate: '2023-02-20',
    radiusKm: 8,
    maxCloud: 30,
    summary: 'High-magnitude strike-slip rupture causing catastrophic structural pancake collapses across city centers.',
    cause: 'Major rupture along the East Anatolian Fault zone.',
  },
  {
    id: 'valencia-floods-2024',
    name: 'Valencia Flash Floods (DANA Spain)',
    tag: '🇪🇸 Valencia Floods',
    query: 'Paiporta, Valencia, Spain',
    location: {
      lat: 39.4278,
      lon: -0.4186,
      displayName: 'Paiporta, Horta Sud, Valencia, Spain',
    },
    category: 'Flash Flood & Inundation',
    beforeDate: '2024-10-01',
    afterDate: '2024-11-05',
    radiusKm: 6,
    maxCloud: 30,
    summary: 'Isolated high-altitude depression (DANA) dumping over a year’s rain in hours, overflowing river ravines through towns.',
    cause: 'Cold drop / DANA weather phenomenon over warm Mediterranean air.',
  },
  {
    id: 'derna-dam-libya-2023',
    name: 'Derna Dam Collapse & Floods (Libya)',
    tag: '🇱🇾 Libya Dam Flood',
    query: 'Derna, Libya',
    location: {
      lat: 32.7667,
      lon: 22.6367,
      displayName: 'Derna, Cyrenaica, Libya',
    },
    category: 'Dam Breach & Flash Flood',
    beforeDate: '2023-08-20',
    afterDate: '2023-09-20',
    radiusKm: 6,
    maxCloud: 20,
    summary: 'Storm Daniel breached upstream Abu Mansur and Derna dams, washing residential quarters directly into the Mediterranean.',
    cause: 'Torrential rains from Medicane Daniel overwhelming aging dam infrastructure.',
  },
]

/**
 * Fuzzy search disaster events matching a user query string
 */
export function findDisasterMatches(query) {
  if (!query || typeof query !== 'string') return []
  const clean = query.toLowerCase().trim()
  if (clean.length < 2) return []

  return DISASTER_EVENTS.filter(evt => {
    return (
      evt.name.toLowerCase().includes(clean) ||
      evt.query.toLowerCase().includes(clean) ||
      evt.tag.toLowerCase().includes(clean) ||
      evt.location.displayName.toLowerCase().includes(clean) ||
      evt.category.toLowerCase().includes(clean)
    )
  })
}
