---
author: Codex
date: 2026-06-19
title: F12 - P06 UI Disclosure And Verification Baseline
uuid: c9be603ee7994631a74181ea36b7d33d
version: 0.1
---

# F12 - P06 UI Disclosure And Verification Baseline

## 1. Goal
Close P06 with one honest rollout baseline: the dashboard must visibly explain which filters form the active global cohort, which panels use focused-mode handling, which surfaces still do not apply a filter, and which verification scenarios maintain that contract over time.

## 2. User Value
- **As a** reviewer or maintainer walking through the dashboard
- **I want** the UI copy, README notes, and verification checks to agree on the current global-filter boundary
- **So that** the dashboard feels intentionally productized instead of accidentally complete

## 3. Acceptance Criteria
- **Scenario 1: active cohort is visible**
  - **Given** `Customer State` or `Product Category` is active
  - **When** the user views the dashboard shell and supported panels
  - **Then** the UI must explicitly say those filters are part of the active global cohort for KPI, Trend, Payment, and Review

- **Scenario 2: same-dimension handling is named**
  - **Given** the selected filter matches a panel's own dimension
  - **When** the user views `Brazil Map` or `Category Share`
  - **Then** the panel must disclose focused-mode handling instead of pretending the panel was globally filtered in the usual way

- **Scenario 3: coverage gaps are explicit**
  - **Given** `Product Category` is active
  - **When** the user views `Brazil Map`
  - **Then** the UI must clearly say that Product Category is not applied on the map

- **Scenario 4: verification baseline covers both cohort types**
  - **Given** the artifact verification script is run
  - **When** state-cohort and category-cohort scenarios are checked
  - **Then** the script must verify representative `Customer State` and `Product Category` cohort totals, plus at least one combined cohort with payment-aware slicing

## 4. Verification Notes
| ID | Scenario | Given | When | Then | Priority |
|---|---|---|---|---|---|
| TC1 | active cohort summary disclosure | active non-default filters | inspect dashboard shell | contract card + KPI disclosure call out the active cohort | High |
| TC2 | focused-state disclosure | active `MG` | inspect `Brazil Map` subtitle | map stays range-scoped and names focused-state handling | High |
| TC3 | focused-category disclosure | active `bed_bath_table` | inspect `Category Share` subtitle | ranking stays visible and the chosen category is highlighted | High |
| TC4 | not-applied map disclosure | active `bed_bath_table` | inspect `Brazil Map` subtitle | Product Category is explicitly called out as not applied | High |
| TC5 | state cohort baseline | `all` range + `SP` | run verify script | KPI / Trend / Review totals stay aligned to the same state cohort | High |
| TC6 | category cohort baseline | `all` range + `bed_bath_table` | run verify script | KPI / Review totals stay aligned to the same membership cohort | High |
| TC7 | combined cohort payment slice | `all` range + `SP` + `bed_bath_table` + `credit_card` | run verify script | payment-aware slice stays inside the combined cohort | High |

## 5. Implementation Notes
- Render the existing global filter contract summary in the dashboard instead of leaving it as unused code.
- Give KPI Cards their own panel-level disclosure so the summary layer does not rely on readers inferring filter coverage from lower panels.
- Keep README current-state notes aligned with the actual runtime behavior.
- Use the artifact verification script as the durable acceptance baseline for representative state and category cohorts.

## 6. Out Of Scope
- Expanding `Brazil Map` into a category-aware panel
- Turning `Payment Type` into a top-level global cohort dimension
- Reworking the artifact schema again after the P3 runtime aggregation cleanup
