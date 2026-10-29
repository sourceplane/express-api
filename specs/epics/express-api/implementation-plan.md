# express-api — implementation plan

Three milestones, one task each, each landed as one pull request.

## EX0 — the spec (EX-1)

The repository is born with hono-api's frame — `intent.yaml` (dev
verify-only, stage, prod after stage; the placeholder workspace
`ws_CHANGE_ME`, so CI plans nothing until it is linked), `ci.yml` byte for
byte turso-starter's (as hono-api carries it), the shared TypeScript and
ESLint configuration, the wrangler renderer, the pnpm workspace and turbo
pipeline, and the spec index — and this doc set and the three task
contracts land on it.

## EX1 — Express on Workers (EX-2)

- `apps/api/src/index.ts` is upstream's, its two "Express on Vercel"
  literals read from `SITE_NAME` (HTML-escaped), with hono-api's `/health`
  beside the example's `/healthz`; `apps/api/src/identity.ts` holds
  `SITE_NAME`; `apps/api/src/worker.ts` is the bridge (`app.listen` and
  `httpServerHandler`); `components/about.htm` and `public/` are the
  example's; `apps/api/LICENSE.md` is the example's MIT licence.
- Express 5 (design §3); `apps/api/wrangler.jsonc` (`nodejs_compat`, Static
  Assets over `public/`, `components/about.htm` uploaded as a text module,
  `import.meta.url` defined per environment) and `component.yaml`
  (`cloudflare-worker-turbo`) with a smoke over `/health`.
- `tests/api`: vitest serving the app on Node with `app.listen(0)` and
  calling `/`, `/about` (against the file), `/api-data`, `/healthz`,
  `/health` with and without an environment, and a 404, over HTTP.
- The README: run, test, deploy; how each Vercel piece maps.

Done when typecheck, lint, test and build are green, and `wrangler dev`
answers every route as Node does and serves `public/` from Static Assets.

## EX2 — a baseline (EX-3)

hono-api's machinery on this tree: the card, the build document (one
landing, `01-product`, then the record, `02-docs`), `.baseline/` (identity,
the product's README, task contracts), the rename engine (with the about
page's title as a second rule), the bootstrap helpers, the
deployment-record renderer (which also probes `/api-data` and
`/style.css`), the phase pages, the context pack, and the baseline's tests —
with the end-to-end tier reading every route and both static files from the
staged Worker, and checking it uploads only the about page beside its bundle.
Done when every Baseline CI tier is green; tagged `baseline-v1`.
