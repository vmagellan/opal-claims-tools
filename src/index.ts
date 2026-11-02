import express from "express";
import { z } from "zod/v4";
import { ToolsService, registerTool } from "@optimizely-opal/opal-tools-sdk";
import { checkClaims, listApprovedClaims } from "./register";

const app = express();
app.use(express.json());

new ToolsService(
  app,
  process.env.TOOLS_BEARER_TOKEN
    ? { authMode: "static_token", bearerToken: process.env.TOOLS_BEARER_TOKEN }
    : undefined,
);

registerTool(
  "list_approved_claims",
  {
    description:
      "Returns everything Brightcart is allowed to say about itself, from the company's legal-approved claims register: each usable claim with its exact approved wording and conditions, the topics that may never be claimed, and banned terms. Call this BEFORE planning or writing any Brightcart copy, and build product messaging only from it.",
    inputSchema: {},
  },
  async () => listApprovedClaims(),
);

registerTool(
  "check_claims_register",
  {
    description:
      "Checks a list of claims Brightcart makes about itself (product, performance, security, fraud, uptime, customers, integrations, setup time) against the legal-approved claims register, in one call. For each claim it retrieves the 3 most similar register entries by meaning (approved wording, status, conditions, similarity) and raises hard flags code can verify: banned terms, absolute wording, figures not in the approved wording, and restricted or banned entries. A flagged claim must not be used as written. For an unflagged claim, you judge whether it says the same thing as a candidate's approved wording and meets its conditions. Send every distinct claim, including headlines, in a single call. Do not use it for news or market facts.",
    inputSchema: {
      claims: z
        .array(z.string())
        .describe("Every distinct Brightcart claim in the draft, one full sentence or headline each, exactly as written."),
    },
  },
  async ({ claims }) => checkClaims(claims),
);

app.get("/", (_req, res) => {
  res.json({ service: "opal-claims-tools", discovery: "/discovery" });
});

if (!process.env.VERCEL) {
  const port = Number(process.env.PORT) || 8000;
  app.listen(port, () => console.log(`opal-claims-tools on http://localhost:${port}`));
}

export default app;
