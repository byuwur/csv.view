/*
 * File: __tests__/rendering.cjs
 * Desc: Bounded, offline checks for the public CSV renderer contract.
 */
const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const { chromium, firefox, webkit } = require("playwright");
const engine = process.env.BROWSER_ENGINE || "chromium";
assert.ok(["chromium", "firefox", "webkit"].includes(engine), "Unsupported BROWSER_ENGINE");

test("CSV library", { timeout: 30000 }, async (t) => {
  const browser = await { chromium, firefox, webkit }[engine].launch({
    timeout: 10000,
    ...(engine === "chromium" ? { channel: process.env.BROWSER_CHANNEL, executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {})
  });
  t.after(() => browser.close());
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  // Load authored files directly; CDN availability is not part of this contract.
  await page.route("**/*", (route) => route.abort());
  // ===== BROWSER FIXTURE =====
  await page.setContent(
    /* HTML */ `<!doctype html><meta charset="UTF-8" />
      <div id="viewer"></div>`
  );
  await page.addStyleTag({ path: path.join(__dirname, "../csv.css") });
  await page.addScriptTag({ path: path.join(__dirname, "../csv.js") });
  await page.evaluate(() => {
    window.root = document.getElementById("viewer");
  });

  // ===== RENDERING BEHAVIOR =====
  await t.test("parses quoted fields and renders searchable rows", async () => {
    const parsed = await page.evaluate(() => byCSVviewer.parse('name,note\r\n"A,B","a""b\r\nc"\r\nSam,ready'));
    assert.deepEqual(parsed, {
      columns: ["name", "note"],
      rows: [
        ["A,B", 'a"b\r\nc'],
        ["Sam", "ready"]
      ]
    });
    await page.evaluate(() => byCSVviewer(root, "name,note\nAmy,ready\nSam,waiting", { search: true, animations: false }).ready);
    assert.equal(await page.locator("tbody tr").count(), 2);
    await page.getByRole("searchbox").fill("Sam");
    await page.waitForFunction(() => document.querySelectorAll("tbody tr").length === 1);
    assert.match(await page.locator("tbody").textContent(), /Sam/);
  });

  await t.test("rejects malformed CSV and renders cell markup as text", async () => {
    assert.equal(await page.evaluate(() => byCSVviewer(root, 'name\n"unclosed').ready), false);
    assert.equal(await page.evaluate(() => byCSVviewer(root, 'name\n"<img src=""x"" onerror=""window.injected=1"">"').ready), true);
    assert.equal(await page.locator("#viewer img").count(), 0);
    assert.match(await page.locator("tbody").textContent(), /<img/);
    assert.equal(await page.evaluate(() => window.injected), undefined);
  });

  await t.test("replacement and disposal respect the current instance", async () => {
    const result = await page.evaluate(async () => {
      const old = byCSVviewer(root, "name\nold");
      await old.ready;
      const current = byCSVviewer(root, "name\ncurrent");
      const ready = await current.ready;
      old.destroy();
      const preserved = root.textContent.includes("current");
      current.destroy();
      return { ready, preserved, empty: root.childNodes.length === 0 };
    });
    assert.deepEqual(result, { ready: true, preserved: true, empty: true });
  });

  await t.test("loads a source URL through the public API", async () => {
    const url = "https://files.test/sample";
    await page.route(url, (route) =>
      route.fulfill({
        contentType: "text/plain",
        headers: { "Access-Control-Allow-Origin": "*" },
        body: "title,value\nA,42"
      })
    );
    const displayed = await page.evaluate(async (url) => {
      const viewer = byCSVviewer(root, url);
      return (await viewer.ready) && root.textContent;
    }, url);
    assert.match(displayed, /A/);
    assert.match(displayed, /42/);
  });

  assert.deepEqual(errors, [], "No uncaught browser errors");
});
