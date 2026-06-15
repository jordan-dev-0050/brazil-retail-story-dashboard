---
author: Codex
date: 2026-06-15
title: P05 hybrid 邊界盤點與 scope freeze 合約
uuid: c6e52ed6f50340bc8eeb59a76b88f74e
version: 0.2
status: drafted
---

# 實作合約 - P05 hybrid 邊界盤點與 scope freeze

## 1. 功能概觀

本文件對應
`documents/planning/P05-portfolio-credibility-hybrid-boundary-convergence-plan.md`
中的 `P1`，目的不是直接擴功能，而是先把目前 dashboard 已經存在的 hybrid boundary
盤清楚，作為後續 `P2-P4` 收斂工作的共同基線。

目前系統已經不是純 mock dashboard，但也還不是 fully real-backed dashboard。現況是：
- 部分 KPI 已改為 real-backed
- `Time Trend` 只有 `monthly` 是 real-backed
- `Customer State` 與 `Product Category` 已有 artifact-backed options，但 UI 仍刻意 disabled
- `Payment Type` 只影響 payment-aware panels，並未驅動整個 dashboard

本合約的責任，是明確定義哪些區塊屬於 `real-backed`、哪些仍是 `mock-backed`、哪些是
`artifact-backed but intentionally disabled`，並凍結這個邊界，避免後續 phase 在沒有明講的情況下擴大範圍或誤導 portfolio 敘事。

## 2. 需求 / User Story

- **As a** 維護這個 portfolio dashboard 的開發者
- **I want** 一份明確描述 KPI、Time Trend、filter 與 panel wiring 現況邊界的中文合約
- **So that** 後續 P05 的收斂工作可以在不誤判現況、不偷渡 scope expansion 的前提下推進

## 3. 驗收標準

- **Scenario 1: KPI 邊界被明確凍結**
  - **Given** `src/data/dashboardData.ts`
  - **When** 檢視 `buildKpiCards()`
  - **Then** `Total Orders`、`Total GMV`、`Late Delivery Rate` 必須被定義為來自
    `phase2DashboardArtifact` 的 real-backed 指標，而 `Avg Delivery Days` 與
    `Avg Review Score` 必須被定義為來自 `dashboardMock` 的 mock-backed 指標

- **Scenario 2: Time Trend 邊界被明確凍結**
  - **Given** `src/data/dashboardData.ts` 與 `src/components/TimeTrendPanel.tsx`
  - **When** 檢視 Time Trend 的資料來源與互動
  - **Then** `monthly` series 與 monthly highlights 必須被定義為 real-backed，而
    `daily` / `weekly` series 與其 highlights 必須被定義為 mock-backed

- **Scenario 3: Filter 邊界被明確凍結**
  - **Given** `src/data/phase2DashboardData.ts` 與 `src/components/FilterBar.tsx`
  - **When** 檢視 filter config 與 UI rendering
  - **Then** `Date Range` 與 `Payment Type` 必須被定義為 active filters，而
    `Customer State` 與 `Product Category` 必須被定義為 artifact-backed options，
    但在 UI 中維持 disabled 狀態

- **Scenario 4: Panel interaction 邊界被明確凍結**
  - **Given** `src/components/DashboardPage.tsx`
  - **When** 檢視 filter 與 panel 的 wiring
  - **Then** `Payment Type` 只能影響 `On-time vs Delayed`、`Freight Distribution`、
    `Payment Mix`，而 `Brazil Map`、`Category Share`、`Delay vs Review`
    仍維持 date-range-only 的 artifact-backed 行為

- **Scenario 5: P05 範圍被明確約束**
  - **Given** P05 規劃
  - **When** 後續 phase 開始實作
  - **Then** 不得在沒有新合約的情況下宣稱 geography/category filters 已 fully real-backed、
    已具備 backend / warehouse 支撐，或已具備 real daily / weekly trend grain

## 4. 邊界盤點

