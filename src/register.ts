import register from "./data/claims-register.json";
import { cosine, embed } from "./embeddings";

type Entry = (typeof register.claims)[number];

// Retrieval finds the closest register entries by meaning; the agent judges whether the draft says the same thing.
// Flags are the part code can decide on its own, and the agent may never override them.
const TOP_K = 3;
// A claim this close to an entry's approved wording is using that wording, so the entry's status does not count against it.
const USES_APPROVED_WORDING = 0.9;
// A restricted or banned entry only flags the claim when it is clearly closer than the best approved entry.
const CLEARLY_CLOSER = 0.05;
const ABSOLUTES = ["eliminate", "impossible", "zero", "100%", "every payment", "all fraud", "thing of the past", "completely", "entirely"];

let index: Promise<{ entry: Entry; topic: number[]; wording: number[] }[]> | undefined;

function buildIndex() {
  index ??= (async () => {
    const vectors = await embed(register.claims.flatMap((e) => [e.claim, e.approved_wording]));
    return register.claims.map((entry, i) => ({ entry, topic: vectors[2 * i], wording: vectors[2 * i + 1] }));
  })();
  return index;
}

function normalise(claim: string): string {
  return claim
    .trim()
    .replace(/^[-*•\s]+/, "")
    .replace(/[:;,.\s]+$/, "")
    .replace(/^["'“”]+|["'“”]+$/g, "");
}

function figures(text: string): string[] {
  return (text.match(/\d[\d,]*(?:\.\d+)?%?/g) ?? []).map((n) => n.replace(/,/g, ""));
}

const round = (n: number) => Math.round(n * 100) / 100;

export async function checkClaims(claims: string[] | string) {
  const list = [...new Set((Array.isArray(claims) ? claims : String(claims).split(/\n+/)).map(normalise).filter(Boolean))];
  const entries = await buildIndex();
  const vectors = list.length ? await embed(list) : [];

  const results = list.map((claim, i) => {
    const ranked = entries
      .map(({ entry, topic, wording }) => ({ entry, toWording: cosine(vectors[i], wording), similarity: Math.max(cosine(vectors[i], topic), cosine(vectors[i], wording)) }))
      .sort((a, b) => b.similarity - a.similarity);
    const top = ranked[0];
    const lower = claim.toLowerCase();
    const approved = top.entry.approved_wording.toLowerCase();

    const flags: string[] = [];
    const banned = register.banned_terms.filter((t) => lower.includes(t));
    if (banned.length) flags.push(`banned term: ${banned.join(", ")}`);
    const absolutes = ABSOLUTES.filter((t) => lower.includes(t) && !approved.includes(t));
    if (absolutes.length) flags.push(`absolute wording: ${absolutes.join(", ")}`);
    const extraFigures = figures(claim).filter((n) => !figures(top.entry.approved_wording).includes(n));
    if (extraFigures.length) flags.push(`figure not in approved wording of ${top.entry.id}: ${extraFigures.join(", ")}`);
    const bestApproved = ranked.find((r) => r.entry.status === "approved");
    if (
      top.entry.status !== "approved" &&
      top.toWording < USES_APPROVED_WORDING &&
      top.similarity - (bestApproved?.similarity ?? 0) >= CLEARLY_CLOSER
    )
      flags.push(`closest entry ${top.entry.id} is ${top.entry.status}: ${top.entry.conditions}`);

    return {
      claim,
      flags,
      decision: flags.length ? "do_not_use" : "agent_judges",
      candidates: ranked.slice(0, TOP_K).map((r) => ({
        register_id: r.entry.id,
        status: r.entry.status,
        approved_wording: r.entry.approved_wording,
        conditions: r.entry.conditions,
        similarity: round(r.similarity),
      })),
    };
  });

  return {
    company: register.company,
    checked: results.length,
    flagged: results.filter((r) => r.flags.length).length,
    results,
    guidance:
      "decision do_not_use: the claim must not appear as written; replace it with a candidate's approved_wording or remove it. decision agent_judges: keep the claim only if it says the same thing as one candidate's approved_wording, adds nothing to it, and meets that candidate's conditions; otherwise replace or remove it. Similarity only says which entries are related, never that a claim is approved.",
  };
}

export function listApprovedClaims() {
  return {
    company: register.company,
    description: register.description,
    usable_claims: register.claims
      .filter((c) => c.status !== "banned")
      .map((c) => ({ id: c.id, topic: c.claim, approved_wording: c.approved_wording, status: c.status, conditions: c.conditions })),
    never_claim: register.claims
      .filter((c) => c.status === "banned")
      .map((c) => ({ id: c.id, topic: c.claim, conditions: c.conditions })),
    banned_terms: register.banned_terms,
    guidance:
      "Build product messaging only from usable_claims, quoting approved_wording exactly. Anything not listed here is unsubstantiated and cannot be claimed.",
  };
}
