# AI Touchpoint Specs

## 1. Conversational Commerce & AI Assistant

**Problem statement**  
Customers often contact support for simple queries such as order status, return policies, or shipping details. These repetitive requests increase support workload and delay responses. An AI-powered assistant grounded in ShopLite’s FAQs and order-status API can instantly resolve most of these questions, lowering support contact rates and improving customer satisfaction.

**Happy path**  
1. User opens ShopLite support chat.  
2. User types a query (e.g., “Where is my order #12345?”).  
3. System preprocesses input (extract order ID, normalize text).  
4. Relevant context is retrieved (FAQ entry or order-status API response).  
5. Query + context are passed to GPT-4o-mini.  
6. Model generates a concise, friendly response.  
7. Postprocessing enforces brand style and tone.  
8. Guardrails check if the answer is in-scope.  
9. Response is displayed to the user.  
10. User can rate the answer or escalate to a human agent.  

**Grounding & guardrails**  
- **Source of truth:** FAQ markdown, order-status API.  
- **Retrieval scope:** FAQ entries and order details only.  
- **Max context:** ≤500 tokens.  
- **Refusal policy:** If the query is out of scope (e.g., product pricing disputes), reply with: *“I can’t help with that, let me connect you to support.”*  

**Human-in-the-loop**  
- **Escalation triggers:** Low model confidence (<70%), refund disputes, fraud-related requests.  
- **UI surface:** “Talk to agent” button in the chat.  
- **Reviewer & SLA:** Escalated tickets must be handled by a support agent within 15 minutes.  

**Latency budget (p95 ≤ 1200 ms)**  
- Input preprocessing: 50 ms  
- Retrieval (FAQ/API): 200 ms  
- Model call (GPT-4o-mini): 800 ms  
- Postprocessing/render: 150 ms  
- **Cache strategy:** 30% of common queries served from cache (~100 ms total).  

**Error & fallback behavior**  
- If API fails → show “Sorry, I couldn’t fetch your order right now.”  
- If model fails → serve raw FAQ text or escalate to human.  
- If latency is exceeded → return cached snippet or safe fallback message.  

**PII handling**  
- Only order ID is sent to the model.  
- Customer names, emails, and payment info are redacted.  
- Logs contain anonymized queries only.  

**Success metrics**  
- Product:  
  - *Answer helpfulness rate* = helpful votes ÷ total responses.  
  - *First-contact resolution rate* = AI-resolved queries ÷ total queries.  
- Business:  
  - *Support deflection rate* = AI-resolved queries ÷ total queries.  

**Feasibility note**  
Data is already available (FAQ markdown, order-status API). GPT-4o-mini offers strong accuracy at reasonable cost. Next prototype step: connect retrieval to API + FAQ and test quality with 100 sample queries.  

---

## 2. AI-powered Search Typeahead

**Problem statement**  
Product discovery is a major driver of conversions. Users often abandon sessions if search is slow or irrelevant. Traditional keyword autocomplete is fast but not always accurate. An AI-powered typeahead can re-rank results to show more relevant products instantly, improving search success rate and boosting conversion.

**Happy path**  
1. User begins typing a product query in the search box.  
2. System preprocesses partial query (normalize case, remove stopwords).  
3. Candidate matches are retrieved from the SKU catalog (keyword-based).  
4. Partial query + candidate list are sent to GPT-4o-mini.  
5. Model re-ranks candidates and generates top suggestions.  
6. Postprocessing trims suggestions to fit UI.  
7. Guardrails enforce catalog-only outputs.  
8. Suggestions are displayed under the search box in <300 ms.  
9. User selects a suggestion.  
10. User is directed to the product page or results list.  

**Grounding & guardrails**  
- **Source of truth:** SKU catalog (10k items).  
- **Retrieval scope:** Catalog entries matching the partial query.  
- **Max context:** ≤200 tokens (short query + candidate SKUs).  
- **Refusal policy:** If no relevant matches are found, return “No suggestions found.”  

**Human-in-the-loop**  
- **Escalation triggers:** None (low-stakes task).  
- **UI surface:** Always defaults to keyword autocomplete if AI fails.  
- **Reviewer & SLA:** N/A; monitored via analytics rather than human review.  

**Latency budget (p95 ≤ 300 ms)**  
- Query preprocessing: 20 ms  
- Candidate retrieval: 50 ms  
- Model re-rank: 180 ms  
- Postprocessing/render: 50 ms  
- **Cache strategy:** 70% of common partial queries served from cache (~50 ms total).  

**Error & fallback behavior**  
- If AI fails → fall back to standard keyword autocomplete.  
- If latency is exceeded → return cached results or fallback list.  
- If no matches → return empty state message.  

**PII handling**  
- Only query text leaves preprocessing; no PII involved.  
- Logs may include anonymized queries for analytics.  

**Success metrics**  
- Product:  
  - *Search completion rate* = (# searches leading to click) ÷ (total searches).  
  - *Suggestion click-through rate* = (# clicks on AI suggestions) ÷ (total suggestions shown).  
- Business:  
  - *Conversion uplift* = (conversion rate after AI suggestions − baseline conversion rate).  

**Feasibility note**  
The SKU catalog is already available for retrieval. GPT-4o-mini can re-rank candidates effectively, though latency is tight. Next prototype step: test re-ranking on 500 common queries with caching enabled, and measure completion and click-through rates.  

