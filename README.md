# High-Level Architecture Diagram
The system is built around stateless services (Order, Drop, Notification, Follower) exposed through an API Gateway with authentication. A SQL database ensures consistency for orders, products, and drops, while a NoSQL database supports scalable follower lists. Redis caching and an event bus improve performance and decouple services, while Blob Storage + CDN efficiently serve product images to clients. The design is split into multiple diagrams, each one explaining a critical flow of the system, here are the links for each flow:
- Ordering flow: https://excalidraw.com/#json=yhyK4R3Zy3ePPfxxxO9hd,druIT0HvvK_PhgXJWl7BSA
- Product browsing flow: https://excalidraw.com/#json=Fyf0lWDANqbiHncUvQh8n,lveJWxKi7V_ibIFLs7OiDw
- Drop scheduling and notification flow: [https://excalidraw.com/#json=f3I0MzVy8UxBN7cBeb3Mz,zrlGDeOSlg5INRAR2KhRmA](https://excalidraw.com/#json=rtjOlxuPbgqYc6jngLcla,VQNVWwxwV-CBWyMokQ3BaQ)
- Followers flow: [https://excalidraw.com/#json=T98mokS-ZVkiYEpzB86zW,Pss6-PXPSOUB7PIpArWw_Q](https://excalidraw.com/#json=Jb_jtm7gBV3KfuX3TU7xp,wEOQv4nApF71MnVvp5na1A)
## Explanation for each flow:
- Ordering flow: Users place orders through the Order Service, which validates stock in the SQL database and ensures no overselling by using transactions. Each order includes an idempotency key to prevent duplicates under retries. After a successful order, the stock cache is invalidated and an event is published to the Notification Service, which confirms the order back to the user in real time.
- Product browsing flow: Users can browse products and drops via APIs. Product and drop details are cached in Redis for speed, while static images are served through a CDN backed by Blob Storage. This ensures fast browsing with low latency while keeping the SQL database as the source of truth.
- Drop scheduling and notification flow: Creators can schedule drops by storing product, timing, and stock information in the SQL database. When a drop begins, the Drop Service publishes a drop_started event. The Notification Service consumes this event, queries the Followers NoSQL store (with Redis cache for hot lookups), and pushes notifications to users via WebSockets.
- Followers flow: Users can follow or unfollow creators via APIs. Follower data is stored in a NoSQL database for scalability, and results are cached using versioned keys so that updates invalidate old lists efficiently. This design supports paginated queries and avoids bottlenecks when handling celebrity-scale audiences.

# Data Model Sketch
link to the diagram: [https://tinyurl.com/mr3sn85m](https://tinyurl.com/yhadj6u7)
## Entities include:
- Users (creators, followers)
- Products (linked to creators and metadata for items sold in drops)
- Drops (with start/end time, stock, creator reference)
- Orders (linked to drops and users, idempotency key, ensures no overselling and prevents duplicates)
- Inventory (allows atomic updates to stock and is linked to drops)
- Followers (stored in NoSQL for scalability, supports paginated queries and versioned cache keys for invalidation)

# API Contract Outline
Our system exposes public APIs for clients and internal APIs for service-to-service communication. We chose REST for simplicity, caching compatibility, and broad client support, while using WebSockets only for real-time notifications.
## Public APIs:
- Auth: POST /auth/login, POST /auth/register, GET /users/{id}
- Products & Drops: POST /creators/{id}/products, GET /products/{id}, GET /products?creator_id=&page=, POST/products/{id}/drops, GET /drops/{id}, GET /drops?status=live|upcoming|ended
- Orders: POST /drops/{id}/orders, GET /orders/{id}
- Followers: POST /creators/{id}/follow, DELETE /creators/{id}/follow, GET /creators/{id}/followers,GET /users/{id}/following
- Notifications: GET /notifications (WebSocket upgrade)
## Internal APIs:
- Order → Inventory: POST /inventory/{drop_id}/decrement
- Drop → Event Bus: publishes drop_started, drop_ended
- Order → Event Bus: publishes order_confirmed
- Notification → Followers DB: GET /followers/{creator_id}?page=

# Caching & Invalidation Strategy
Caching reduces load and improves latency, while invalidation ensures correctness. We use a cache-aside pattern with Redis and a CDN for images. Database is always the source of truth.
- Stock status: cached briefly (1–3s), invalidated after orders with delayed double delete.
- Followers: versioned keys for scalable invalidation.
- Drop state: event-driven invalidation on start/end.
- Images → served from CDN
- Pitfalls (penetration, stampede, avalanche) are mitigated through null caching, per-key locks, staggered TTLs, and versioned keys.

# Tradeoffs & Reasoning
- SQL vs NoSQL → SQL for orders and inventory ensures strong consistency; NoSQL for followers scales to millions with eventual consistency.
- Stateless vs Stateful → Services are stateless for scalability; WebSockets introduce controlled state for real-time push notifications.
- Sync vs Async → Orders and browsing are synchronous for immediate feedback; notifications are asynchronous for scalable fanout.
- Consistency vs Availability → Consistency prioritized in orders (no overselling), availability prioritized in followers (slight staleness acceptable).
- Monolith vs Microservices → Microservices chosen for scalability and failure isolation, at the cost of added complexity.
- Event-driven vs Direct Calls → Event-driven used for notifications and cache invalidation; direct calls for transactions that require strict guarantees.
- Normalization vs Denormalization → Normalized SQL schema avoids anomalies; denormalization in cache/NoSQL speeds up heavy-read queries.
