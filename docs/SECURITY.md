# NaviDeskApp Security

## Security posture

NaviDeskApp is intended for internal confidential operational content. That means convenience patterns acceptable in demos are not acceptable here.

## Current controls

- session role is resolved server-side through environment-backed mock session logic
- role switching is not exposed in the browser
- initial content payload is filtered server-side by session role before being delivered to the client
- **client components receive only role-filtered data via props** (Phase 0 improvement)
- **no direct repository imports in client components** (Phase 0 improvement)
- **navigation filtering based on visible article slugs** (Phase 0 improvement)
- audit logs are only included for admin sessions
- Gemini key is defined as server-side configuration only
- security response headers are applied globally
- client-side persistent storage for managed content has been removed

## Non-negotiable production rules

- do not ship confidential documents in static client bundles for unauthorized roles
- do not expose AI provider keys through client-side environment variables
- do not trust client-side role state for authorization
- do not allow AI to answer without grounded internal evidence

## Phase 0 Security Improvements (2026-03-15)

Completed client/server boundary repairs to eliminate unauthorized content leakage:

1. **Eliminated client repository imports**: All client components now receive data via props from server components
2. **Server-side data filtering**: Articles, FAQs, announcements, and search logs are filtered by role before being passed to client
3. **Role-aware navigation**: Task hubs and quick link catalogs filter resources based on visible article slugs
4. **Verified security**: Bundle analysis confirms no manager-only article content or user lists in client bundles

### Components Refactored
- `category-detail-client.tsx` - Now receives visibleArticles and quickLinksForCategory as props
- `ai-guide-client.tsx` - Now receives preloadedArticles, preloadedFaqs, searchLogs as props
- `task-hub-client.tsx` - Now receives preloadedArticles and preloadedQuickLinks as props
- `search-insights-dashboard.tsx` - Now receives articles, faqs, announcements, searchLogs as props
- `audit-log-table.tsx` - Now receives auditLogs as prop with filtered users

### Navigation Functions Enhanced
- `listTaskHubsForRole()` - Accepts visibleArticleSlugs Set for filtering
- `findQuickLinkGuideBySlug()` - Accepts visibleArticleSlugs Set for filtering

## Required next production controls

- integrate real authentication and SSO
- move managed content reads and writes to server-side repositories (partially addressed in Phase 0)
- use database-backed authorization checks on every sensitive read
- encrypt secrets through platform-managed secret storage
- add structured audit trails for authentication, content mutation, and AI usage
