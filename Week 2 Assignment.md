# Week 2 - AI First Mindset - Assignment

> Spine: ShopLite. Goal: pick **two** near-term AI touchpoints that actually move the needle, prove feasibility, set latency and cost targets, and update the RFC accordingly.

---

## Deliverables and exact paths

Work individually (solo). If any of the paths below don’t exist in your repo, create them as part of this homework.

Create these files. Keep paths exact.

```text
/docs/ai-first/
  ai-capability-map.md
  touchpoints.md
  cost-model.md
```

Also update:

* `/docs/rfc.md` add a short section `## AI Touchpoints` that links to `/docs/ai-first/ai-capability-map.md`. Keep RFC ≤1 page by linking out.

## Defaults you may use (override if justified)

To make estimates concrete, you may use these defaults (you can override with a short rationale):

* ShopLite baseline: ~10k SKUs, ~20k sessions/day; a Policies/FAQ markdown exists; `order-status` API by id exists.
* p95 latency targets: Typeahead ≤ 300 ms; Support assistant ≤ 1200 ms.
* Model/pricing examples (choose one or propose another with prices):
  * GPT-4o-mini: $0.15/1K prompt tokens, $0.60/1K completion tokens
  * Llama 3.1 8B Instruct via OpenRouter: $0.05/1K prompt, $0.20/1K completion
* Traffic & cache assumptions:
  * Support assistant: 1,000 requests/day, 30% cache hit
  * Typeahead: 50,000 requests/day, 70% cache hit

---

## What to build

### 1) AI Capability Map

File: `/docs/ai-first/ai-capability-map.md`

* List **≥4** candidate AI capabilities.
* Mark **exactly 2** as **Selected**.
* For each row, include only these fields:

```markdown
| Capability | Intent (user) | Inputs (this sprint) | Risk 1–5 (tag) | p95 ms | Est. cost/action | Fallback | Selected |
|---|---|---|---|---:|---:|---|:---:|
```

* Add a short **Why these two** paragraph (3–5 sentences). Tie to KPIs (conversion, support contact rate) and low integration risk.

---

### 2) Touchpoint Specs

File: `/docs/ai-first/touchpoints.md`

Write one section per **selected** touchpoint:

* **Problem statement** (1 paragraph)
* **Happy path** (6–10 steps)
* **Grounding & guardrails**: source of truth, retrieval scope, max context, refuse outside scope
* **Human-in-the-loop**: escalation triggers and thresholds, UI surface, reviewer and SLA
* **Latency budget**: step budgets that sum to the p95 target; show cache strategy if any
* **Error & fallback behavior**
* **PII handling**: what leaves the app, redaction rules, logging policy
* **Success metrics**: 2 product + 1 business metric with formulas
* **Feasibility note (3–5 lines)**: data/source availability, API or tool to use, and the next prototype step you would attempt.

---

### 3) Cost Model

File: `/docs/ai-first/cost-model.md`

Provide a simple cost calc for **each** selected touchpoint. Assume a concrete model and price, and state it.

Template:

```markdown
## Assumptions
- Model: <name> at $<in>/1K prompt tokens, $<out>/1K completion tokens
- Avg tokens in: <n>   Avg tokens out: <n>
- Requests/day: <n>
- Cache hit rate: <percent> (apply miss cost only if caching is used)

## Calculation
Cost/action = (tokens_in/1000 * prompt_price) + (tokens_out/1000 * completion_price)
Daily cost = Cost/action * Requests/day * (1 - cache_hit_rate)

## Results
- Support assistant: Cost/action = $0.00X, Daily = $Y
- Search suggestions: Cost/action = $0.00X, Daily = $Y

## Cost lever if over budget
- e.g., shorten context to <N> tokens or downgrade model on low-risk paths.
```

---


## Submission

* Push the three files under `/docs/ai-first/`
* Update `/docs/rfc.md` with `## AI Touchpoints` linking to the capability map
* (Optional) Include the probe screenshot/log under `/docs/ai-first/probe/` and reference it in `touchpoints.md`

---

## Deadline

* Tuesday, September 23, 3PM
