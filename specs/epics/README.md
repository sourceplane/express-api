# Epics

Orun-style work programs. Each epic is a folder carrying `epic.yaml` (the
declaration the platform reads: slug, key prefix, milestones with exit
criteria and task keys) beside its doc set. The pull request that adds the
folder is the adoption; the merge creates the epic in the workspace.

| Epic | Cluster | Status | What it is |
|------|---------|--------|------------|
| [`express-api/`](./express-api/) | **EX** | In progress (EX1: the site on Workers) | Vercel's Express.js template, its code unchanged, as one Cloudflare Worker through the runtime's Node.js HTTP server support — and an Orun baseline that instantiates it in one landing (EX2) |

As-built ≠ intent: what shipped lives in each epic's `IMPLEMENTATION-STATUS.md`.
