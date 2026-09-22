import fs from "node:fs/promises";
import crypto from "node:crypto";
const queue = JSON.parse(
  await fs.readFile("data/research/kit-research-queue.json", "utf8"),
);
const tasks = new Map(queue.map((t) => [t.id, t]));
const batchFiles = (await fs.readdir("data/research/discovery"))
  .filter((f) => f.endsWith(".json"))
  .sort();
let checkpointed = 0;
for (const file of batchFiles) {
  const batch = JSON.parse(
    await fs.readFile("data/research/discovery/" + file, "utf8"),
  );
  for (const [index, item] of batch.tasks.entries()) {
    const task = tasks.get(item.id);
    if (!task) throw Error("Unknown research ID");
    const path = `data/research/results/${task.id}.json`;
    let existing = {};
    try {
      existing = JSON.parse(await fs.readFile(path, "utf8"));
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }
    const checks = [];
    for (const ref of task.seed_references) {
      const id = crypto
        .createHash("sha256")
        .update(ref.url)
        .digest("hex")
        .slice(0, 20);
      try {
        const c = JSON.parse(
          await fs.readFile(`data/research/link-checks/${id}.json`, "utf8"),
        );
        checks.push({
          url: ref.url,
          status: c.status ?? null,
          error: c.error ?? null,
          record_path: `data/research/link-checks/${id}.json`,
        });
      } catch {
        checks.push({
          url: ref.url,
          status: null,
          reason: "Availability not yet checked",
        });
      }
    }
    const searchSucceeded =
      typeof batch.response === "string" && /https?:\/\//.test(batch.response);
    const result = {
      task_id: task.id,
      team_id: task.team_id,
      team_name: task.team_name,
      country_name: task.country_name,
      variant: task.kit_variant,
      kit_season: null,
      status: searchSucceeded ? "researching" : "unresearched",
      reason: searchSucceeded
        ? "Discovery query completed. Official front-view image, exact season/variant, colors, geometry and visual comparison remain to be completed."
        : "Discovery request did not return usable results and must be retried.",
      ...existing,
      seed_references: task.seed_references,
      seed_checks: checks,
      discovery: {
        query: batch.queries[index].q,
        checked_at: batch.checked_at,
        response_path: `data/research/discovery/${file}`,
        search_succeeded: searchSucceeded,
        visually_verified: false,
      },
      remaining:
        existing.status === "ready"
          ? []
          : ["draft", "drafted"].includes(existing.status)
            ? [
                "Refine artwork against the saved source",
                "Review final rendering",
              ]
            : [
                "Inspect official club/federation/manufacturer source",
                "Save the correct season and variant front photograph",
                "Estimate and document garment colors",
                "Map observed shapes onto the original master",
                "Render and visually review",
              ],
    };
    await fs.writeFile(path, JSON.stringify(result, null, 2) + "\n");
    checkpointed++;
  }
}
console.log({ checkpointed, total: queue.length });
