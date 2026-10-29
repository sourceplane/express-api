# express-api

An [Express](https://expressjs.com) app on one **Cloudflare Worker**. The app
calls `app.listen()` as it would on Node, and the Workers runtime's Node.js
HTTP server support (`httpServerHandler` from `cloudflare:node`) hands it
every request; the stylesheet and the logo in `apps/api/public/` are served
by Workers Static Assets before the Worker runs. Every merge to `main`
deploys it to stage, then prod.

Built from Vercel's Express.js template (vercel/examples, MIT — the licence
is `apps/api/LICENSE.md`).

## Live deployment

<!-- 02-docs:begin -->
Not recorded yet. The bootstrap's last phase writes the live URLs, the
workspace and the secrets the app uses into
[ai/context/deployment.md](ai/context/deployment.md); how the app deploys
and how to operate it is in
[ai/context/operations.md](ai/context/operations.md).
<!-- 02-docs:end -->

## Routes

| Route | Answers |
|---|---|
| `GET /` | the home page, titled with the site's name (`SITE_NAME`) |
| `GET /about` | `apps/api/components/about.htm`, sent with `res.sendFile` |
| `GET /api-data` | sample JSON |
| `GET /healthz` | `{"status":"ok","timestamp":"…"}` |
| `GET /health` | `{"status":"ok","name":"<SITE_NAME>","environment":"<env>"}` — what the deploy's smoke and an operator's probe read |
| `/style.css`, `/logo.png` | `apps/api/public/`, from Static Assets |
| anything else | Express's `404` (`Cannot GET …`) |

## What is here

| Surface | Where |
|---|---|
| The routes | `apps/api/src/index.ts` |
| The Worker's entry (`app.listen()` and `httpServerHandler`) | `apps/api/src/worker.ts` |
| The site's name (the home page's title and heading, and `/health`) | `apps/api/src/identity.ts` |
| The about page, and the static files | `apps/api/components/about.htm`, `apps/api/public/` |
| Worker config (name, compatibility date, Static Assets, the about page as a module, per-environment vars) | `apps/api/wrangler.jsonc` |
| Deploy contract | `apps/api/component.yaml` (`cloudflare-worker-turbo`) |
| Tests | `tests/api` (vitest, serves the app on Node and calls every route over HTTP) |

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
pnpm --filter @app/api dev                 # http://localhost:8787
curl http://localhost:8787/                # the home page
curl http://localhost:8787/api-data        # {"message":"Here is some sample API data",…}
curl http://localhost:8787/health          # {"status":"ok",…,"environment":"local"}
```

Add a route with `app.get(...)` (or `post`, `use`, a router) in
`apps/api/src/index.ts`; `wrangler dev` reloads on save. It is Express 5:
route paths use its syntax, and a route that reads `req.body` mounts a parser
(`express.json()`, `express.urlencoded()`). Keep `/health`: the deploy's
smoke reads it.

Static files go in `apps/api/public/`. A page the app sends from disk with
`res.sendFile` goes in `apps/api/components/`: `wrangler.jsonc` uploads
`components/**/*.htm` beside the bundle, where `node:fs` reads it (add a rule
for any other file type you send). The Worker's `node:fs` gives every file the
epoch as its modification time, so set your own cache headers on a page that
changes.

## How it deploys

Merges to `main` converge through [Orun](https://github.com/sourceplane/orun):
`.github/workflows/ci.yml` plans the changed components and runs each lane
against the workspace in `intent.yaml`. The app deploys to `stage`, then to
`prod` once stage has converged on the same commit; `dev` only verifies. The
Worker is `express-api-api-<env>` on your account's workers.dev subdomain, and
every deploy is smoke-tested over HTTP: `/health` must answer `"status":"ok"`
for that environment. A pull request runs the same pipeline's verify lanes:
the Worker built, type-checked and dry-deployed for each environment, with
nothing deployed. They do not lint or run the tests, so run `pnpm typecheck`,
`pnpm lint` and `pnpm test` before you push. (A push to `main` builds,
deploys and smoke-tests.)

The pipeline holds one credential, GitHub's own `GITHUB_TOKEN`. The
Cloudflare token and account id are brokered per run from the workspace's
Cloudflare connection; nothing provider-shaped is stored in the repository
or in GitHub.

**Deploy by hand.** Orunbase's **Deploy** button on a component, or **Run
workflow** on the CI workflow in GitHub's Actions tab (on `main`), runs
`ci.yml` for the environment and components you pick, and each one deploys
exactly as a merge would deploy it. Leave the component blank to redeploy
every component in that environment, with nothing changed: after rotating a
secret, say. A component with nothing to run in that environment (a test
suite in `prod`) is left out with a notice.

## Adding a binding or a secret

The Worker binds nothing today, so `wrangler.jsonc` is committed as it
deploys. To give it a KV namespace, a D1 database or an R2 bucket, add the
resource under `infra/` as its own component and have `apps/api/component.yaml`
depend on it; `tooling/wire/` renders a wrangler template from the ids that
component publishes. A runtime secret (an API key for a service the app
calls) is an Orun secret: `orun secrets set <KEY> --org <ws> --env <env>`,
declared in the component's `optionalSecretEnv` and named in its
`runtimeSecrets`, then pushed to the Worker after each deploy. Until it is
set, the route that needs it should say so rather than fail. On the Worker
a secret is in `process.env` as well as in `env` from `cloudflare:workers`.

## Custom domain

The app answers on workers.dev from its first deploy. To serve it on your own
domain, add the domain to the Cloudflare account the app deploys into and
attach it to the Worker (dashboard → Workers & Pages → `express-api-api-prod` →
Settings → Domains & Routes → Add → Custom domain); do the same for stage
with a subdomain if you want one. The workers.dev URL keeps answering, and the
deploy's smoke keeps reading it — unless the environment sets `DEPLOYED_URL`
in `intent.yaml`, which the smoke reads instead:

```yaml
environments:
  prod:
    env:
      DEPLOYED_URL: https://express-api.example.com
```

The repository names the domain in one place, `BASE_DOMAIN` in `intent.yaml`
(one line per environment), which the app was born with as the reserved
placeholder `express-api.example.com` — the example above carries it too.
Replace it with your domain in the same change that attaches it.
