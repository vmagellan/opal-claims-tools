import express from "express";
import { z } from "zod/v4";
import { ToolsService, registerTool } from "@optimizely-opal/opal-tools-sdk";
import { checkClaim } from "./register";

const app = express();
app.use(express.json());

new ToolsService(
  app,
  process.env.TOOLS_BEARER_TOKEN
    ? { authMode: "static_token", bearerToken: process.env.TOOLS_BEARER_TOKEN }
    : undefined,
);

registerTool(
  "check_claims_register",
  {
    description:
      "Checks ONE marketing claim about Brightcart (our own product, pricing, performance, security or customers) against the company's legal-approved claims register. Returns whether the claim is approved, restricted, banned or not_found, the approved wording to use instead, any conditions, and banned terms found. Use this for every claim Brightcart makes about itself. Do not use it for general industry facts or news; those are checked against their source page.",
    inputSchema: {
      claim: z.string().describe("A single claim, as one sentence, exactly as it appears in the draft copy."),
    },
  },
  async ({ claim }) => checkClaim(claim),
);

app.get("/", (_req, res) => {
  res.json({ service: "opal-claims-tools", discovery: "/discovery" });
});

if (!process.env.VERCEL) {
  const port = Number(process.env.PORT) || 8000;
  app.listen(port, () => console.log(`opal-claims-tools on http://localhost:${port}`));
}

export default app;
