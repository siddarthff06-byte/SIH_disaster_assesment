export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const authHeader = req.headers.authorization

  try {
    const fetchRes = await fetch(
      'https://sh.dataspace.copernicus.eu/api/v1/process',
      {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
          Accept: 'image/png',
        },
        body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body),
      }
    )

    res.status(fetchRes.status)
    fetchRes.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })
    const arrayBuffer = await fetchRes.arrayBuffer()
    return res.end(Buffer.from(arrayBuffer))
  } catch (error) {
    console.error('Sentinel Process Proxy Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
