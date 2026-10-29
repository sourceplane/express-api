# express-api

Vercel's [Express.js template](https://github.com/vercel/examples/tree/main/solutions/express)
— one Express app: an HTML home page, an about page sent from a file, a JSON
route and a health check, beside a stylesheet and a logo — running as one
**Cloudflare Worker**: the app calls `app.listen()` as it would on Node, and
the Workers runtime's Node.js HTTP server support (`httpServerHandler` from
`cloudflare:node`) hands it every request, with `public/` on **Workers Static
Assets**, deployed by
[Orun](https://github.com/sourceplane/orun) to stage and prod on every merge.
Packaging it as an Orun baseline is the next milestone (EX2).

The template's code is the code. What the port adds is the Worker's entry and
config, the monorepo wrapper, a test package, the deploy contract and a
`/health` route the deploy smoke-tests; what it swaps is Express 4 for
Express 5 (Express 4 cannot load in a Worker) and the platform's name in the
pages. See
[`specs/epics/express-api`](specs/epics/express-api/README.md) for the
design, the milestones and the as-built status.

The example is MIT-licensed (vercel/examples); its licence ships with the app
as `apps/api/LICENSE.md`.

## What is here (the product)

| Surface | Where |
|---|---|
| The app — `GET /` the home page, `/about` the about page, `/api-data` and `/healthz` JSON, `/health` the site's name and environment | `apps/api/src/index.ts` |
| The Worker's entry — `app.listen()` and `httpServerHandler` | `apps/api/src/worker.ts` |
| The about page `res.sendFile` sends, and the static files | `apps/api/components/about.htm`, `apps/api/public/` |
| The site's name (the rename's seam) | `apps/api/src/identity.ts` |
| Worker config (name, compatibility, Static Assets, the about page as a module, per-environment vars) | `apps/api/wrangler.jsonc` |
| Deploy contract | `apps/api/component.yaml` (`cloudflare-worker-turbo`) |
| Tests | `tests/api` (vitest, serves the app on Node and calls every route over HTTP) |
| The example's licence (MIT) | `apps/api/LICENSE.md` |

## Getting started

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build            # wrangler deploy --dry-run → apps/api/dist (the bundle, no upload)
```

Run the Worker locally under workerd and call it:

```bash
pnpm --filter @app/api dev           # http://localhost:8787
curl http://localhost:8787/          # the home page
curl http://localhost:8787/api-data  # {"message":"Here is some sample API data",…}
curl http://localhost:8787/health    # {"status":"ok","name":"Express on Workers","environment":"local"}
```

Add a route with `app.get(...)` (or `post`, `use`, a router) in
`apps/api/src/index.ts`; `wrangler dev` reloads on save. Static files go in
`apps/api/public/`.

## How it maps to Vercel

| Vercel | Here |
|---|---|
| Vercel's Express preset imports `export default app` and runs it in a function | `apps/api/src/worker.ts` calls `app.listen(3000)` and exports `httpServerHandler({ port: 3000 })` from `cloudflare:node` (on with `nodejs_compat`): the Worker hands every request to that `node:http` server |
| `public/` on Vercel's CDN | Workers Static Assets (`assets.directory: public`), served before the Worker |
| `res.sendFile` reading the deployment's disk | `node:fs` over the Worker's modules: `components/about.htm` is uploaded beside the bundle, and `import.meta.url` (which workerd leaves undefined) is defined at build so the example's `__dirname` finds it |
| Express `^4.18.2` | Express `^5.3.0`: Express 4's body-parser loads an iconv-lite build that fails in a Worker; the example's own types are Express 5's |
| `vercel dev` · `vercel build` · `vercel deploy` | `wrangler dev` · `wrangler deploy --dry-run --outdir dist` · `wrangler deploy --env <stage\|prod>` |
| Deploy on push | Orun deploys `<repo>-api-{stage,prod}` on merge to `main` and smoke-tests `/health` (`apps/api/component.yaml`) |
| "Deploy with Vercel" (clone the template) | `orun new --blueprint repo-blueprint.yaml` — a new repository, branded, deployed |

## CI

| Workflow | What it runs | Ships to an app |
|---|---|---|
| `ci.yml` | the Orun pipeline, and the only workflow an app carries: `orun plan --changed`, then one job per lane. A pull request runs the verify lanes (the Worker built, type-checked and dry-deployed per environment; the tests' `quick-check` lane installs and checks the package, it does not run them), except the bootstrap's own landings (`orun/BASE-*`), where `plan` alone is the check; a merge deploys stage → prod. It plans nothing while `intent.yaml` names the placeholder workspace `ws_CHANGE_ME`, as this repository does. A manual run (Orunbase's Deploy button, or Run workflow on `main`) plans the environment and components it names under the push-to-main trigger, so they deploy as a merge deploys them | yes |
