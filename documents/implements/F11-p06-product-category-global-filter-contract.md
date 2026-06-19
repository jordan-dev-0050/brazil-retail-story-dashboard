---
author: Codex
date: 2026-06-19
title: F11 - P06 Product Category Global Filter Contract
uuid: 5dfd6b1b8b624c86a3ef1af99f1e8f51
version: 0.1
---

# F11 - P06 Product Category Global Filter Contract

## 1. Goal
Activate `Product Category` as a real membership-based global cohort across the supported artifact-backed dashboard surfaces, without silently collapsing the same-dimension `Category Share` panel into a trivial one-row view.

## 2. User Value
- **As a** dashboard reviewer exploring cohort behavior
- **I want** `Product Category` to reshape KPI, Time Trend, Payment, and Review totals as a real global filter
- **So that** the category selector feels productized rather than cosmetic, while `Category Share` still explains the chosen category honestly through focused-mode disclosure

## 3. Acceptance Criteria
- **Scenario 1: membership-based category cohort**
  - **Given** an order can contain multiple product categories
  - **When** the user selects a `Product Category`
  - **Then** the dashboard must include every delivered order that contains that category, rather than pretending the cohort is a single-value dimension

- **Scenario 2: supported panels consume the same cohort**
  - **Given** `Date Range`, `Customer State`, and `Product Category` are active
  - **When** the dashboard renders KPI, Time Trend, Payment, and Review panels
  - **Then** those panels must all read from the same combined cohort

- **Scenario 3: payment type stays secondary**
  - **Given** a category cohort is active
  - **When** the user selects `Payment Type`
  - **Then** payment-aware panels must slice inside that category cohort instead of redefining it

- **Scenario 4: Category Share uses focused mode**
  - **Given** `Category Share` visualizes the same dimension as `Product Category`
  - **When** a category is selected
  - **Then** the panel must keep the broader ranking visible, highlight the chosen category, and explicitly disclose focused-mode handling

- **Scenario 5: coverage gaps are named**
  - **Given** `Brazil Map` still remains range-scoped by state
  - **When** a category is active
  - **Then** the UI must state that `Product Category` is not applied on the map instead of silently ignoring the filter

## 4. Verification Notes
| ID | Scenario | Given | When | Then | Priority |
|---|---|---|---|---|---|
| TC1 | category cohort totals | `all` range | select `bed_bath_table` | KPI / Trend / Review totals all recalc from the same membership cohort | High |
| TC2 | combined state + category cohort | `all` range + `SP` | select `bed_bath_table` | payment-aware panels only show orders inside the combined cohort | High |
| TC3 | focused-category disclosure | `Category Share` | select a category | ranking stays visible and the selected category is highlighted | High |
| TC4 | map coverage gap | active category cohort | inspect `Brazil Map` subtitle | the panel explicitly says category is not applied there | Medium |

## 5. Scope Notes
- This phase promotes `Product Category` from staged selector to active cohort.
- `Brazil Map` remains special-case handling and does not become category-filtered in P3.
- `Category Share` intentionally does **not** collapse to a one-category chart when a category is active.

## 6. Evidence
- `scripts/generate-phase2-dashboard-artifact.mjs` now emits `orderFacts` so runtime selectors can resolve `dateRange x customerState x productCategory` without exploding the artifact into `state x category` pre-aggregations.
- `scripts/verify-phase2-dashboard-artifact.mjs` covers representative category cohorts such as `bed_bath_table` and `health_beauty`.
