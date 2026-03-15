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
   - `/admin/search-insights`
5. Verify role-specific visibility:
   - `employee`
   - `manager`
   - `editor`
   - `admin`
6. Verify administrative mutations update audit logs
7. Verify pending approval items can be approved or rejected with review comments
8. Verify stale content appears in the review priority queue
9. Verify zero-result searches appear in the search insufficiency panel
10. Verify audit logs can be filtered by operation, target, and keyword

## Multi-agent workflow

When `Claude Code CLI` is acting as the main agent and `Codex` is acting as a sub-agent:

1. keep the main worktree reserved for planning and review
2. create a dedicated delegated worktree with `git worktree add`
3. assign exactly one task and one branch to the sub-agent
4. require explicit scope, exclusions, verification, and PR metadata
5. let the sub-agent open the PR only after verification succeeds

Detailed instructions live in [docs/CLAUDE_CODEX_SUBAGENT_WORKFLOW.md](./CLAUDE_CODEX_SUBAGENT_WORKFLOW.md).

## Production hardening backlog

- replace mock persistence with database-backed repositories
- enforce authentication and SSO-backed role resolution
- move all management writes to server-side mutation endpoints
- add request-level audit logging and security monitoring
- add rate limiting and error budget monitoring for AI requests
- store secrets only in server-side environment management
