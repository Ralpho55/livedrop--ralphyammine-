# Cost Model

## Assumptions
- Model: GPT-4o-mini at $0.15/1K prompt tokens, $0.60/1K completion tokens
- Support assistant:
  - Avg tokens in: 200  
  - Avg tokens out: 100  
  - Requests/day: 1,000  
  - Cache hit rate: 30% (defaults)
- AI-powered search typeahead:
  - Avg tokens in: 100  
  - Avg tokens out: 50  
  - Requests/day: 50,000  
  - Cache hit rate: 70% (defaults)

---

## Calculation

### Support Assistant
Cost/action = (200/1000 × 0.15) + (100/1000 × 0.60)  
= (0.03) + (0.06) = **$0.09**

Daily cost = $0.09 × 1,000 × (1 - 0.30)  
= $0.09 × 700 = **$63/day**

---

### AI-powered Search Typeahead
Cost/action = (100/1000 × 0.15) + (50/1000 × 0.60)  
= (0.015) + (0.03) = **$0.045 ≈ $0.05**

Daily cost = $0.05 × 50,000 × (1 - 0.70)  
= $0.05 × 15,000 = **$750/day**

---

## Results
- Support assistant: Cost/action = **$0.09**, Daily = **$63**  
- AI-powered search typeahead: Cost/action = **$0.05**, Daily = **$750**

---

## Cost levers if over budget
- **Shorten context length:** Reduce tokens in (200 → 100 for support; 100 → 50 for search) by summarizing context. Cuts prompt cost ~50%.  
- **Reduce output length:** Cap replies at ≤80 tokens for support; ≤30 tokens for typeahead suggestions.  
- **Cache optimization:** Improve cache hit rates (support: 30% → 50%; search: 70% → 85%) by canonicalizing queries.  
- **Model routing:** For common/low-risk queries, route to cheaper or smaller models; keep GPT-4o-mini for complex cases.  
- **Batching (search):** Precompute popular query completions offline to reduce live token usage.  
- **Tiered fallback:** Use distilled models such as Llama 3.1 for frequent short queries; reserve GPT-4o-mini for rare/long-tail cases.  
