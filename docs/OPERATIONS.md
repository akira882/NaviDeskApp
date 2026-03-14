# NaviDeskApp Operations

## Operational principles

- internal content is the system of truth for answers
- AI may summarize or rank evidence, but must not invent policy
- every administrative content mutation must be attributable
- role-based visibility must be enforced consistently

## Dream team responsibilities

- Chief Test Engineer owns `npm run lint`, `npm run test`, and `npm run build` as release gates
- Security Architect reviews client/server boundaries before shipping role or AI changes
- Knowledge Operations Lead reviews information architecture when categories, search, or content flows change

## Release checklist

1. Run `npm run lint`
2. Run `npm run test`
3. Run `npm run build`
4. Verify key routes:
   - `/`
   - `/categories`
   - `/faq`
   - `/ai-guide`
   - `/admin`
   - `/admin/audit-log`
5. Verify role-specific visibility:
   - `employee`
   - `manager`
   - `editor`
   - `admin`
6. Verify administrative mutations update audit logs

## Production hardening backlog

- replace mock persistence with database-backed repositories
- enforce authentication and SSO-backed role resolution
- move all management writes to server-side mutation endpoints
- add request-level audit logging and security monitoring
- add rate limiting and error budget monitoring for AI requests
- store secrets only in server-side environment management
