---
author: Codex
date: 2026-06-19
title: R01 - P06 Dashboard State Filter Facade Cleanup
uuid: 673f6c7ad1914ac8b889917a676b7722
version: 0.1
---

# R01 - P06 Dashboard State Filter Facade Cleanup

## 1. Goal
Thread the active `Customer State` cohort through the dashboard facade and component props without prematurely activating `Product Category` or breaking the existing `Payment Type` secondary-slice semantics.

## 2. User Value
- **As a** maintainer of the dashboard codebase
- **I want** the facade API to accept `customerState` explicitly where state-scoped data exists
- **So that** the UI wiring stays honest, testable, and ready for later `Product Category` work

## 3. Refactor Targets
| ID | Area | Before | After |
|---|---|---|---|
| R1 | phase2 facade selectors | range-only accessors | range + `customerState` accessors with scoped fallback |
| R2 | dashboard facade | P06 P1 contract copy | P06 P2 active-state contract copy |
| R3 | dashboard page wiring | stored-but-inactive `customerState` | active state cohort passed into selectors and panels |
| R4 | panel disclosure | generic staged text | panel copy reflects active state cohort vs focused mode |

## 4. Verification Notes
- `node scripts/generate-phase2-dashboard-artifact.mjs`
- `node scripts/verify-phase2-dashboard-artifact.mjs`
- `npm run build`

## 5. Risks / Follow-ups
- `Product Category` still needs its own artifact expansion and same-dimension disclosure path in a later phase.
- Brazil Map focused mode is intentionally lightweight in P2: it highlights the selected state while keeping the full range-scoped map intact.
