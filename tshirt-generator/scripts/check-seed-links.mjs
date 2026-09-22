import fs from "node:fs/promises";
import crypto from "node:crypto";
const tasks = JSON.parse(
  await fs.readFile("data/research/kit-research-queue.json", "utf8"),
);
const auditUrls = JSON.parse(await fs.readFile("data/audit/urls.json", "utf8"));
const urls = [
  ...new Set([
    ...auditUrls,
    ...tasks.flatMap((t) => t.seed_references.map((r) => r.url)),
  ]),
];
const directory = "data/research/link-checks";
await fs.mkdir(directory, { recursive: true });
let count = 0;
const pending = [...urls];
async function worker() {
  while (pending.length) {
    const url = pending.shift();
    const id = crypto
        .createHash("sha256")
        .update(url)
        .digest("hex")
        .slice(0, 20),
      file = `${directory}/${id}.json`;
    try {
      await fs.access(file);
      count++;
      continue;
    } catch {}
    const record = {
      url,
      checked_at: new Date().toISOString(),
      purpose: "Seed provenance availability; does not verify a kit",
    };
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(15000),
        headers: { "User-Agent": "TshirtCatalogResearch/1.0" },
      });
      record.status = response.status;
      record.final_url = response.url;
      record.content_type = response.headers.get("content-type");
      const reader = response.body.getReader();
      let text = "",
        size = 0;
      while (size < 200000) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        text += new TextDecoder().decode(value);
      }
      await reader.cancel();
      record.title =
        text
          .match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
          ?.replace(/\s+/g, " ")
          .trim() ?? null;
      record.kit_evidence_reviewed = false;
    } catch (e) {
      record.error = e.message;
    }
    await fs.writeFile(file, JSON.stringify(record, null, 2) + "\n");
    count++;
    if (count % 25 === 0)
      console.log(`${count}/${urls.length} seed URLs checked`);
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
await fs.writeFile(
  "data/research/link-check-summary.json",
  JSON.stringify(
    {
      checked_at: new Date().toISOString(),
      unique_urls: urls.length,
      teams: 735,
      slots: 1470,
      checked: count,
      warning: "Availability checks are not current-kit visual verification.",
    },
    null,
    2,
  ),
);
console.log(`Done: ${count} links`);
