# AI Capability Map

| Capability | Intent (user) | Inputs (this sprint) | Risk 1–5 (tag) | p95 ms | Est. cost/action | Fallback | Selected |
|---|---|---|---|---:|---:|---|:---:|
| Personalized product recommendations | Discover relevant products quickly | SKU catalog, limited session data | 4 (data sparsity/limited session data) | 300 | $0.08 | Default “bestsellers” widget |   |
| AI Commerce Assistant | Get answers to FAQs and order status | FAQ markdown, order-status API | 2 (hallucination) | 1200 | $0.09 | Escalate to human agent | [x] |
| Fraud detection & prevention | Ensure transactions are safe | Transaction logs (not provided) | 5 (sensitive data) | 1000 | $0.08 | Manual review rules |   |
| Predictive inventory management | Avoid stockouts | Inventory history (not provided) | 5 (missing data) | 2000 | $0.14 | Static reorder thresholds |   |
| Dynamic pricing & revenue optimization | See competitive pricing | SKU prices, demand history (not provided) | 4 (sensitivity) | 1500 | $0.09 | Fixed pricing rules |   |
| Customer retention & LTV prediction | Identify at-risk customers | Customer history (not provided) | 4 (heavy data requirements) | 1800 | $0.12 | Manual retention campaigns such as discounts |   |
| AI-powered search typeahead | Get relevant product suggestions while typing | SKU catalog, past queries | 3 (latency risk) | 300 | $0.05 | Default keyword autocomplete | [x] |

---

### Why these two
We selected **AI Commerce Assistant** and **AI-powered Search Typeahead** because they both directly support ShopLite’s KPIs and are feasible to integrate with the given defaults. The assistant reduces support tickets by handling FAQs and order-status queries, lowering contact rates and improving satisfaction. The AI-powered typeahead enhances product discovery during search, improving conversion rates by surfacing relevant items faster. Both touchpoints align with the traffic, cache, and latency defaults, and have clear fallback options (human agents for support, basic autocomplete for search), making them practical and impactful near-term implementations.


