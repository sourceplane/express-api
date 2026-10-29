# express-api

Vercel's [Express.js template](https://github.com/vercel/examples/tree/main/solutions/express)
— one Express app: an HTML home page, an about page sent from a file, a JSON
route and a health check, beside a stylesheet and a logo — running as one
**Cloudflare Worker**: the app calls `app.listen()` as it would on Node, and
the Workers runtime's Node.js HTTP server support (`httpServerHandler` from
`cloudflare:node`) hands it every request, with `public/` on **Workers Static
Assets**, and packaged as an **Orun baseline**: one command takes a new app
from nothing to live on stage and prod, in its own repository, under its own
name — in ONE landing.

The template's code is the code. What the port adds is the Worker's entry and
config, the monorepo wrapper, a test package, the deploy contract and a
`/health` route the deploy smoke-tests; what it swaps is Express 4 for
Express 5 (Express 4 cannot load in a Worker) and the platform's name in the
pages. What the baseline adds is everything needed to make a copy of it
somebody else's — built the way
[cirrus-baseline](https://github.com/sourceplane/cirrus-baseline) is. See
[`specs/epics/express-api`](specs/epics/express-api/README.md) for the
design, the milestones and the as-built status.

The example is MIT-licensed (vercel/examples); its licence ships with the app
as `apps/api/LICENSE.md`.

## Instantiating a product

```bash
git clone --depth 1 --branch <baseline-tag> https://github.com/sourceplane/express-api
cd express-api
orun new --blueprint repo-blueprint.yaml --out ~/apps/acme-api --run-hooks --resume \
  --set reponame=acme-api --set productname="Acme API" \
  --set githuborg=acme-inc --set subdomain=<workers-dev-subdomain>
```

Or, once the platform's registry lists it, from the Orun console (Baselines →
`express-api` → Build). Two phases — `01-product` (the repository, its CI and
the whole app in one pull request, deployed to stage and prod by one
convergence, smoke-tested) and `02-docs` (the live deployment recorded) —
each landing one pull request in the new repository.
**[BOOTSTRAP.md](BOOTSTRAP.md)** is the operator guide;
[docs/phases/](docs/phases/README.md) has a page per phase.

The new repository receives the **app only** — the Worker, its tests, its CI,
its tooling, a README of its own and its operating contract — renamed
throughout to the app's name, repository and Cloudflare Worker. None of this
repository's machinery ships, and nothing that ships names it.

| What makes it a baseline | Where |
|---|---|
| The console card (inputs, secrets, programme) | `blueprint.yaml` |
| The build document (modules, phases, hooks) | `repo-blueprint.yaml` |
| This tree's identity, and the bootstrap's task contracts | `.baseline/` |
| The rename engine | `tooling/rebrand/rebrand.mjs` |
| The bootstrap's helpers (deferrals, redeploy marker, work-tree strip) | `tooling/bootstrap/` |
| The deployment-record renderer | `hooks/render-deployment-docs.sh` |
| The app's README and context pack | `.baseline/product/README.md`, `ai/context/` |
| The baseline's tests: contract, leak, offline bootstrap, end to end | `testing/`, `.github/workflows/baseline.yml` |
| Cutting a `baseline-vN` tag | `.github/workflows/tag.yml` |

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
| `baseline.yml` | the baseline's own tiers: contract tests, the blueprint read by the pinned orun, the leak gate, the offline bootstrap, the app built, dry-deployed, served and read route by route | no |
| `tag.yml` | cuts a `baseline-vN` tag (manual) | no |
