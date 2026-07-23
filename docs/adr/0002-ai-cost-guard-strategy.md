# ADR 0002: AI Cost Guard Strategy

## Status
Accepted

## Context
The Bursali Oto AI Platform utilizes foundation models (e.g. Gemini 2.5, OpenAI GPT-4) via the Vercel AI SDK. As adoption scales across multiple tenants, unchecked API usage exposes the business to severe billing anomalies (e.g. prompt injection loops, infinite retries, scraping attacks). We need a mechanism to strictly control token expenditure on a per-model, per-tenant, and per-user basis.

## Decision
We will implement an **AI Cost Guard** component (`src/domains/AI/CostGuard.js`) leveraging Redis (Upstash) as a highly-available, low-latency datastore.
1. Before any LLM call, the `CostGuard` will pipeline multiple `GET` requests to check the current token consumption for the User (daily), Tenant (monthly), and Model (daily).
2. If any configured limit is exceeded, the system will prevent the API call and return a fallback response.
3. If Redis is down, the system will **fail-open** to ensure continuity of service.
4. After a successful LLM call, the `CostGuard` will record the utilized tokens using a Redis pipeline (`INCRBY` and `EXPIRE`) to maintain accurate budgets.

## Consequences
- **Positive:** Financial predictability and protection against denial-of-wallet attacks.
- **Negative:** Adds a slight latency overhead (a few milliseconds) to every AI request due to Redis round-trips.
