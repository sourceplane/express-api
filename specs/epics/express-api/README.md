# express-api — Vercel's Express.js template on Cloudflare Workers

**The example is one Express app — an HTML home page, an about page sent from
a file, a JSON API route and a health check — and the Workers runtime now
runs Node's HTTP server, so the port keeps the app as it is: `app.listen()`
inside one Cloudflare Worker, handed its requests by `httpServerHandler`, the
stylesheet and the logo served by Workers Static Assets, deployed by Orun to
stage and prod on every merge — and the baseline that makes a copy of it
somebody else's app in one landing.**

| | |
|---|---|
| Status | In progress — EX0 on main |
| Upstream | [vercel/examples `solutions/express`](https://github.com/vercel/examples/tree/main/solutions/express) (MIT), at `de86723` (2026-10-16) |
| Reference | [hono-api](https://github.com/sourceplane/hono-api) — the same plain Worker, scaffolding, tests and bootstrap |
| Key | `EX` |

## Read in this order

1. [design.md](design.md) — the example, how each Vercel piece maps to
   Cloudflare, the two things the runtime needed, the repository and the
   build, and the alternatives rejected.
2. [implementation-plan.md](implementation-plan.md) — the milestones and
   what each one lands.
3. [risks-and-open-questions.md](risks-and-open-questions.md) — what is not
   proven, and what was accepted.
4. [IMPLEMENTATION-STATUS.md](IMPLEMENTATION-STATUS.md) — what shipped, and
   every departure from the upstream example.

## Milestones

| Milestone | What it lands | Task |
|---|---|---|
| EX0 — the spec | the repository, its intent, CI, tooling and spec index; this doc set | EX-1 |
| EX1 — Express on Workers | the example in `apps/api` as one Worker with Static Assets, its tests, the README | EX-2 |
| EX2 — a baseline | the console card, the build document, the context pack and the baseline's tests | EX-3 |
