import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

function copernicusProxyPlugin() {
  return {
    name: 'copernicus-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/cdse-auth')) {
          const targetUrl =
            'https://identity.dataspace.copernicus.eu' +
            req.url.replace(/^\/cdse-auth/, '')
          try {
            const bodyBuffers = []
            for await (const chunk of req) {
              bodyBuffers.push(chunk)
            }
            const body =
              bodyBuffers.length > 0 ? Buffer.concat(bodyBuffers) : undefined

            const headers = { ...req.headers }
            delete headers.host
            delete headers.origin
            delete headers.referer

            const fetchRes = await fetch(targetUrl, {
              method: req.method,
              headers,
              body: ['GET', 'HEAD'].includes(req.method || '') ? undefined : body,
            })

            res.statusCode = fetchRes.status
            fetchRes.headers.forEach((value, key) => {
              res.setHeader(key, value)
            })
            const arrayBuffer = await fetchRes.arrayBuffer()
            res.end(Buffer.from(arrayBuffer))
          } catch (err) {
            console.error('CDSE Auth Proxy Error:', err)
            res.statusCode = 500
            res.end(JSON.stringify({ error: err.message }))
          }
          return
        }

        if (req.url && req.url.startsWith('/sentinel-process')) {
          const targetUrl =
            'https://sh.dataspace.copernicus.eu' +
            req.url.replace(/^\/sentinel-process/, '')
          try {
            const bodyBuffers = []
            for await (const chunk of req) {
              bodyBuffers.push(chunk)
            }
            const body =
              bodyBuffers.length > 0 ? Buffer.concat(bodyBuffers) : undefined

            const headers = { ...req.headers }
            delete headers.host
            delete headers.origin
            delete headers.referer

            const fetchRes = await fetch(targetUrl, {
              method: req.method,
              headers,
              body: ['GET', 'HEAD'].includes(req.method || '') ? undefined : body,
            })

            res.statusCode = fetchRes.status
            fetchRes.headers.forEach((value, key) => {
              res.setHeader(key, value)
            })
            const arrayBuffer = await fetchRes.arrayBuffer()
            res.end(Buffer.from(arrayBuffer))
          } catch (err) {
            console.error('Sentinel Process Proxy Error:', err)
            res.statusCode = 500
            res.end(JSON.stringify({ error: err.message }))
          }
          return
        }

        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copernicusProxyPlugin()],
})
