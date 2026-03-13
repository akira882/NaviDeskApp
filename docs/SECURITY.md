# NaviDeskApp Security

## Security posture

NaviDeskApp is intended for internal confidential operational content. That means convenience patterns acceptable in demos are not acceptable here.

## Current controls

- session role is resolved server-side through environment-backed mock session logic
- role switching is not exposed in the browser
- initial content payload is filtered server-side by session role before being delivered to the client
- audit logs are only included for admin sessions
- Gemini key is defined as server-side configuration only
- security response headers are applied globally
- client-side persistent storage for managed content has been removed

## Non-negotiable production rules

- do not ship confidential documents in static client bundles for unauthorized roles
- do not expose AI provider keys through client-side environment variables
- do not trust client-side role state for authorization
- do not allow AI to answer without grounded internal evidence

## Required next production controls

- integrate real authentication and SSO
- move managed content reads and writes to server-side repositories
- use database-backed authorization checks on every sensitive read
- encrypt secrets through platform-managed secret storage
- add structured audit trails for authentication, content mutation, and AI usage
