import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

test("every UI color comes from the :root design tokens", async () => {
  const css = (await fs.readFile("src/styles.css", "utf8")).replace(/\r\n/g, "\n");
  const start = css.indexOf(":root {"), end = css.indexOf("}\n", start) + 2;
  const tokens = css.slice(start, end), rest = css.slice(0, start) + css.slice(end);
  const raw = rest.match(/#[\da-f]{3,8}\b|rgba?\(|hsla?\(/gi) || [];
  assert.deepEqual(raw, [], "Use a var(--token) from :root instead of a raw color");
  // Every token used is defined.
  const defined = new Set([...tokens.matchAll(/--([\w-]+):/g)].map((m) => m[1]));
  for (const [, name] of rest.matchAll(/var\(--([\w-]+)/g)) assert.ok(defined.has(name) || name === "rail-w", `Undefined token --${name}`);
});
