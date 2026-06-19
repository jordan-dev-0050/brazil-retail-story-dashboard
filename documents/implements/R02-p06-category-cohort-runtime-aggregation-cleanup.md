---
author: Codex
date: 2026-06-19
title: R02 - P06 Category Cohort Runtime Aggregation Cleanup
uuid: 17273c3265ce4f09984324680e1a26a9
version: 0.1
---

# R02 - P06 Category Cohort Runtime Aggregation Cleanup

## 1. Goal
Restructure the dashboard data facade so `Product Category` can behave like a real global cohort without introducing an unmaintainable precomputed `byState x byCategory` artifact explosion.

## 2. User Value
- **As a** maintainer of the dashboard facade
- **I want** category cohort aggregation to be computed from stable runtime facts instead of duplicated aggregate trees
- **So that** P06 P3 stays honest, extendable, and easier to verify

## 3. Refactor Targets
| ID | Area | Before | After |
|---|---|---|---|
| R1 | artifact payload | aggregated slices only | aggregated slices + `orderFacts` runtime cohort source |
| R2 | phase2 facade selectors | `range + customerState` only | `range + customerState + productCategory` cohort selectors with cache |
| R3 | filter normalization | state-only validity reset | state/category/payment validity re-normalized together |
| R4 | panel disclosure | staged category copy | active category cohort copy + focused-mode / not-applied disclosure |

## 4. Verification Notes
- `npm run test:phase2-artifact`
- `npm run build`

## 5. Risks / Follow-ups
- The production bundle is materially larger because `orderFacts` now ships in the client bundle.
- If we continue productizing more same-dimension filters, we should consider a lighter-weight derived artifact or code-splitting strategy for the heavy dashboard payload.
