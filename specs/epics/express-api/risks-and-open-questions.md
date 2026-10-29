# express-api — risks and open questions

## EX-A — No live bootstrap yet (OPEN)

Everything short of the platform is proven on every pull request: the card
against the build, the blueprint read by the pinned orun, the leak gate, the
offline bootstrap with the blueprint's own hooks, the app's own plan for the
01-product merge, and the produced app built, dry-deployed, served,
smoke-tested and read route by route in the job tree orun stages. Not proven:
the repository created and linked, the token minted, a real `wrangler
deploy`, the smoke against workers.dev, and the routes and static files read
from the deployed Worker.

## EX-B — Express 5, not the example's Express 4 (ACCEPTED)

Express 4 cannot load in the Worker (design §3: iconv-lite 0.4's browser
build, which wrangler's bundler picks, calls an empty module once the
runtime reports a Node version). Express 5 is the example's own types' major
and runs its routes unchanged. A route an owner adds from Express 4 docs
meets Express 5's changes (path-to-regexp 8 route syntax, promise-aware
handlers, `req.body` undefined without a parser).

## EX-C — The `import.meta.url` define rests on the module layout (WATCH)

`define` states that the app's source sits at `src/index.js` in the uploaded
module tree, and `/bundle/components/about.htm` is where `node:fs` finds the
about page. Both follow from `base_dir: "."` and the Text rule; a change to
either, a file moved, or a runtime that starts giving `import.meta.url` its
own value could break `/about`. The vitest suite (Node) and the e2e tier
(workerd, comparing `/about` with the file) catch it; wrangler does not
inherit `define` into environments, and the e2e builds `--env stage`.

## EX-D — The status line's reason phrase (ACCEPTED)

Through the bridge a status Express sets comes back as `HTTP/1.1 200
unknown`: the code is right, the reason phrase is not Node's `OK`. HTTP
clients read the code; HTTP/2 has no reason phrase.

## EX-E — `sendFile`'s ETag is size-only (ACCEPTED)

`node:fs` timestamps are the Unix epoch on Workers, so `send`'s weak ETag for
`/about` is `W/"<size>-0"` and its `Last-Modified` is 1970. An edit to
`components/about.htm` that keeps its byte length revalidates as unchanged in
a browser that cached the old page. A real page served this way should pass
`etag: false` / `lastModified: false`, or set its own cache headers.

## EX-F — `orun plan --changed` and the first landing (WATCH)

As hono-api: `orun plan --changed` plans nothing for a push with no
`before`; the first landing relies on merging into orun's seeded initial
commit. Confirmed by the first live bootstrap.

## EX-G — stack-tectonic 0.19.0 (ACCEPTED)

The family's one pin: 0.20.0's linked install breaks the Next.js baselines,
and this tree moves with the family.

## EX-H — The about page's copy is upstream's (ACCEPTED)

`components/about.htm` says the app shows how to "upload data to a databse,
and fetch data from a database" — upstream's words (and typo); there is no
database. It is the example's page, kept as it is but for the platform's
name, for an owner to rewrite. Its unclosed `<div>` is upstream's too.
