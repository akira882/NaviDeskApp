# NaviDeskApp Architecture

## Intent

NaviDeskApp is designed as an enterprise internal knowledge operations portal. The product priority is controlled information access, operational maintainability, auditability, and future integration with enterprise systems.

## Current runtime model

- Next.js App Router for application shell and route structure
- TypeScript for domain integrity
- Tailwind CSS for consistent UI composition
- **server-side data filtering with props-based client components** (Phase 0 improvement)
- **strict server/client boundary enforcement** (Phase 0 improvement)
- repository layer for baseline master data access (server-only)
- AI guide service abstraction with provider switch point

## Server/Client Boundary (Phase 0 Implementation)

### Server Components Pattern
Server components handle:
- Role resolution via `getSessionRole()`
- Initial state building via `buildInitialStateForRole(role)`
- Data filtering by role using helper functions
- Passing only role-visible data as props to client components

### Client Components Pattern
Client components:
- Receive filtered data via props (NOT via context for read-only data)
- Use ContentProvider context ONLY for mutations (recordSearch, add/update/delete operations)
- Never import from `data/repositories/*` (enforced by build-time errors)
- Remain lightweight and focused on UI interactions

### Example Pattern

**Server Component** (`app/categories/[slug]/page.tsx`):
```typescript
export default async function CategoryDetailPage({ params }) {
  const { slug } = await params;
  const role = getSessionRole();
  const initialState = buildInitialStateForRole(role);

  const visibleArticles = listVisibleArticles(initialState, role)
    .filter(article => article.categoryId === category?.id);
  const quickLinksForCategory = listSortedQuickLinks(initialState)
    .filter(link => link.categoryId === category?.id);

  return (
    <CategoryDetailClient
      category={category}
      visibleArticles={visibleArticles}
      quickLinksForCategory={quickLinksForCategory}
    />
  );
}
```

**Client Component** (`app/components/category-detail-client.tsx`):
```typescript
export function CategoryDetailClient({
  category,
  visibleArticles,
  quickLinksForCategory
}: {
  category: Category | null;
  visibleArticles: Article[];
  quickLinksForCategory: QuickLink[];
}) {
  // Uses props - no repository imports, no useContent for reading data
  return <div>{/* render using props */}</div>;
}
```

## Domain boundaries

## Prioritized information architecture

The enterprise navigation order is intentionally weighted by operational impact:

1. task hubs for high-frequency workflows
2. global search for known-item retrieval
3. category navigation for policy browsing
4. announcements for time-sensitive changes
5. admin controls for governed mutation flows

This reduces the most common failure mode in internal portals: users knowing the task they need to complete, but not the department that owns it.

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
- search logs

These are managed through the shared content store in the current version so that administrative actions propagate across the product immediately.

### Governance overlays

- approval status and review comments on articles, FAQs, and announcements
- review priority scoring based on content freshness
- search failure aggregation for missing-content discovery

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
