# D-HOIP

D-HOIP is the Dare2Care Hospital Operating & Intelligence Platform: a hospital-specific
Hospital Management System (HMS) and Electronic Medical Records (EMR) platform for one private
hospital in Nigeria. It is not a multi-tenant SaaS product.

Owner: ColorX.

## Current status

This repository is in **initialization and foundation review**. It contains governance and
architecture documentation only.

- No application scaffold exists.
- No application dependency is installed.
- No database schema or migration exists.
- No authentication, hosting, or external service is configured.
- No production release has been approved.

The prior D-HOIP repository is a historical research environment and is not the source of truth
for this repository's Git history.

## What is authoritative

1. Hospital-approved policy and requirements govern hospital operational rules.
2. Explicit project-owner decisions govern project direction.
3. Accepted ADRs govern technical decisions.
4. The target-state blueprint is the principal architectural proposal, not an approval.
5. Danphe EMR is a functional reference only.
6. D-HOIP Demo V3 is a UI and workspace reference only.

Third-party references do not override hospital requirements. Unresolved decisions remain
unresolved until an authorized human records approval.

## Documentation

Start with [`docs/README.md`](docs/README.md). It defines the documentation structure, status
vocabulary, source authority, and approval gates.

## Local-only agent material

`AGENTS.md`, `.local-ai/`, and `.opencode/skills/` are intentionally excluded from Git. They
contain local agent instructions, copied reference material, working notes, and project-local
skills. They are not published to GitHub.

## Working rules

- Investigate before changing anything.
- Do not implement unapproved features.
- Do not install application dependencies or create schemas without approval.
- Do not commit, push, deploy, or configure external services without explicit approval.
- Use synthetic or de-identified data only.
- Never commit secrets or real patient data.
