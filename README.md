# opal-claims-tools

A custom tool for Optimizely Opal (Optimizely Agent Platform) that checks marketing claims against a company's legal-approved claims register.

It is part of **Newsdesk**, an Opal workflow that turns weekly market news into campaign drafts and routes every claim through a verification gate before a human approves it. The fictional client is Brightcart, a checkout and payments SaaS.

## Why a custom tool

No built-in Opal tool can see a company's claims register. It is private data owned by Legal. Without this tool, an agent would decide "is this claim approved?" from model knowledge. With it, the verdict is a deterministic lookup that cites a register entry ID and returns the legally approved wording to use instead.

## Tool

`check_claims_register`

| | |
|---|---|
| Input | `claim` (string, required): one claim, as one sentence, exactly as it appears in the draft |
| Output | `status` (`approved`, `restricted`, `banned`, `not_found`), `banned_terms_found`, `matches` (register entries with `id`, `approved_wording`, `conditions`, `evidence`, `match_score`), `guidance` |

Example:

```bash
curl -X POST https://<host>/tools/check-claims-register \
  -H "Authorization: Bearer $TOOLS_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"parameters": {"claim": "Brightcart guarantees zero fraud"}}'
```

returns `status: "banned"`, `banned_terms_found: ["guaranteed", "guarantee"]`, and entry BC-006 with its approved wording: "Brightcart helps reduce fraudulent transactions with built-in risk scoring."

## How it works

- Built with the official [`@optimizely-opal/opal-tools-sdk`](https://www.npmjs.com/package/@optimizely-opal/opal-tools-sdk) on Express. The SDK generates `GET /discovery` and `POST /tools/check-claims-register`.
- The register is [`src/data/claims-register.json`](src/data/claims-register.json): ten entries plus a banned-terms list. In a real deployment the lookup in [`src/register.ts`](src/register.ts) would read the customer's own system (Airtable, SharePoint, a claims database) and nothing in the Opal agents would change.
- Matching is keyword overlap with a threshold, plus a banned-term scan. It is deliberately simple and deterministic: the same claim always gets the same verdict.
- `/tools/*` requires a bearer token (`TOOLS_BEARER_TOKEN`) via the SDK's `static_token` auth mode. `/discovery` stays public so Opal can register the tool.

## Run locally

```bash
npm install
cp .env.example .env.local   # set TOOLS_BEARER_TOKEN
npm run dev                  # http://localhost:8000/discovery
ngrok http 8000              # optional: expose it to Opal for testing
```

## Deploy

Deployed on Vercel as a single Express function. Set `TOOLS_BEARER_TOKEN` in the project's environment variables, then register `https://<deployment>/discovery` in Opal under Tool Registry, with the same token as the bearer token.
