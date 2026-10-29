import { readFileSync } from "node:fs";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import * as path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

// The Express app on Node, served the way `node` would serve it — a real
// HTTP server on a free port, called over fetch — so this is the template's
// behaviour, independent of the runtime. The e2e tier serves the same app
// under workerd, through the Workers runtime's Node.js HTTP server support.
let server: Server;
let base: string;

beforeAll(async () => {
  const { default: app } = await import("@/index");
  server = await new Promise<Server>((resolve) => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
  });
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(
  () =>
    new Promise<void>((resolve) => {
      server.close(() => resolve());
    }),
);

const get = (route: string) => fetch(base + route);

describe("the Express app (apps/api/src/index.ts)", () => {
  it("answers / with the home page, named by the site's name", async () => {
    const { SITE_NAME } = await import("@/identity");
    const res = await get("/");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/^text\/html/);
    const html = await res.text();
    // The name is text in the page: escaped, so a name with `&` or `<` in it
    // (an owner's, after the rename) stays text.
    const name = SITE_NAME.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    expect(html).toContain(`<title>${name}</title>`);
    expect(html).toContain(`<h1>Welcome to ${name} 🚀</h1>`);
    expect(html).toContain('<link rel="stylesheet" href="/style.css" />');
    expect(html).toContain('<img src="/logo.png" alt="Logo" width="120" />');
    for (const link of ["/", "/about", "/api-data", "/healthz"]) {
      expect(html).toContain(`<a href="${link}">`);
    }
  });

  it("answers /about with components/about.htm, read from disk by res.sendFile", async () => {
    const res = await get("/about");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/^text\/html/);
    const file = readFileSync(path.resolve(__dirname, "../../../apps/api/components/about.htm"), "utf8");
    expect(await res.text()).toBe(file);
  });

  it("answers /api-data with the sample JSON", async () => {
    const res = await get("/api-data");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/^application\/json/);
    expect(await res.json()).toEqual({
      message: "Here is some sample API data",
      items: ["apple", "banana", "cherry"],
    });
  });

  it("answers /healthz with ok and the time", async () => {
    const before = Date.now();
    const res = await get("/healthz");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string; timestamp: string };
    expect(body.status).toBe("ok");
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
    expect(Date.parse(body.timestamp)).toBeGreaterThanOrEqual(before - 1000);
  });

  it("answers an unknown path with Express's own 404", async () => {
    const res = await get("/nope");
    expect(res.status).toBe(404);
    expect(await res.text()).toContain("Cannot GET /nope");
  });
});

describe("GET /health — what the deploy's smoke and the bootstrap's probe read", () => {
  const saved = process.env.ENVIRONMENT;
  afterEach(() => {
    if (saved === undefined) delete process.env.ENVIRONMENT;
    else process.env.ENVIRONMENT = saved;
  });

  it("names the site and the environment the Worker runs as", async () => {
    const { SITE_NAME } = await import("@/identity");
    // What wrangler's `env.stage.vars` hands the deployed Worker, and
    // nodejs_compat puts in process.env.
    process.env.ENVIRONMENT = "stage";
    const res = await get("/health");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/^application\/json/);
    expect(await res.json()).toEqual({ status: "ok", name: SITE_NAME, environment: "stage" });
  });

  it("still answers when the Worker has no ENVIRONMENT var", async () => {
    delete process.env.ENVIRONMENT;
    const res = await get("/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ status: "ok", environment: "unknown" });
  });
});

describe("the site's identity (apps/api/src/identity.ts)", () => {
  it("names the site", async () => {
    const { SITE_NAME } = await import("@/identity");
    expect(SITE_NAME.trim()).not.toBe("");
  });
});
