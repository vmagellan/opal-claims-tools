# Retrieval evaluation

35 labelled claims (28 with a register entry, 7 invented or unmatched). Register: 14 entries.

| Method | Top-1 correct entry | Correct entry in top 3 | Best match/no-match threshold | Accuracy at that threshold |
|---|---|---|---|---|
| lexical overlap (current) | 26/28 (93%) | 27/28 (96%) | 0.29 | 86% |
| TF-IDF cosine | 26/28 (93%) | 27/28 (96%) | 0.21 | 89% |
| embeddings: all-MiniLM-L6-v2 | 28/28 (100%) | 28/28 (100%) | 0.45 | 86% |
| embeddings: bge-small-en-v1.5 | 28/28 (100%) | 28/28 (100%) | 0.64 | 86% |

## Per claim: top-1 entry and score by method

| Claim | Kind | Expected | lexical overlap (current) | TF-IDF cosine | embeddings: all-MiniLM-L6-v2 | embeddings: bge-small-en-v1.5 |
|---|---|---|---|---|---|---|
| Up to 30% faster checkout, based on Brightcart internal tests (2026). | exact | BC-001 | BC-001 1.00 ✓ | BC-001 0.87 ✓ | BC-001 0.86 ✓ | BC-001 0.87 ✓ |
| Brightcart supports more than 40 payment methods across 25 countries. | exact | BC-004 | BC-004 1.00 ✓ | BC-004 0.95 ✓ | BC-004 0.96 ✓ | BC-004 0.90 ✓ |
| Every Brightcart transaction is scored for fraud risk before it is authorised. | exact | BC-012 | BC-012 1.00 ✓ | BC-012 0.96 ✓ | BC-012 0.97 ✓ | BC-012 0.88 ✓ |
| Brightcart's one-page checkout puts cart, delivery and payment on a single page, with no forced account creation. | exact | BC-013 | BC-013 1.00 ✓ | BC-013 0.88 ✓ | BC-013 0.93 ✓ | BC-013 0.87 ✓ |
| Most merchants go live in under two weeks. | exact | BC-010 | BC-010 1.00 ✓ | BC-010 0.81 ✓ | BC-010 0.71 ✓ | BC-010 0.77 ✓ |
| Checkout gets up to 30% faster with Brightcart, according to our internal testing. | paraphrase | BC-001 | BC-001 0.57 ✓ | BC-001 0.48 ✓ | BC-001 0.90 ✓ | BC-001 0.88 ✓ |
| Shoppers pay on one page and never have to create an account. | paraphrase | BC-013 | BC-013 0.38 ✓ | BC-013 0.27 ✓ | BC-013 0.48 ✓ | BC-013 0.64 ✓ |
| Card details never touch your storefront apps, because Brightcart hosts the payment fields. | paraphrase | BC-011 | BC-011 0.70 ✓ | BC-011 0.62 ✓ | BC-011 0.87 ✓ | BC-011 0.86 ✓ |
| We assess the fraud risk of each payment before it is approved. | paraphrase | BC-012 | BC-006 0.50 ✗ | BC-012 0.31 ✓ | BC-012 0.51 ✓ | BC-012 0.69 ✓ |
| One integration covers your checkout, payment methods and fraud scoring. | paraphrase | BC-014 | BC-014 0.75 ✓ | BC-014 0.54 ✓ | BC-014 0.59 ✓ | BC-014 0.75 ✓ |
| Accept over 40 ways to pay in 25 markets. | paraphrase | BC-004 | BC-004 0.29 ✓ | BC-004 0.24 ✓ | BC-004 0.51 ✓ | BC-004 0.65 ✓ |
| Brightcart holds PCI DSS Level 1 certification. | paraphrase | BC-003 | BC-003 0.80 ✓ | BC-003 0.65 ✓ | BC-003 0.90 ✓ | BC-003 0.94 ✓ |
| More than 500 online brands trust Brightcart. | paraphrase | BC-007 | BC-007 0.67 ✓ | BC-007 0.48 ✓ | BC-007 0.86 ✓ | BC-007 0.91 ✓ |
| Brightcart connects natively to Optimizely Commerce. | paraphrase | BC-008 | BC-008 0.67 ✓ | BC-008 0.49 ✓ | BC-008 0.92 ✓ | BC-008 0.89 ✓ |
| On average, merchants convert 8% more checkouts after moving to Brightcart. | paraphrase | BC-002 | BC-002 0.57 ✓ | BC-002 0.36 ✓ | BC-002 0.85 ✓ | BC-002 0.87 ✓ |
| Lift conversion by 8%. | condition | BC-002 | BC-002 1.00 ✓ | BC-002 0.64 ✓ | BC-002 0.45 ✓ | BC-002 0.66 ✓ |
| Brightcart increases checkout conversion by 15%. | wrong_figure | BC-002 | BC-002 0.67 ✓ | BC-002 0.47 ✓ | BC-002 0.88 ✓ | BC-002 0.86 ✓ |
| Make your checkout 50% faster. | wrong_figure | BC-001 | BC-001 0.50 ✓ | BC-001 0.24 ✓ | BC-001 0.53 ✓ | BC-001 0.71 ✓ |
| Over 1,000 brands trust Brightcart. | wrong_figure | BC-007 | BC-007 0.33 ✓ | BC-007 0.21 ✓ | BC-007 0.85 ✓ | BC-007 0.87 ✓ |
| Brightcart supports 60 payment methods. | wrong_figure | BC-004 | BC-004 0.75 ✓ | BC-004 0.58 ✓ | BC-004 0.87 ✓ | BC-004 0.85 ✓ |
| Brightcart has 99.99% uptime. | restricted | BC-005 | BC-005 1.00 ✓ | BC-005 0.70 ✓ | BC-005 0.89 ✓ | BC-005 0.88 ✓ |
| Go live with Brightcart in one day. | restricted | BC-010 | BC-010 0.50 ✓ | BC-010 0.59 ✓ | BC-010 0.58 ✓ | BC-010 0.75 ✓ |
| Brightcart checkout is 30% faster. | condition | BC-001 | BC-001 1.00 ✓ | BC-001 0.69 ✓ | BC-001 0.85 ✓ | BC-001 0.87 ✓ |
| Brightcart eliminates fraud. | banned | BC-006 | BC-006 1.00 ✓ | BC-006 0.47 ✓ | BC-006 0.92 ✓ | BC-006 0.93 ✓ |
| Fraud is a thing of the past with Brightcart. | banned_paraphrase | BC-006 | BC-006 0.50 ✓ | BC-012 0.18 ✗ | BC-006 0.79 ✓ | BC-006 0.79 ✓ |
| Brightcart cuts cart abandonment in half. | banned | BC-009 | BC-009 1.00 ✓ | BC-009 0.78 ✓ | BC-009 0.87 ✓ | BC-009 0.82 ✓ |
| Halve your abandoned carts with Brightcart. | banned_paraphrase | BC-009 | BC-001 0.00 ✗ | BC-001 0.00 ✗ | BC-009 0.68 ✓ | BC-009 0.78 ✓ |
| The fastest checkout on the market. | banned_term | BC-001 | BC-001 0.33 ✓ | BC-001 0.12 ✓ | BC-001 0.45 ✓ | BC-001 0.67 ✓ |
| Brightcart guarantees approval of every payment. | banned_term | none | BC-004 0.25  | BC-012 0.21  | BC-014 0.66  | BC-007 0.74  |
| Brightcart provides network token vaulting. | invented | none | BC-001 0.00  | BC-001 0.00  | BC-014 0.55  | BC-006 0.73  |
| Smart routing retries soft declines automatically. | invented | none | BC-001 0.00  | BC-001 0.00  | BC-009 0.35  | BC-009 0.54  |
| Brightcart integrates with 10 payment gateways. | invented | none | BC-008 0.33  | BC-008 0.14  | BC-014 0.80  | BC-004 0.80  |
| Brightcart personalises checkout with AI. | invented | none | BC-001 0.33  | BC-001 0.12  | BC-008 0.66  | BC-014 0.75  |
| Brightcart reduces chargebacks. | invented | none | BC-001 0.50  | BC-001 0.18  | BC-006 0.70  | BC-006 0.82  |
| Dynamic fallbacks switch to local payment methods when a card is declined. | invented | none | BC-004 0.50  | BC-004 0.18  | BC-011 0.35  | BC-011 0.62  |
