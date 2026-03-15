# Claude Code CLI And Codex Sub-Agent Workflow

## Purpose

This document defines a safe operating model where `Claude Code CLI` acts as the main agent and `Codex` acts as a sub-agent for isolated implementation work, branch creation, and pull request submission.

## Why this workflow exists

- the main worktree may already contain uncommitted work
- two agents must not edit the same worktree at the same time
- each delegated task needs a clean branch, clear ownership, and a reviewable PR

## Roles

### Main agent: `Claude Code CLI`

- clarify the user request
- split the work into one small delegated task
- define scope, exclusions, verification, and PR intent
- review the sub-agent output before merge

### Sub-agent: `Codex`

- work only inside the dedicated worktree
- implement the requested task with minimal diff
- run verification commands
- commit, push, and open the GitHub pull request

## Non-negotiable rules

- never let `Claude` and `Codex` edit the same worktree concurrently
- use exactly one branch per delegated task
- keep one task per PR
- define explicit `changed files`, `do not change`, and `done criteria`
- require `npm run lint`, `npm run test`, and `npm run build` unless the task is documentation-only

## Recommended terminal layout

### Terminal A: main agent

Use for `Claude Code CLI`.

- current repository root
- task analysis
- prompt generation for Codex
- PR review after Codex finishes

### Terminal B: sub-agent

Use for `Codex`.

- dedicated worktree only
- implementation
- verification
- commit, push, PR creation

### Terminal C: support shell

Use for plain shell commands when needed.

- `git worktree add`
- `gh auth status`
- emergency inspection commands

## Setup prerequisites

1. `git` is installed
2. `claude` is installed
3. `codex` is installed
4. `gh` is installed
5. `gh auth login` has been completed
6. the operator has push permission to the target GitHub repository

## Standard operating procedure

### Step 1: prepare the main agent prompt

In Terminal A, start `claude` in the main repository root and ask it to produce:

- task name
- goal
- branch name
- worktree directory name
- files allowed to change
- files or concerns that must not change
- done criteria
- verification commands
- commit message
- PR title
- PR body
- the exact Codex prompt

### Step 2: create the dedicated worktree

In Terminal C, from the main repository root:

```bash
git worktree add .worktrees/<worktree-name> -b <branch-name> main
```

Example:

```bash
git worktree add .worktrees/codex-subagent-orchestration -b feature/codex/claude-codex-orchestration main
```

This keeps sub-agent work isolated from any in-progress changes in the primary worktree.

### Step 3: run Codex in the delegated worktree

In Terminal B:

```bash
cd .worktrees/<worktree-name>
codex exec -C "$(pwd)" --sandbox workspace-write -a on-request "<codex-prompt>"
```

The prompt must explicitly require Codex to:

- stay inside the delegated worktree
- make only the requested changes
- run verification commands
- create a commit
- push the branch
- create the PR with `gh pr create`
- report changed files, verification results, commit hash, and PR URL

### Step 4: review the PR with Claude

In Terminal A, give Claude:

- the sub-agent summary
- the PR URL
- the original delegated task

Ask Claude to decide:

- whether the PR satisfies the requested scope
- whether any follow-up task is needed
- whether the next task should be delegated or handled directly

## Command templates

### Main agent prompt template

```text
You are the main agent.
Break the requested work into one delegated Codex task.
Output:
1. task name
2. goal
3. branch name
4. worktree name
5. allowed file changes
6. forbidden changes
7. done criteria
8. verification commands
9. commit message
10. PR title
11. PR body
12. exact Codex prompt
```

### Codex prompt template

```text
You are the sub-agent.
Work only inside this delegated worktree.

Task:
<task name>

Goal:
<goal>

Allowed changes:
<files and areas>

Forbidden changes:
<files and concerns>

Done criteria:
<done criteria>

Verification:
<commands>

After verification succeeds:
1. create the commit using the provided commit message
2. push the current branch to origin
3. create the GitHub pull request using the provided title and body
4. report changed files, verification results, commit hash, and PR URL
```

## PR creation template

```bash
git push -u origin <branch-name>
gh pr create --base main --head <branch-name> --title "<pr-title>" --body "<pr-body>"
```

## Recovery rules

- if Codex touches files outside scope, discard that worktree branch and recreate it
- if verification fails, do not open the PR until the failure is explained or fixed
- if the main worktree changes while the sub-agent is running, do not manually copy files between worktrees
- after merge, remove the delegated worktree with `git worktree remove .worktrees/<worktree-name>`

## Project-specific guidance for NaviDeskApp

- prefer small PRs that preserve security boundaries
- do not regress role-based visibility
- do not bypass auditability requirements
- when changing runtime or security behavior, update docs together with code
