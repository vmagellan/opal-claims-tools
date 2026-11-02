import register from "./data/claims-register.json";

const STOPWORDS = new Set(["the", "a", "an", "by", "of", "to", "in", "on", "and", "is", "are", "with", "for", "our", "we", "your", "it", "its", "brightcart"]);

function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9%.#\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t && !STOPWORDS.has(t)),
  );
}

function similarity(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  if (!ta.size || !tb.size) return 0;
  let shared = 0;
  for (const t of ta) if (tb.has(t)) shared++;
  return shared / Math.min(ta.size, tb.size);
}

export function checkClaim(claim: string) {
  const lower = claim.toLowerCase();
  const bannedTermsFound = register.banned_terms.filter((term) => lower.includes(term));

  const matches = register.claims
    .map((entry) => ({ ...entry, match_score: Math.round(similarity(claim, entry.claim) * 100) / 100 }))
    .filter((m) => m.match_score >= 0.4)
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 2);

  return {
    company: register.company,
    claim,
    status: matches.length ? matches[0].status : "not_found",
    banned_terms_found: bannedTermsFound,
    matches,
    guidance: matches.length
      ? "Use approved_wording verbatim when rewriting. Respect conditions."
      : "No register entry covers this claim. Treat it as unsubstantiated unless it is a public fact with external evidence.",
  };
}
