import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { SITE_NAME } from './identity'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// The site's name goes into HTML: escape it, so a name with `&` or `<` in it
// stays text.
const siteName = SITE_NAME.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const app = express()

// Home route - HTML
app.get('/', (req, res) => {
  res.type('html').send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>${siteName}</title>
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/api-data">API Data</a>
          <a href="/healthz">Health</a>
        </nav>
        <h1>Welcome to ${siteName} 🚀</h1>
        <p>This is a minimal example without a database or forms.</p>
        <img src="/logo.png" alt="Logo" width="120" />
      </body>
    </html>
  `)
})

app.get('/about', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'components', 'about.htm'))
})

// Example API endpoint - JSON
app.get('/api-data', (req, res) => {
  res.json({
    message: 'Here is some sample API data',
    items: ['apple', 'banana', 'cherry'],
  })
})

// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

// The deploy's contract (the port's, beside the example's /healthz): the
// site's name and the environment whose config the Worker runs — wrangler's
// `env.<name>.vars.ENVIRONMENT`, which nodejs_compat puts in process.env — so
// a 200 here is this site, deployed to that environment.
app.get('/health', (req, res) => {
  res.json({ status: 'ok', name: SITE_NAME, environment: process.env.ENVIRONMENT ?? 'unknown' })
})

export default app
