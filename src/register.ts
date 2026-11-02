import register from "./data/claims-register.json";

type Entry = (typeof register.claims)[number];

const STOPWORDS = new Set(["the", "a", "an", "by", "of", "to", "in", "on", "and", "is", "are", "with", "for", "our", "we", "your", "you", "it", "its", "brightcart", "that", "this", "more", "than", "up"]);

// Approved entries need this much overlap to count as the same claim; below it, a match only means "related".
const MATCH = 0.75;
const RELATED = 0.5;

function normalise(claim: string): string {
  return claim
    .trim()
    .replace(/^[-*•\s]+/, "")
    .replace(/[:;,.\s]+$/, "")
    .replace(/^["'“”]+|["'“”]+$/g, "");
}

function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9%.#\s]/g, " ")
      .split(/\s+/)
      .map((t) => t.replace(/\.$/, ""))
      .filter((t) => t && !STOPWORDS.has(t)),
  );
}

function overlap(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  if (!ta.size || !tb.size) return 0;
  let shared = 0;
  for (const t of ta) if (tb.has(t)) shared++;
  return shared / Math.min(ta.size, tb.size);
}

function numbers(text: string): string[] {
  return text.match(/\d+(?:\.\d+)?%?/g) ?? [];
}

function score(claim: string, entry: Entry): number {
  return Math.round(Math.max(overlap(claim, entry.claim), overlap(claim, entry.approved_wording)) * 100) / 100;
}

export function checkClaim(raw: string) {
  const claim = normalise(raw);
  const lower = claim.toLowerCase();
  const bannedTermsFound = register.banned_terms.filter((term) => lower.includes(term));

  const ranked = register.claims
    .map((entry) => ({ entry, match_score: score(claim, entry) }))
    .filter((m) => m.match_score >= RELATED)
    .sort((a, b) => b.match_score - a.match_score);
  const best = ranked[0];

  let status: string;
  let reason: string;
  if (bannedTermsFound.length) {
    status = "banned";
    reason = `Contains banned term(s): ${bannedTermsFound.join(", ")}.`;
  } else if (!best) {
    status = "not_found";
    reason = "No register entry covers this claim. It is unsubstantiated and cannot be used.";
  } else if (best.entry.status !== "approved") {
    status = best.entry.status;
    reason = best.entry.conditions;
  } else if (best.match_score < MATCH) {
    status = "needs_rewording";
    reason = `Only partly covered by ${best.entry.id}. Use its approved wording instead.`;
  } else {
    const allowed = numbers(best.entry.approved_wording);
    const unapproved = numbers(claim).filter((n) => !allowed.includes(n));
    if (unapproved.length) {
      status = "needs_rewording";
      reason = `Figure(s) ${unapproved.join(", ")} are not in the approved wording of ${best.entry.id}.`;
    } else {
      status = "approved";
      reason = best.entry.conditions;
    }
  }

  return {
    claim,
    status,
    reason,
    register_id: best?.entry.id ?? null,
    approved_wording: best?.entry.approved_wording ?? null,
    match_score: best?.match_score ?? 0,
    banned_terms_found: bannedTermsFound,
  };
}

export function checkClaims(claims: string[] | string) {
  const list = (Array.isArray(claims) ? claims : String(claims).split(/\n+/)).map(normalise).filter(Boolean);
  const results = [...new Set(list)].map(checkClaim);
  return {
    company: register.company,
    checked: results.length,
    all_approved: results.every((r) => r.status === "approved"),
    results,
    guidance:
      "Use a claim only if its status is approved. For needs_rewording, restricted or banned, replace it with approved_wording verbatim. For not_found, remove it.",
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
