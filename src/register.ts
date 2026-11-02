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

const sameText = (a: string, b: string) => normalise(a).toLowerCase() === normalise(b).toLowerCase();

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

    const exact = register.claims.find((e) => sameText(claim, e.approved_wording));
    if (exact && !flags.length) return { claim, decision: "ok", register_id: exact.id };

    if (flags.length) {
      const replacement = ranked.slice(0, TOP_K).find((r) => r.entry.status === "approved") ?? ranked.find((r) => r.toWording >= USES_APPROVED_WORDING);
      return {
        claim,
        decision: "do_not_use",
        flags,
        use_instead: replacement ? { register_id: replacement.entry.id, approved_wording: replacement.entry.approved_wording } : null,
      };
    }

    // Only one candidate when it clearly stands out; otherwise the agent compares up to three.
    const shown = ranked[0].similarity - ranked[1].similarity >= CLEARLY_CLOSER ? ranked.slice(0, 1) : ranked.slice(0, TOP_K);
    return {
      claim,
      decision: "agent_judges",
      candidates: shown.map((r) => ({
        register_id: r.entry.id,
        approved_wording: r.entry.approved_wording,
        ...(r.entry.status !== "approved" && { status: r.entry.status }),
        ...(r.entry.conditions !== "None." && { conditions: r.entry.conditions }),
      })),
    };
  });

  const count = (d: string) => results.filter((r) => r.decision === d).length;
  return {
    checked: results.length,
    ok: count("ok"),
    do_not_use: count("do_not_use"),
    agent_judges: count("agent_judges"),
    results,
    guidance:
      "ok: exact approved wording, keep it. do_not_use: never use as written; use use_instead or remove it. agent_judges: keep only if it says the same as a candidate's approved_wording, adds nothing and meets its conditions; otherwise replace or remove.",
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