| 區域 | 目前 source of truth | P05 P1 狀態 | 備註 |
|------|----------------------|--------------|------|
| KPI: Total Orders | `phase2DashboardArtifact.kpisByRange` 經 `buildPhase2KpiCards()` 組裝 | real-backed | caption 來自 metric definition metadata |
| KPI: Total GMV | `phase2DashboardArtifact.kpisByRange` 經 `buildPhase2KpiCards()` 組裝 | real-backed | 使用 artifact-backed GMV formatter |
| KPI: Avg Delivery Days | `mockKpiCards[2]` | mock-backed | P05 P2 的主要候選收斂項 |
| KPI: Late Delivery Rate | `phase2DashboardArtifact.kpisByRange` 經 `buildPhase2KpiCards()` 組裝 | real-backed | 已在 P04 收斂完成 |
| KPI: Avg Review Score | `mockKpiCards[4]` | mock-backed | 後續可評估是否 artifact extension |
| Time Trend: monthly | `getMonthlySeries(rangeId)` 與 `getTimeTrendSummary(rangeId)` | real-backed | subtitle 已揭露 monthly real artifact data |
| Time Trend: daily | `mockTimeTrendSeries.daily` | mock-backed | 僅作示意，不代表真實日粒度能力 |
| Time Trend: weekly | `mockTimeTrendSeries.weekly` | mock-backed | 僅作示意，不代表真實週粒度能力 |
| Time Trend highlights for monthly | `getTimeTrendSummary(rangeId)` | real-backed | 由 artifact-backed totals 與 monthly series 推導 |
| Time Trend highlights for daily/weekly | `mockTimeTrendHighlights` | mock-backed | 未隨 range 做真實切換 |
| Date Range filter | `phase2DashboardArtifact.dateRanges` | active real-backed selector | 是多數 dashboard slice 的主控制項 |
| Payment Type filter | `paymentPanelsByRange[rangeId].paymentTypeOptions` | active artifact-backed selector | 只影響 payment-aware panels |
| Customer State filter | `customerStateOptionsByRange[rangeId]` | artifact-backed but disabled | 目前僅盤點，不屬於已 productized filter |
| Product Category filter | `productCategoryOptionsByRange[rangeId]` | artifact-backed but disabled | 目前僅盤點，不屬於已 productized filter |
| Brazil Map panel | `geographyPanelsByRange[rangeId]` | artifact-backed by range | 尚未 payment-type aware |
| Category Share panel | `categoryPanelsByRange[rangeId]` | artifact-backed by range | 尚未 product-category aware |
| Delay vs Review panel | `reviewPanelsByRange[rangeId]` | artifact-backed by range | 尚未 state/category aware |

## 5. 範圍內

- 盤點現有 facade 與 component wiring 已實作的 hybrid boundary
- 固定本專案對 `real-backed`、`mock-backed`、`artifact-backed`、`intentionally disabled`
  的用語
- 定義目前哪些 filters 真的有驅動哪些 panels
- 作為後續 `F08`、`F09`、`F10` 的共同起點

## 6. 不在本次範圍

- 把 `Customer State` 轉成可操作的 geography filter
- 把 `Product Category` 轉成可操作的 category filter
- 宣稱所有 KPI cards 都已經 real-backed
- 宣稱所有 Time Trend granularities 都已經 real-backed
- backend / API / database / warehouse 建置
- geospatial drill-down semantics
- 與邊界可信度無關的 panel 視覺重設計

## 7. 驗證方式

- 檢查 `src/data/dashboardData.ts` 中的 `buildKpiCards()`
- 檢查 `src/data/dashboardData.ts` 中的 `getTimeTrendSeries()` 與 `getTimeTrendHighlights()`
- 檢查 `src/data/phase2DashboardData.ts` 中的 `buildFilterOptions()`
- 檢查 `src/components/FilterBar.tsx` 中 disabled filter 的 rendering
- 檢查 `src/components/DashboardPage.tsx` 中的 hybrid boundary disclosure 與 panel wiring

## 8. 後續文檔建議

- `F08` 應聚焦處理剩餘兩張 mock KPI cards，決定要 real-backed 收斂，或明確延後並揭露
- `F09` 應聚焦收斂 Time Trend interaction，避免 UI 暗示目前尚不存在的 real daily/weekly grain
- `F10` 應聚焦讓 UI disclosure、驗收方式、portfolio 敘事與本文件記錄的邊界一致
