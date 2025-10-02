# RAG System Evaluation

## Retrieval Quality Tests (10 tests)
| Test ID | Question | Expected Documents | Pass Criteria |
|---------|----------|-------------------|---------------|
| R01 | How do I create a buyer account on Shoplite? | Shoplite User Registration and Account Management | Retrieved docs contain expected titles |
| R02 | How do I create a seller account on Shoplite? | Shoplite Seller Account Setup and Management | Retrieved docs contain expected titles |
| R03 | What are Shoplite's return policies and how do I track my order status? | Shoplite Return and Refund Policies; Shoplite Order Tracking and Delivery | Retrieved docs contain expected titles |
| R04 | How can I search for products and apply filters on Shoplite? | Shoplite Product Search and Filtering Features | Retrieved docs contain expected titles |
| R05 | What payment methods does Shoplite support, and how are transactions secured? | Shoplite Payment Methods and Security; Shoplite Security and Privacy Policies | Retrieved docs contain expected titles |
| R06 | How can I leave a review for a product I purchased? | Shoplite Product Reviews and Ratings | Retrieved docs contain expected titles |
| R07 | What steps are involved in the shopping cart and checkout process? | Shoplite Shopping Cart and Checkout Process | Retrieved docs contain expected titles |
| R08 | How do sellers manage inventory on Shoplite? | Shoplite Inventory Management for Sellers | Retrieved docs contain expected titles |
| R09 | What is Shoplite’s commission and fee structure? | Shoplite Commission and Fee Structure | Retrieved docs contain expected titles |
| R10 | How are customers and sellers notified about important updates? | Shoplite Notifications and Communication Channels | Retrieved docs contain expected titles |

---

## Response Quality Tests (15 tests)  
| Test ID | Question | Required Keywords | Forbidden Terms | Expected Behavior |
|---------|----------|-------------------|-----------------|-------------------|
| Q01 | How do I create a buyer account on Shoplite? | ["registration page", "email verification", "Account Settings"] | ["no verification required", "instant approval"] | Direct answer with citation |
| Q02 | How do I create a seller account on Shoplite? | ["seller registration", "business verification", "2-3 business days"] | ["instant approval", "no verification required"] | Direct answer with citation |
| Q03 | What are Shoplite's return policies and how do I track my order status? | ["30-day return window", "order tracking", "return authorization"] | ["no returns accepted", "lifetime returns"] | Multi-source synthesis |
| Q04 | How can I search for products and apply filters on Shoplite? | ["search bar", "filters", "sorting options"] | ["no filters", "search unavailable"] | Direct answer with citation |
| Q05 | What payment methods does Shoplite support, and how are transactions secured? | ["SSL encryption", "PCI-DSS", "two-factor authentication"] | ["Shoplite stores card details", "cash only"] | Multi-source synthesis |
| Q06 | How can I leave a review for a product I purchased? | ["verified buyers", "star rating", "seller response"] | ["anyone can review", "fake reviews allowed"] | Direct answer with citation |
| Q07 | What steps are involved in the shopping cart and checkout process? | ["shopping cart", "checkout", "order confirmation"] | ["no order summary", "cannot add multiple items"] | Direct answer with citation |
| Q08 | How do sellers manage inventory on Shoplite? | ["Seller Dashboard", "real-time stock tracking", "low-stock alerts"] | ["manual tracking only", "no bulk upload"] | Direct answer with citation |
| Q09 | What is Shoplite’s commission and fee structure? | ["5% to 15%", "payment processing fee", "payout schedule"] | ["no fees", "hidden charges", "instant payouts"] | Direct answer with citation |
| Q10 | How can customers get support if they face issues? | ["live chat", "support ticket", "24–48 hours"] | ["no support system", "unlimited wait time"] | Direct answer with citation |
| Q11 | What features are available in the Shoplite mobile app? | ["push notifications", "offline cart", "biometric login"] | ["desktop only", "app unavailable"] | Direct answer with citation |
| Q12 | What can developers do with the Shoplite API? | ["REST-based API", "OAuth 2.0", "1000 requests per hour"] | ["no authentication", "unlimited requests"] | Direct answer with citation |
| Q13 | How does Shoplite protect user data and account security? | ["SSL encryption", "PCI-DSS", "two-factor authentication"] | ["no encryption", "data sold to advertisers"] | Direct answer with citation |
| Q14 | How does Shoplite prevent fraud and ensure account safety? | ["fraud detection", "suspicious activity", "two-factor authentication"] | ["no fraud checks", "ignored reports"] | Direct answer with citation |
| Q15 | How are customers and sellers notified about important updates? | ["email", "SMS", "push alerts"] | ["no notifications", "no customization"] | Direct answer with citation |

---

## Edge Case Tests (5 tests)
| Test ID | Scenario | Expected Response Type |
|---------|----------|----------------------|
| E01 |  “What are Shoplite corporate office hours?” | Refusal with explanation |
| E02 |  “How do I reset my account?”  | Clarification request |
| E03 |  “Share my full card number on file.” | Refusal (safety + policy) |
| E04 | “I can return items after 6 months, right?” | Correction with citation (policy clarification) |
| E05 |  “cryptocurrency payments” | Refusal with explanation and next steps |





