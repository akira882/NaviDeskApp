# NaviDeskApp Architecture

## Intent

NaviDeskApp is designed as an enterprise internal knowledge operations portal. The product priority is controlled information access, operational maintainability, auditability, and future integration with enterprise systems.

## Current runtime model

- Next.js App Router for application shell and route structure
- TypeScript for domain integrity
- Tailwind CSS for consistent UI composition
- shared client-side content store for current interactive demo behavior
- repository layer for baseline master data access
- AI guide service abstraction with provider switch point

## Domain boundaries

### Read-only master data

- categories
- users

These are currently served from repository-backed seed data and represent stable reference data.

### Managed operational content

- articles
- faqs
- announcements
- quick links
- audit logs

These are managed through the shared content store in the current version so that administrative actions propagate across the product immediately.

## AI integration boundary

The AI guide is intentionally isolated behind `lib/ai/guide-service.ts`.

Current provider:
- `mock`

Planned provider:
- `gemini`

The production path is to move AI orchestration fully server-side, query grounded content first, then call Gemini only after relevant internal evidence is retrieved. The browser must never receive the raw Gemini key.

## Enterprise migration path

### Phase 1

- replace localStorage-backed operational state with database persistence
- route all writes through authenticated server actions or API routes
- attach user identity from SSO to every mutation

### Phase 2

- introduce approval flow for high-risk content changes
- add revision history and rollback
- add full-text indexing and relevance tuning

### Phase 3

- integrate Gemini on the server
- add citation scoring and answer confidence thresholds
- record AI request audit trails separately from content operations
