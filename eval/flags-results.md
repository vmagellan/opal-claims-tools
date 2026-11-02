Flags fired on 17/35 claims; 16 of those were truly not ok (1 false alarms).
Left for the agent to judge: 18 (of which 4 are actually not ok: conditions, invented features).

| Claim | Expected | Retrieved (bge) | Flags | Code |
|---|---|---|---|---|
| Up to 30% faster checkout, based on Brightcart internal tests (2026). | ok | BC-001 0.87 | none | agent decides |
| Brightcart supports more than 40 payment methods across 25 countries. | ok | BC-004 0.90 | none | agent decides |
| Every Brightcart transaction is scored for fraud risk before it is authorised. | ok | BC-012 0.88 | none | agent decides |
| Brightcart's one-page checkout puts cart, delivery and payment on a single page, with no forced account creation. | ok | BC-013 0.87 | none | agent decides |
| Most merchants go live in under two weeks. | ok | BC-010 0.77 | none | agent decides |
| Checkout gets up to 30% faster with Brightcart, according to our internal testing. | ok | BC-001 0.88 | none | agent decides |
| Shoppers pay on one page and never have to create an account. | ok | BC-013 0.64 | absolute: never | not ok ✗ false alarm |
| Card details never touch your storefront apps, because Brightcart hosts the payment fields. | ok | BC-011 0.86 | none | agent decides |
| We assess the fraud risk of each payment before it is approved. | ok | BC-012 0.69 | none | agent decides |
| One integration covers your checkout, payment methods and fraud scoring. | ok | BC-014 0.75 | none | agent decides |
| Accept over 40 ways to pay in 25 markets. | ok | BC-004 0.65 | none | agent decides |
| Brightcart holds PCI DSS Level 1 certification. | ok | BC-003 0.94 | none | agent decides |
| More than 500 online brands trust Brightcart. | ok | BC-007 0.91 | none | agent decides |
| Brightcart connects natively to Optimizely Commerce. | ok | BC-008 0.89 | none | agent decides |
| On average, merchants convert 8% more checkouts after moving to Brightcart. | ok | BC-002 0.87 | none | agent decides |
| Lift conversion by 8%. | fix | BC-002 0.66 | none | agent decides |
| Brightcart increases checkout conversion by 15%. | fix | BC-002 0.86 | figure not approved: 15% | not ok |
| Make your checkout 50% faster. | fix | BC-001 0.71 | figure not approved: 50% | not ok |
| Over 1,000 brands trust Brightcart. | fix | BC-007 0.87 | figure not approved: 1000 | not ok |
| Brightcart supports 60 payment methods. | fix | BC-004 0.85 | figure not approved: 60 | not ok |
| Brightcart has 99.99% uptime. | fix | BC-005 0.88 | figure not approved: 99.99%; entry BC-005 is restricted | not ok |
| Go live with Brightcart in one day. | fix | BC-010 0.75 | entry BC-010 is restricted | not ok |
| Brightcart checkout is 30% faster. | fix | BC-001 0.87 | none | agent decides |
| Brightcart eliminates fraud. | blocked | BC-006 0.93 | absolute: eliminate; entry BC-006 is banned | not ok |
| Fraud is a thing of the past with Brightcart. | blocked | BC-006 0.79 | absolute: thing of the past; entry BC-006 is banned | not ok |
| Brightcart cuts cart abandonment in half. | blocked | BC-009 0.82 | entry BC-009 is banned | not ok |
| Halve your abandoned carts with Brightcart. | blocked | BC-009 0.78 | entry BC-009 is banned | not ok |
| The fastest checkout on the market. | blocked | BC-001 0.67 | banned term: fastest | not ok |
| Brightcart guarantees approval of every payment. | blocked | BC-007 0.74 | banned term: guarantee; absolute: every payment | not ok |
| Brightcart provides network token vaulting. | blocked | BC-006 0.73 | entry BC-006 is banned | not ok |
| Smart routing retries soft declines automatically. | blocked | BC-009 0.54 | entry BC-009 is banned | not ok |
| Brightcart integrates with 10 payment gateways. | blocked | BC-004 0.80 | figure not approved: 10 | not ok |
| Brightcart personalises checkout with AI. | blocked | BC-014 0.75 | none | agent decides |
| Brightcart reduces chargebacks. | blocked | BC-006 0.82 | entry BC-006 is banned | not ok |
| Dynamic fallbacks switch to local payment methods when a card is declined. | blocked | BC-011 0.62 | none | agent decides |
