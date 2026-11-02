# Tool evaluation

One batch call for 35 claims took 525 ms (includes loading the model and indexing the register).
Response size: 11549 characters.
Approved by code (exact approved wording): 5, of which wrong: 0.
Expected entry among what the agent is shown (ok and agent_judges claims): 17/17.
Flags fired on 13 claims: 13 truly not ok, 0 false alarm(s).
Left to the agent: 17 claims, of which 7 are not ok and need the agent to catch them (conditions, invented features).

| Claim | Expected | Expected entry | Entries shown | Flags | Decision |
|---|---|---|---|---|---|
| Up to 30% faster checkout, based on Brightcart internal tests (2026). | ok | BC-001 | BC-001 |  | ok |
| Brightcart supports more than 40 payment methods across 25 countries. | ok | BC-004 | BC-004 |  | ok |
| Every Brightcart transaction is scored for fraud risk before it is authorised. | ok | BC-012 | BC-012 |  | ok |
| Brightcart's one-page checkout puts cart, delivery and payment on a single page, with no forced account creation. | ok | BC-013 | BC-013 |  | ok |
| Most merchants go live in under two weeks. | ok | BC-010 | BC-010 |  | ok |
| Checkout gets up to 30% faster with Brightcart, according to our internal testing. | ok | BC-001 | BC-001 |  | agent_judges |
| Shoppers pay on one page and never have to create an account. | ok | BC-013 | BC-013 |  | agent_judges |
| Card details never touch your storefront apps, because Brightcart hosts the payment fields. | ok | BC-011 | BC-011 |  | agent_judges |
| We assess the fraud risk of each payment before it is approved. | ok | BC-012 | BC-006, BC-012, BC-014 |  | agent_judges |
| One integration covers your checkout, payment methods and fraud scoring. | ok | BC-014 | BC-014 |  | agent_judges |
| Accept over 40 ways to pay in 25 markets. | ok | BC-004 | BC-004 |  | agent_judges |
| Brightcart holds PCI DSS Level 1 certification. | ok | BC-003 | BC-003 |  | agent_judges |
| More than 500 online brands trust Brightcart. | ok | BC-007 | BC-007 |  | agent_judges |
| Brightcart connects natively to Optimizely Commerce. | ok | BC-008 | BC-008 |  | agent_judges |
| On average, merchants convert 8% more checkouts after moving to Brightcart. | ok | BC-002 | BC-002 |  | agent_judges |
| Lift conversion by 8%. | fix | BC-002 | BC-002 |  | agent_judges |
| Brightcart increases checkout conversion by 15%. | fix | BC-002 | BC-002 | figure not in approved wording of BC-002: 15% | do_not_use |
| Make your checkout 50% faster. | fix | BC-001 | BC-001 | figure not in approved wording of BC-001: 50% | do_not_use |
| Over 1,000 brands trust Brightcart. | fix | BC-007 | BC-007 | figure not in approved wording of BC-007: 1000 | do_not_use |
| Brightcart supports 60 payment methods. | fix | BC-004 | BC-004 | figure not in approved wording of BC-004: 60 | do_not_use |
| Brightcart has 99.99% uptime. | fix | BC-005 | BC-002 | figure not in approved wording of BC-005: 99.99%; closest entry BC-005 is restricted: 99.99% is the Enterprise SLA only and may not be used in general marketing. | do_not_use |
| Go live with Brightcart in one day. | fix | BC-010 | BC-008 | closest entry BC-010 is restricted: 'One day' applies only to the Shopify plugin and must say so. | do_not_use |
| Brightcart checkout is 30% faster. | fix | BC-001 | BC-001 |  | agent_judges |
| Brightcart eliminates fraud. | blocked | BC-006 | BC-012 | absolute wording: eliminate | do_not_use |
| Fraud is a thing of the past with Brightcart. | blocked | BC-006 | BC-012 | absolute wording: thing of the past | do_not_use |
| Brightcart cuts cart abandonment in half. | blocked | BC-009 | BC-001 | closest entry BC-009 is banned: No numeric claim on abandonment is substantiated. | do_not_use |
| Halve your abandoned carts with Brightcart. | blocked | BC-009 | BC-008 | closest entry BC-009 is banned: No numeric claim on abandonment is substantiated. | do_not_use |
| The fastest checkout on the market. | blocked | BC-001 | BC-001 | banned term: fastest | do_not_use |
| Brightcart guarantees approval of every payment. | blocked | none | BC-004 | banned term: guarantee; absolute wording: every payment | do_not_use |
| Brightcart provides network token vaulting. | blocked | none | BC-006, BC-008, BC-004 |  | agent_judges |
| Smart routing retries soft declines automatically. | blocked | none | BC-008, BC-006, BC-001 |  | agent_judges |
| Brightcart integrates with 10 payment gateways. | blocked | none | BC-004 | figure not in approved wording of BC-004: 10 | do_not_use |
| Brightcart personalises checkout with AI. | blocked | none | BC-008, BC-004, BC-014 |  | agent_judges |
| Brightcart reduces chargebacks. | blocked | none | BC-001, BC-006, BC-014 |  | agent_judges |
| Dynamic fallbacks switch to local payment methods when a card is declined. | blocked | none | BC-014, BC-011, BC-004 |  | agent_judges |
