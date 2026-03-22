# Notification Service

Simple, secure notification microservice for Book-Corner.

## Scope
- HTTP-only integration (no message queue).
- Receives internal events from other services.
- Stores in-app notifications.
- Sends email notifications (SMTP sandbox-ready).

## API Endpoints
- `POST /api/events` (internal service JWT required)
- `GET /api/notifications/me` (user JWT required)
- `PATCH /api/notifications/:id/read` (user JWT required)
- `GET /health`

## Security Controls
- JWT authentication for internal and user routes.
- Input validation and sanitization with Zod.
- Rate limiting on event ingestion endpoint.
- Helmet, CORS restrictions, and payload size limit.
- Secrets via environment variables only.

## Local Run
1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies:
   - `npm install`
3. Start service:
   - `npm run dev`

## Docker
Build:
- `docker build -t book-corner-notification-service .`

Run:
- `docker run --env-file .env -p 3004:3004 book-corner-notification-service`

## Producer Integration Contract
Send event payload to `POST /api/events`:

```json
{
  "eventType": "USER_REGISTERED",
  "userId": "<user-id>",
  "email": "user@example.com",
  "title": "Optional title",
  "message": "Optional message",
  "channels": ["in-app", "email"],
  "metadata": {
    "source": "user-auth-service"
  }
}
```

Headers:
- `Authorization: Bearer <internal-service-jwt>`
- `x-correlation-id: <uuid-optional>`

## Suggested JWT Payloads
Internal service token payload:

```json
{
  "service": "user-auth-service",
  "scope": "internal"
}
```

User token payload:

```json
{
  "id": "<user-id>",
  "role": "customer"
}
```
