export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  let clientId = process.env.VITE_CLIENT_ID
  let clientSecret = process.env.VITE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    if (typeof req.body === 'object' && req.body !== null) {
      clientId = clientId || req.body.client_id || req.body.clientId
      clientSecret = clientSecret || req.body.client_secret || req.body.clientSecret
    } else if (typeof req.body === 'string') {
      const params = new URLSearchParams(req.body)
      clientId = clientId || params.get('client_id') || params.get('clientId')
      clientSecret = clientSecret || params.get('client_secret') || params.get('clientSecret')
    }
  }

  clientId = clientId || 'sh-44433124-93a5-40ff-b91e-a00049e76b53'
  clientSecret = clientSecret || 'lqWmSWxCE62QLZJl6WVaucvrltxz4Brh'

  try {
    const fetchRes = await fetch(
      'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        }),
      }
    )

    const data = await fetchRes.json()
    return res.status(fetchRes.status).json(data)
  } catch (error) {
    console.error('CDSE Token Proxy Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
