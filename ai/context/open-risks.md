# express-api — open risks

What is not yet proven or not yet decided. The full write-up of every risk,
including the accepted and resolved ones, is
`specs/epics/express-api/risks-and-open-questions.md`; this page lists only
what is still live, so it should be short.

| ID | Risk | State | What closes it |
|---|---|---|---|
| EX-A | No live bootstrap yet: the repository created and linked, the deploy token minted, a real `wrangler deploy`, the smoke and the probes against workers.dev, and the routes and static files read from the deployed Worker are all unproven | OPEN | One bootstrap from a tag against a workspace |
| EX-C | The `import.meta.url` define and the about page's module path rest on the module layout (`base_dir`, the Text rule, the file's place) | WATCH | The tests and the e2e (which compares `/about` with the file) on every change |
| EX-F | `orun plan --changed` plans nothing for a push with no `before`; the first landing relies on merging into orun's seeded initial commit | WATCH | Confirmed by the first live bootstrap |

Accepted, and worth knowing before you change them: EX-B (Express 5, not 4),
EX-D (the bridge's reason phrase is `unknown`), EX-E (`sendFile`'s ETag is
size-only: fs timestamps are the epoch), EX-G (stack-tectonic 0.19.0), EX-H
(the about page's copy is upstream's).
