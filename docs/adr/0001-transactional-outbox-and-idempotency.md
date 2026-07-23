# ADR 0001: Transactional Outbox and Idempotency Pattern

## Status
Accepted

## Context
As the Bursali Oto ERP system scales, we need to ensure data consistency between our primary PostgreSQL database and asynchronous message queues (Cloudflare Queues / BullMQ). Writing directly to a queue after a database transaction can result in inconsistencies if the queue write fails or if the application crashes between the two operations. Additionally, we face risks of duplicate `POST` requests creating multiple records (e.g. duplicate Work Orders) if network retries happen.

## Decision
1. **Transactional Outbox Pattern**: We will implement the Transactional Outbox pattern by introducing an `OutboxEvent` table in Prisma. All domain events (e.g., `WorkOrderCreated`) will be written to this table within the same database transaction that modifies the business entities. A separate background process will poll this table and dispatch events to the message queue, ensuring at-least-once delivery.
2. **Idempotency Key**: All mutating API endpoints (POST/PUT/PATCH) will require an `Idempotency-Key` header. We will store these keys in an `IdempotencyRecord` table along with a hash of the request payload and a TTL (Time-To-Live). If a duplicate request arrives, the system will return the cached response or a `409 Conflict` if the request body hashes differ.

## Consequences
- **Positive:** Guaranteed consistency between the database and message broker. Immunity to network-induced duplicate API requests.
- **Negative:** Increased load on the database due to the `OutboxEvent` table inserts and polling. Requires robust dead-letter queue (DLQ) handling for events that repeatedly fail to process.
