// What can deterministic flags decide on their own, once embeddings have retrieved the candidate?
// Run: npx tsx eval/flags.ts
import { pipeline } from "@huggingface/transformers";
import register from "../src/data/claims-register.json";
import testset from "./testset.json";

const entries = register.claims;
const ABSOLUTES = ["eliminate", "never", "always", "zero", "100%", "every payment", "all fraud", "impossible", "thing of the past"];
const figures = (t: string) => (t.match(/\d[\d,]*(?:\.\d+)?%?/g) ?? []).map((n) => n.replace(/,/g, ""));

async function main() {
  const embed = await pipeline("feature-extraction", "Xenova/bge-small-en-v1.5");
  const vec = async (t: string) => Array.from((await embed(t, { pooling: "mean", normalize: true })).data as Float32Array);
  const ev = await Promise.all(entries.map((e) => vec(`${e.claim}. ${e.approved_wording}`)));

  const out: string[] = [];
  let decided = 0, correct = 0;
  for (const c of testset) {
    const q = await vec(c.claim);
    const top = entries.map((e, i) => ({ e, s: q.reduce((a, x, j) => a + x * ev[i][j], 0) })).sort((a, b) => b.s - a.s)[0];
    const lower = c.claim.toLowerCase();
    const flags: string[] = [];
    const banned = register.banned_terms.filter((t) => lower.includes(t));
    if (banned.length) flags.push(`banned term: ${banned.join(", ")}`);
    const abs = ABSOLUTES.filter((t) => lower.includes(t) && !top.e.approved_wording.toLowerCase().includes(t));
    if (abs.length) flags.push(`absolute: ${abs.join(", ")}`);
    const extra = figures(c.claim).filter((n) => !figures(top.e.approved_wording).includes(n));
    if (extra.length) flags.push(`figure not approved: ${extra.join(", ")}`);
    if (top.e.status !== "approved" && c.claim.trim() !== top.e.approved_wording.trim()) flags.push(`entry ${top.e.id} is ${top.e.status}`);

    // Code decides only when a flag fires (always "not ok"). Everything else goes to the agent.
    const codeVerdict = flags.length ? "not ok" : "agent decides";
    const expectedOk = c.verdict === "ok";
    if (flags.length) { decided++; if (!expectedOk) correct++; }
    out.push(`| ${c.claim} | ${c.verdict} | ${top.e.id} ${top.s.toFixed(2)} | ${flags.join("; ") || "none"} | ${codeVerdict}${flags.length && expectedOk ? " ✗ false alarm" : ""} |`);
  }
  const agentLeft = testset.length - decided;
  console.log(`Flags fired on ${decided}/${testset.length} claims; ${correct} of those were truly not ok (${decided - correct} false alarms).`);
  console.log(`Left for the agent to judge: ${agentLeft} (of which ${testset.filter((c, i) => c.verdict !== "ok" && out[i].includes("agent decides")).length} are actually not ok: conditions, invented features).`);
  console.log("\n| Claim | Expected | Retrieved (bge) | Flags | Code |\n|---|---|---|---|---|\n" + out.join("\n"));
}
main();
