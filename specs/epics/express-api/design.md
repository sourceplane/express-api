# express-api — design

## 1. The example

[vercel/examples `solutions/express`](https://github.com/vercel/examples/tree/main/solutions/express)
at `de86723`: one `src/index.ts` that builds an Express app and exports it —
no `listen()`, because Vercel's Express preset imports the app and serves it
from a function — plus a static page and two static files.

| Route | What it does |
|---|---|
| `GET /` | an inline HTML page: a nav, "Welcome to Express on Vercel 🚀", the logo |
| `GET /about` | `res.sendFile(path.join(__dirname, '..', 'components', 'about.htm'))` — a file read from disk, `__dirname` derived from `import.meta.url` |
| `GET /api-data` | sample JSON |
| `GET /healthz` | `{"status":"ok","timestamp":…}` |
| `/style.css`, `/logo.png` | `public/`, served by Vercel's static layer, never by Express |

Express `^4.18.2` (locked 4.21.2), `@types/express` `^5.0.0`. Licence: the
repository's `license.md`, MIT (the example's `package.json` says `ISC`,
npm's default for a new package).

## 2. How each Vercel piece maps

| Vercel | Here |
|---|---|
| Vercel's Express preset imports `export default app` and runs it in a function | The Worker's entry (`apps/api/src/worker.ts`) calls `app.listen(3000)` as Node would and exports `httpServerHandler({ port: 3000 })` from `cloudflare:node`, the Workers runtime's Node.js HTTP server support: every request the Worker gets goes to that `node:http` server, and Express answers it |
| `public/` on Vercel's CDN | Workers Static Assets (`assets.directory: public`): `/style.css` and `/logo.png` are served before the Worker runs |
| `res.sendFile` reading the deployment's disk | `node:fs` over the Worker's uploaded modules: `components/about.htm` is uploaded beside the bundle as a text module (`find_additional_modules` and one rule), and appears at `/bundle/components/about.htm` |
| `vercel dev` · `vercel deploy` | `wrangler dev` · `wrangler deploy --env <stage\|prod>`; Orun deploys `<repo>-api-{stage,prod}` on merge and smoke-tests `/health` |
| "Deploy with Vercel" | `orun new --blueprint repo-blueprint.yaml` — a new repository, branded, deployed |

`nodejs_compat` with a compatibility date after 2025-09-01 is all the runtime
asks: it turns on `node:http`'s server half, `node:fs` and the full
`process` (so a wrangler var is in `process.env`). There is no adapter and
no rewrite of the app into a fetch handler.

## 3. What the runtime needed (the spike)

`~/orunbase/spikes/express-api.md` has the evidence. Two things, neither in
the example's routes:

1. **Express 5, not 4.** Express 4 dies at module load: its body-parser 1.x
   pulls iconv-lite 0.4.24, whose `browser` field maps `./lib/streams` to
   nothing; wrangler's bundler resolves that browser build, and iconv-lite
   then calls the empty module because the runtime sets
   `process.versions.node`. Express 4 reads `bodyParser.json` as it loads,
   so no route avoids it. Express 5 (body-parser 2, iconv-lite 0.7) loads
   cleanly. The example already types itself against Express 5
   (`@types/express ^5.0.0`) and uses nothing Express 5 removed.
2. **`import.meta.url`.** workerd leaves it undefined, so the example's
   `fileURLToPath(import.meta.url)` throws at load. wrangler's `define` gives
   it, at build time, the path the source file has inside the uploaded module
   tree — `file:///bundle/src/index.js` — so `__dirname` is `/bundle/src` and
   `../components/about.htm` is the uploaded file, exactly as the source tree
   lays them out. wrangler does not inherit `define` into environments, so
   each `env` section repeats it, and the e2e checks the stage build.

## 4. The repository

hono-api's, component for component:

- `apps/api` — `src/index.ts` (the example's app; its two "Express on
  Vercel" literals read the `SITE_NAME` seam, HTML-escaped, and hono-api's
  `/health` sits beside the example's `/healthz`), `src/identity.ts` (the
  seam), `src/worker.ts` (the bridge), `components/about.htm` and `public/`
  (the example's, Vercel's name swapped for the platform's), `LICENSE.md`
  (the example's MIT licence), `wrangler.jsonc` (committed: the Worker binds
  nothing), `component.yaml` (`cloudflare-worker-turbo`, smoke over
  `/health`).
- `tests/api` — vitest, the app served on Node by `app.listen(0)` and called
  over HTTP: every route, the about page against the file, `/health` with and
  without an environment, Express's 404.
- The baseline: hono-api's card, build document, rename engine (one more
  rule: the about page's `<title>`, a static file the app cannot template),
  bootstrap helpers, deployment-record renderer (which also probes the JSON
  route and a static file), phase pages, context pack and tests.

## 5. Alternatives rejected

- **Rewrite the app as a Hono or fetch handler.** The point of the template
  is Express; the runtime now runs it.
- **Keep Express 4 with an override of iconv-lite.** Pinning a transitive
  dependency under a major its parent never tested, to keep a major the
  example's own types have already left.
- **Import `about.htm` as a text module and `res.send` it.** It drops the
  example's `sendFile` (content type, ETag, conditional GET) for a different
  route; `node:fs` reads the uploaded file as Node reads the disk.
- **Bundle twice and upload the bundle as `src/index.js` (`no_bundle`).** A
  second wrangler config and a build step to obtain the module path the
  `define` states in one line — and the app would still need `__dirname`,
  which comes from `import.meta.url`.
- **`run_worker_first` for every path.** Express would serve nothing in
  `public/` (the example never mounts `express.static`); Static Assets first
  is what Vercel's static layer did.
