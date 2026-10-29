# express-api — decisions

The choices that shape this repository, one line each, with where the full
reasoning lives. Superseded decisions stay listed, marked, so the history
reads in order.

| # | Decision | Why | Source |
|---|---|---|---|
| 1 | The example's Express app, unchanged, behind `httpServerHandler` from `cloudflare:node` (`app.listen` in `src/worker.ts`), in a plain Worker (`cloudflare-worker-turbo`) | The Workers runtime runs Node's HTTP server under `nodejs_compat`; no adapter and no rewrite into a fetch handler | `specs/epics/express-api/design.md` |
| 2 | `public/` is Workers Static Assets, served before the Worker | What Vercel's static layer did; the example never mounts `express.static` | design.md |
| 3 | Express 5, not the example's Express 4 | Express 4's body-parser loads an iconv-lite whose browser build fails at load in the Worker; the example's own types are Express 5's | design.md §3, risk EX-B |
| 4 | `components/about.htm` uploaded as a text module, and `import.meta.url` defined at build time as `file:///bundle/src/index.js` | `res.sendFile` reads it through `node:fs` from the module tree, and workerd gives no `import.meta.url`; the example's `__dirname` line stays as it is | design.md §3, risk EX-C |
| 5 | `wrangler.jsonc` is committed, not rendered | The Worker binds nothing, so there is nothing to wire; the lane's structure check finds it before any build | `apps/api/component.yaml` |
| 6 | `GET /health` beside the example's `/healthz`, and one name seam (`apps/api/src/identity.ts`) plus the about page's `<title>` | The deploy smoke and the bootstrap's probes read `/health`; the rename writes the name where the pages carry it | IMPLEMENTATION-STATUS |
| 7 | One landing (`01-product`) then the record (`02-docs`) | A landing has a fixed cost; the plan, not the phases, carries deploy order (cirrus-baseline since baseline-v22) | `repo-blueprint.yaml` |
| 8 | `ci.yml` plans nothing while `intent.yaml` names `ws_CHANGE_ME` | A bootstrap cannot set a repository variable | hono-api's design |
| 9 | stack-tectonic 0.19.0 | The family's one pin (risk EX-G) | risks-and-open-questions.md |
| 10 | `subdomain` is read from the Cloudflare connection, never asked; the console asks for no domain | It belongs to the account; a domain is an owner's step after the bootstrap | `blueprint.yaml` |
