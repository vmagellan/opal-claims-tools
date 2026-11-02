# opal-claims-tools

A custom tool for Optimizely Opal (Optimizely Agent Platform) that checks marketing claims against a company's legal-approved claims register.

It is part of **Newsdesk**, an Opal workflow that turns weekly market news into campaign drafts and routes every claim through a verification gate before a human approves it. The fictional client is Brightcart, a checkout and payments SaaS.

## Why a custom tool

No built-in Opal tool can see a company's claims register. It is private data owned by Legal. Without this tool, an agent would decide "is this claim approved?" from model knowledge. With it, the verdict is a deterministic lookup that cites a register entry ID and returns the legally approved wording to use instead.

## Tools

### `list_approved_claims`

No input. Returns everything Brightcart may say about itself: each usable claim with its exact `approved_wording`, `status` and `conditions`, the topics that may never be claimed, and the banned terms. Agents call it **before** writing, so copy starts from approved claims instead of invented features.

### `check_claims_register`

| | |
|---|---|
| Input | `claims` (array of strings, required): every distinct Brightcart claim in the draft, one sentence each |
| Output | per claim: `status` (`approved`, `needs_rewording`, `restricted`, `banned`, `not_found`), `register_id`, `approved_wording`, `reason`, `match_score`, `banned_terms_found`; plus `all_approved` for the batch |

A claim is only `approved` when it closely matches an approved entry **and** every figure in it appears in the approved wording. "Brightcart increases checkout conversion by 15%" returns `needs_rewording`, because BC-002 only allows "an average 8% lift". Partial matches also return `needs_rewording` with the wording to use instead.

Example:

```bash
curl -X POST https://<host>/tools/check-claims-register \
  -H "Authorization: Bearer $TOOLS_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"parameters": {"claims": ["Brightcart guarantees zero fraud", "Brightcart has 99.99% uptime."]}}'
```

returns `banned` (BC-006, banned term "guarantee") and `restricted` (BC-005: 99.99% is the Enterprise SLA only), each with its approved wording.

Batching matters: inside an Opal workflow, tool calls run one after another, so checking 20 claims one by one took minutes in testing. One call checks them all.

## How it works

- Built with the official [`@optimizely-opal/opal-tools-sdk`](https://www.npmjs.com/package/@optimizely-opal/opal-tools-sdk) on Express. The SDK generates `GET /discovery` and `POST /tools/check-claims-register`.
- Both tools read [`src/data/claims-register.json`](src/data/claims-register.json): fourteen entries (ten product claims and four approved messaging statements) plus a banned-terms list. In a real deployment the lookup in [`src/register.ts`](src/register.ts) would read the customer's own system (Airtable, SharePoint, a claims database) and nothing in the Opal agents would change.
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
