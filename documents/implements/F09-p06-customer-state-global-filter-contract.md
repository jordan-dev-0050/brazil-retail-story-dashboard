---
author: Codex
date: 2026-06-19
title: F09 - P06 Customer State Global Filter Contract
uuid: 0bf95f3d6fe44656b7a3c6ee2e7f3569
version: 0.1
---

# F09 - P06 Customer State Global Filter Contract

## 1. 功能概述
`Customer State` 從「已有 artifact-backed options、但仍刻意 disabled 的 placeholder」提升為 dashboard 中真正可用的 global cohort。於 P06 P2 中，所選州別現在會以同一個 delivered-order cohort 驅動 KPI cards、Time Trend、payment-aware panels、Delay vs Review 與 Category Share；而 Brazil Map 則保留 same-dimension 視角，改採 focused-state handling，而不是假裝自己已被全域過濾。

## 2. Requirement / User Story
- **As a** 以作品品質角度檢視 dashboard 的使用者
- **I want** `Customer State` 表現得像一個真正可用的 global filter，而不是只有 disabled select、沒有任何下游效果
- **So that** 整個 dashboard 的互動能更一致、可信，而且 clearly staged，而不是半接半不接

## 3. Acceptance Criteria
- **Scenario 1: supported panels share one state cohort**
  - **Given** dashboard 已載入且目前 date range 有效
  - **When** 我選擇一個具體的 `Customer State`
  - **Then** KPI cards、Time Trend、payment-aware panels、Delay vs Review 與 Category Share 都必須從同一個 state cohort 重新計算

- **Scenario 2: payment type remains secondary**
  - **Given** 目前已有一個 active 的 `Customer State`
  - **When** 我再切換 `Payment Type`
  - **Then** 只有 Freight Distribution、Payment Mix 與 On-time vs Delayed 會再被切一次，而且它們的 payment options 必須來自已經被 state 過濾後的 cohort

- **Scenario 3: Brazil Map uses focused-state mode**
  - **Given** 目前已有一個 active 的 `Customer State`
  - **When** 我查看 Brazil Map
  - **Then** 完整地圖仍然必須可見，而被選中的州應以 focused summary 呈現，而不是把地圖塌成單州 cohort

- **Scenario 4: Product Category remains staged**
  - **Given** P06 P2 已完成
  - **When** 我檢查 filter bar 與 disclosure copy
  - **Then** `Product Category` 必須仍維持 disabled，並清楚標示為後續 phase 的 staged rollout

## 4. 測試情境 / 範例
| ID | Scenario | Given | When | Then | Priority |
|---|---|---|---|---|---|
| TC1 | state cohort 驅動 KPI / trend | 有效 date range | 選擇 `SP` | KPI 與 Time Trend totals 一起改變 | High |
| TC2 | payment slice 仍維持巢狀 | active `SP` cohort | 切換 payment type | 只有 payment-aware panels 在 `SP` 內重新切片 | High |
| TC3 | category share 跟隨 state | active `RJ` cohort | 查看 category panel | category totals 只反映 `RJ` orders | High |
| TC4 | map focused mode | active `MG` cohort | 查看 map footer / subtitle | 完整地圖仍可見，且 `MG` 被標示為 focused state | Medium |
| TC5 | staged category filter disclosure | default dashboard | 查看 filter bar | `Product Category` 維持 disabled，並顯示 staged helper copy | Medium |

## 5. 實作說明
- 擴充 phase-2 artifact contract，讓 `kpisByRange`、`monthlySeriesByRange`、`paymentPanelsByRange`、`categoryPanelsByRange` 與 `reviewPanelsByRange` 都暴露 `{ all, byState }`。
- `geographyPanelsByRange` 維持 range-scoped；same-dimension handling 在 P2 是 UI concern，不直接做成 filtered-cohort artifact。
- `Payment Type` 的選項需要依所選 state cohort 重新計算，避免 state 切換後還保留無效 payment selection。
- disclosure copy 需要明確更新目前邊界：`Customer State` 已 active、`Payment Type` 仍是 secondary、`Product Category` 仍 staged。

## 6. 補充說明
- 本 phase 刻意不引入 `byCategory` artifact slices。
- 產生出的 artifact version 已提升為 `0.5.0`，用來反映新的 state-scoped contract。
