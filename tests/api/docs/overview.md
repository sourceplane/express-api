# api-tests

The app's vitest suite (the home page, the about page read from disk, the JSON route, /healthz, /health and its environment, a 404, the site's name), the Express app served on Node with app.listen and called over HTTP, run with pnpm test

The test suite for **api**. It deploys nothing: its lane installs, builds and runs the tests.

|              |                      |
| ------------ | -------------------- |
| Type         | `turbo-package`      |
| Source       | `tests/api`          |
| Package      | `@app/api-tests`     |
| Environments | `dev`: `quick-check` |

## Depends on

- (none)

## Depended on by

- (none)
