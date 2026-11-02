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

  let retrieved = 0, withEntry = 0, flaggedOk = 0, flaggedBad = 0, agentBad = 0, codeApproved = 0, codeApprovedBad = 0;
  const rows = testset.map((c) => {
    const r = byClaim.get(norm(c.claim))!;
    const ids = r.decision === "ok" ? [r.register_id] : r.decision === "do_not_use" ? [r.use_instead?.register_id] : r.candidates.map((x) => x.register_id);
    if (c.entry && r.decision !== "do_not_use") {
      withEntry++;
      if (ids.includes(c.entry)) retrieved++;
    }
    if (r.decision === "ok" && c.verdict !== "ok") codeApprovedBad++;
    if (r.decision === "ok") codeApproved++;
    if (r.decision === "do_not_use") c.verdict === "ok" ? flaggedOk++ : flaggedBad++;
    if (r.decision === "agent_judges" && c.verdict !== "ok") agentBad++;
    return `| ${c.claim} | ${c.verdict} | ${c.entry ?? "none"} | ${ids.join(", ") || "none"} | ${r.decision === "do_not_use" ? r.flags.join("; ") : ""} | ${r.decision} |`;
  });

  const summary = [
    `One batch call for ${testset.length} claims took ${ms} ms (includes loading the model and indexing the register).`,
    `Response size: ${JSON.stringify(out).length} characters.`,
    `Approved by code (exact approved wording): ${codeApproved}, of which wrong: ${codeApprovedBad}.`,
    `Expected entry among what the agent is shown (ok and agent_judges claims): ${retrieved}/${withEntry}.`,
    `Flags fired on ${flaggedOk + flaggedBad} claims: ${flaggedBad} truly not ok, ${flaggedOk} false alarm(s).`,
    `Left to the agent: ${testset.length - flaggedOk - flaggedBad - codeApproved} claims, of which ${agentBad} are not ok and need the agent to catch them (conditions, invented features).`,
  ].join("\n");
  writeFileSync(
    new URL("./tool-results.md", import.meta.url),
    `# Tool evaluation\n\n${summary}\n\n| Claim | Expected | Expected entry | Entries shown | Flags | Decision |\n|---|---|---|---|---|---|\n${rows.join("\n")}\n`,
  );
  console.log(summary);
}

main();
