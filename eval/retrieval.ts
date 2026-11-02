// Offline evaluation of claim retrieval: which register entry does each method find for a draft claim?
// Run: npx tsx eval/retrieval.ts
import { writeFileSync } from "node:fs";
import { pipeline } from "@huggingface/transformers";
import register from "../src/data/claims-register.json";
import testset from "./testset.json";

type Case = (typeof testset)[number];
type Ranked = { id: string; score: number }[];
type Method = { name: string; rank: (claim: string) => Promise<Ranked> };

const entries = register.claims;
const docText = (e: (typeof entries)[number]) => `${e.claim}. ${e.approved_wording}`;

const STOPWORDS = new Set(["the", "a", "an", "by", "of", "to", "in", "on", "and", "is", "are", "with", "for", "our", "we", "your", "you", "it", "its", "brightcart", "that", "this", "more", "than", "up"]);
const tokenize = (t: string) =>
  t.toLowerCase().replace(/[^a-z0-9%.#\s]/g, " ").split(/\s+/).map((w) => w.replace(/\.$/, "")).filter((w) => w && !STOPWORDS.has(w));

// A. The tool today: share of the shorter text's words found in the other, best of entry claim vs approved wording.
function overlap(a: string, b: string) {
  const ta = new Set(tokenize(a));
  const tb = new Set(tokenize(b));
  if (!ta.size || !tb.size) return 0;
  let shared = 0;
  for (const t of ta) if (tb.has(t)) shared++;
  return shared / Math.min(ta.size, tb.size);
}
const lexical: Method = {
  name: "lexical overlap (current)",
  rank: async (claim) =>
    entries
      .map((e) => ({ id: e.id, score: Math.max(overlap(claim, e.claim), overlap(claim, e.approved_wording)) }))
      .sort((a, b) => b.score - a.score),
};

// B. TF-IDF cosine over entry claim + approved wording.
const docs = entries.map((e) => tokenize(docText(e)));
const df = new Map<string, number>();
for (const d of docs) for (const t of new Set(d)) df.set(t, (df.get(t) ?? 0) + 1);
const idf = (t: string) => Math.log((docs.length + 1) / ((df.get(t) ?? 0) + 1)) + 1;
function tfidf(tokens: string[]) {
  const v = new Map<string, number>();
  for (const t of tokens) v.set(t, (v.get(t) ?? 0) + idf(t));
  const norm = Math.sqrt([...v.values()].reduce((s, x) => s + x * x, 0)) || 1;
  for (const [k, x] of v) v.set(k, x / norm);
  return v;
}
const docVecs = docs.map(tfidf);
const tfidfMethod: Method = {
  name: "TF-IDF cosine",
  rank: async (claim) => {
    const q = tfidf(tokenize(claim));
    return entries
      .map((e, i) => {
        let s = 0;
        for (const [k, x] of q) s += x * (docVecs[i].get(k) ?? 0);
        return { id: e.id, score: s };
      })
      .sort((a, b) => b.score - a.score);
  },
};

// C. Sentence embeddings, cosine similarity (local model, no API key).
async function embeddingMethod(model: string, name: string): Promise<Method> {
  const embed = await pipeline("feature-extraction", model);
  const vec = async (t: string) => Array.from((await embed(t, { pooling: "mean", normalize: true })).data as Float32Array);
  const entryVecs = await Promise.all(entries.map((e) => vec(docText(e))));
  return {
    name,
    rank: async (claim) => {
      const q = await vec(claim);
      return entries
        .map((e, i) => ({ id: e.id, score: q.reduce((s, x, j) => s + x * entryVecs[i][j], 0) }))
        .sort((a, b) => b.score - a.score);
    },
  };
}

function bestThreshold(matched: number[], unmatched: number[]) {
  // Threshold that best separates "has a register entry" from "invented", and its accuracy.
  const all = [...matched, ...unmatched].sort((a, b) => a - b);
  let best = { t: 0, acc: 0 };
  for (const t of all) {
    const acc = (matched.filter((s) => s >= t).length + unmatched.filter((s) => s < t).length) / all.length;
    if (acc > best.acc) best = { t, acc };
  }
  return best;
}

async function evaluate(method: Method, cases: Case[]) {
  const rows = [];
  for (const c of cases) rows.push({ c, ranked: await method.rank(c.claim) });
  const withEntry = rows.filter((r) => r.c.entry);
  const top1 = withEntry.filter((r) => r.ranked[0].id === r.c.entry).length;
  const top3 = withEntry.filter((r) => r.ranked.slice(0, 3).some((x) => x.id === r.c.entry)).length;
  const matchedScores = withEntry.map((r) => r.ranked.find((x) => x.id === r.c.entry)!.score);
  const inventedScores = rows.filter((r) => !r.c.entry).map((r) => r.ranked[0].score);
  return { method: method.name, rows, top1, top3, n: withEntry.length, threshold: bestThreshold(matchedScores, inventedScores) };
}

async function main() {
  const methods = [
    lexical,
    tfidfMethod,
    await embeddingMethod("Xenova/all-MiniLM-L6-v2", "embeddings: all-MiniLM-L6-v2"),
    await embeddingMethod("Xenova/bge-small-en-v1.5", "embeddings: bge-small-en-v1.5"),
  ];
  const results = [];
  for (const m of methods) results.push(await evaluate(m, testset));

  const pct = (a: number, b: number) => `${Math.round((100 * a) / b)}%`;
  let md = "# Retrieval evaluation\n\n";
  md += `${testset.length} labelled claims (${testset.filter((c) => c.entry).length} with a register entry, ${testset.filter((c) => !c.entry).length} invented or unmatched). Register: ${entries.length} entries.\n\n`;
  md += "| Method | Top-1 correct entry | Correct entry in top 3 | Best match/no-match threshold | Accuracy at that threshold |\n|---|---|---|---|---|\n";
  for (const r of results) md += `| ${r.method} | ${r.top1}/${r.n} (${pct(r.top1, r.n)}) | ${r.top3}/${r.n} (${pct(r.top3, r.n)}) | ${r.threshold.t.toFixed(2)} | ${pct(r.threshold.acc * 100, 100)} |\n`;

  md += "\n## Per claim: top-1 entry and score by method\n\n| Claim | Kind | Expected | " + results.map((r) => r.method).join(" | ") + " |\n|---|---|---|" + results.map(() => "---").join("|") + "|\n";
  testset.forEach((c, i) => {
    const cells = results.map((r) => {
      const top = r.rows[i].ranked[0];
      const mark = c.entry ? (top.id === c.entry ? "✓" : "✗") : "";
      return `${top.id} ${top.score.toFixed(2)} ${mark}`;
    });
    md += `| ${c.claim} | ${c.kind} | ${c.entry ?? "none"} | ${cells.join(" | ")} |\n`;
  });
  writeFileSync(new URL("./results.md", import.meta.url), md);
  console.log(md.split("\n## Per claim")[0]);
}

main();
