# NaviDeskApp

NaviDeskApp is an enterprise internal knowledge operations portal built to reduce search friction, repeated support inquiries, and operational ambiguity across corporate functions.

This product is designed as an internal production system, not a demo artifact. The primary concerns are information architecture, searchability, controlled updates, role-based access, auditability, and a safe path to future AI integration.

## Product purpose

Organizations accumulate operational knowledge across HR, IT, General Affairs, workflows, work rules, and benefits. In practice, that knowledge becomes fragmented across portals, spreadsheets, documents, and team memory. NaviDeskApp consolidates that internal knowledge into one governed entry point.

The product is intended to solve four business problems:

- employees cannot quickly find the correct internal procedure
- support teams receive the same questions repeatedly
- published guides and FAQs exist but are difficult to discover
- portal maintenance and ownership become inconsistent over time

## Product scope

Current product capabilities:

- global search across internal articles and FAQs
- category-based browsing for business domains
- article detail pages with related information and update traceability
- FAQ search with keyword and category filters
- AI-assisted guidance grounded in internal content only
- administrative management for articles, FAQs, announcements, and quick links
- audit log visibility for operational changes
- role-aware visibility across employee, manager, editor, and admin

## Enterprise design principles

### 1. Internal content is the source of truth

The AI layer does not invent policy, process, or procedural steps. It first searches internal content and only returns guidance when grounded evidence exists. If evidence is weak, the system falls back to normal search results.

### 2. Operational changes must be controlled

Content management is treated as an operational concern, not a UI concern. Changes to managed content flow through the shared content layer and are reflected across the portal together with audit log updates.

### 3. Authorization must be explicit

The codebase models visibility and management responsibilities directly:

- `employee`: read access to employee-visible content
- `manager`: employee content plus manager-specific content
- `editor`: content management authority
- `admin`: full authority plus audit log access

### 4. External AI integration must be replaceable

The AI guide is abstracted behind a provider service so the current grounded mock behavior can later be replaced by a server-side Gemini integration without rewriting the product UI.

## Architecture summary

Directory layout:

```text
app/
components/
data/
docs/
lib/
types/
```

Key implementation boundaries:

- `types/domain.ts`
  domain model definitions
- `data/mock/seed.ts`
  seed content and reference data
- `data/repositories/content-repository.ts`
  master-data access and read helpers
- `components/content-provider.tsx`
  shared operational content state for the current version
- `lib/content-helpers.ts`
  business logic for visibility, search, and audit composition
- `lib/ai/guide-service.ts`
  AI provider boundary
- `lib/env.ts`
  server-side environment contract for future AI integration

Supporting documents:

- [Architecture](./docs/ARCHITECTURE.md)
- [Operations](./docs/OPERATIONS.md)

## AI integration strategy

The current product uses a grounded mock provider. This is intentional.

Planned production path:

1. retrieve internal evidence first
2. rank candidate articles and FAQs
3. call Gemini server-side only after evidence retrieval
4. return answer plus citations or fallback suggestions
5. record AI-specific operational telemetry separately from content audit logs

`GEMINI_API_KEY` is intentionally not used in the browser. A future production integration should keep the key server-side only.

Reference environment file:

- [.env.example](./.env.example)

## Current runtime model

This version uses a shared client-side content store with local persistence so administrative actions can be validated end-to-end in a single application instance.

That means the current version already supports:

- create, edit, delete, and publish-toggle flows
- immediate propagation from admin screens to user-facing screens
- audit log updates for managed content mutations

For production deployment, the next step is to replace this client-side store with server-side persistence while preserving the same domain boundaries.

## Setup

```bash
npm install
npm run dev
```

## Quality gates

```bash
npm run lint
npm run test
npm run build
```

Automated coverage currently validates:

- search behavior across role-aware content
- grounded AI fallback behavior
- shared content mutation behavior
- audit log propagation for administrative actions

## Production migration path

### Near term

- replace local persistence with database-backed repositories
- move all content mutations to authenticated server-side endpoints
- resolve role membership from SSO and identity claims
- add revision history and rollback support

### Medium term

- add approval workflows for sensitive content changes
- introduce full-text indexing and ranking controls
- separate audit streams for content, authentication, and AI actions
- add structured observability for operational support

### AI phase

- implement server-side Gemini provider
- enforce evidence thresholds before answer generation
- add confidence-aware fallback rules
- apply request rate limits and secret management policies

## Business-oriented sample content

Seed content includes realistic internal operations topics:

- paid leave request process
- attendance correction process
- VPN setup guide
- PC password reset procedure
- benefits usage guidance
- internal help desk contact process

## Status

The current codebase is suitable as an enterprise-oriented internal product foundation. It already demonstrates governed content access, operational management, auditability, and a safe AI integration boundary. The remaining work for full production readiness is persistence, authentication, and server-side AI execution.
