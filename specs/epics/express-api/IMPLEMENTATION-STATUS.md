# express-api — implementation status

| Milestone | State | Landed |
|---|---|---|
| EX0 — the spec | ✅ | EX-1 |
| EX1 — Express on Workers | ✅ | EX-2 |
| EX2 — a baseline | planned | EX-3 |

## Departures from the upstream example

Everything not listed here is the example as it is upstream at `de86723`.

| # | What | Why |
|---|---|---|
| 1 | The app lives in `apps/api` of a pnpm workspace (`@app/api`); upstream's `package.json`, `tsconfig.json`, `.gitignore` and README are replaced by the workspace's | The workspace's shape (hono-api's) |
| 2 | Express `^5.3.0` (upstream `^4.18.2`, locked 4.21.2); `@types/express` `^5.0.0` kept, moved to devDependencies with `@types/node` | Express 4 cannot load in the Worker (design §3, risk EX-B); the example's types were already Express 5's |
| 3 | `apps/api/src/worker.ts` added: `app.listen(3000)` and `export default httpServerHandler({ port: 3000 })` from `cloudflare:node` | The Worker's entry, in place of Vercel's Express preset; `src/index.ts` still exports the app |
| 4 | `<title>` and the home page's heading read `SITE_NAME` (`"Express on Workers"`; upstream's literal is "Express on Vercel"), HTML-escaped | One rename seam; the page no longer names a platform it does not run on |
| 5 | `components/about.htm`: its `<title>` is the site's name (the rename writes it) and "with Vercel" is "with Cloudflare Workers"; the rest is upstream's (risk EX-H) | A static file the app sends as it is; the platform's name |
| 6 | `GET /health` added beside the example's `/healthz`: `{"status":"ok","name":SITE_NAME,"environment":process.env.ENVIRONMENT}` | The deploy's smoke and the bootstrap's probes read it (hono-api's contract) |
| 7 | `wrangler.jsonc`: `<repo>-api`, `nodejs_compat`, Static Assets over `public/`, `components/about.htm` uploaded as a text module (the default .wasm/.txt/.bin rules off), `define` of `import.meta.url` per environment, `env.{dev,stage,prod}`; `component.yaml` (`cloudflare-worker-turbo`, a smoke over `/health`) | The Worker's config and the deploy contract replace Vercel's (design §2–3, risk EX-C) |
| 8 | `apps/api/src/cloudflare-node.d.ts` declares `cloudflare:node`'s `httpServerHandler` | The one Workers API the app imports, typed without `@cloudflare/workers-types` |
| 9 | `apps/api/LICENSE.md` is vercel/examples' MIT licence (upstream's `package.json` says `ISC`, npm's default) | The example ships under the repository's licence; the product carries it |
| 10 | Tests: `tests/api/src/app.test.ts` (vitest): the app served on Node and every route called over HTTP | The example ships none |
