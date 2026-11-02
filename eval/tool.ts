// Runs the real tool code (src/register.ts) over the labelled test set and scores what code decides on its own.
// Run: npx tsx eval/tool.ts
import { writeFileSync } from "node:fs";
import { checkClaims } from "../src/register";
import testset from "./testset.json";

const norm = (s: string) => s.trim().replace(/[:;,.\s]+$/, "");

async function main() {
  const t0 = Date.now();
  const out = await checkClaims(testset.map((c) => c.claim));
  const ms = Date.now() - t0;
  const byClaim = new Map(out.results.map((r) => [r.claim, r]));

  let retrieved = 0, withEntry = 0, flaggedOk = 0, flaggedBad = 0, agentBad = 0;
  const rows = testset.map((c) => {
    const r = byClaim.get(norm(c.claim))!;
    const top = r.candidates[0];
    if (c.entry) {
      withEntry++;
      if (r.candidates.some((x) => x.register_id === c.entry)) retrieved++;
    }
    if (r.flags.length) c.verdict === "ok" ? flaggedOk++ : flaggedBad++;
    else if (c.verdict !== "ok") agentBad++;
    return `| ${c.claim} | ${c.verdict} | ${c.entry ?? "none"} | ${top.register_id} ${top.similarity} | ${r.flags.join("; ") || "none"} | ${r.decision} |`;
  });

  const summary = [
    `One batch call for ${testset.length} claims took ${ms} ms (includes loading the model and indexing the register).`,
    `Expected entry among the 3 candidates: ${retrieved}/${withEntry}.`,
    `Flags fired on ${flaggedOk + flaggedBad} claims: ${flaggedBad} truly not ok, ${flaggedOk} false alarm(s).`,
    `Left to the agent: ${testset.length - flaggedOk - flaggedBad} claims, of which ${agentBad} are not ok and need the agent to catch them (conditions, invented features).`,
  ].join("\n");
  writeFileSync(
    new URL("./tool-results.md", import.meta.url),
    `# Tool evaluation\n\n${summary}\n\n| Claim | Expected | Expected entry | Top candidate | Flags | Decision |\n|---|---|---|---|---|---|\n${rows.join("\n")}\n`,
  );
  console.log(summary);
}

main();
