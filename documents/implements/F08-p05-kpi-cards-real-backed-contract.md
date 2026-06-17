---
author: Codex
date: 2026-06-15
title: P05 P2 KPI cards fully real-backed contract
uuid: 1f7ec4f2a8c944c8b2bb50c22f2c3c63
version: 0.1
status: synced
---

# 實作契約 - P05 P2 KPI cards fully real-backed

## 1. 背景 / 目標

本文件承接 `documents/planning/P05-portfolio-credibility-hybrid-boundary-convergence-plan.md`
中的 `P2`，目的不是擴充新的 dashboard 指標種類，而是先把首頁 KPI row 從
`src/data/dashboardMock.ts` 的混搭狀態收斂成單一 artifact-backed facade。

依據 `F07-p05-boundary-inventory-contract.md` 的盤點結果，當前 `buildKpiCards()`
雖已將 `Total Orders`、`Total GMV`、`Late Delivery Rate` 切到 real-backed，
但 `Avg Delivery Days` 與 `Avg Review Score` 仍直接沿用 mock card。這使得最顯眼的
summary layer 仍保留不透明資料來源，削弱 portfolio credibility。

P05 P2 的責任是：

- 移除 KPI row 對 `mockKpiCards` 的直接依賴。
- 只渲染目前 artifact 已能支撐、可說清楚定義的 KPI。
- 若現有 artifact 尚未提供某 KPI 的穩定來源，明確將該 KPI 排除在本 phase 之外，
  而不是繼續以 mock 值冒充 real-backed。

## 2. User Story

- **As a** 正在檢視 portfolio dashboard 的讀者
- **I want** 首屏 KPI cards 的每一張數值都能追溯到 artifact facade
- **So that** 我看到的 summary layer 不會同時混入無法說明來源的 mock 指標

## 3. 驗收情境

- **Scenario 1: KPI row 不再混用 mock card**
  - **Given** `src/data/dashboardData.ts`
  - **When** 檢視 `buildKpiCards(rangeId)`
  - **Then** 回傳結果不得再直接拼接 `mockKpiCards`
  - **And** KPI row 應完全由 `src/data/phase2DashboardData.ts` 的 facade 輸出

- **Scenario 2: Avg Review Score 改由既有 artifact 推回**
  - **Given** `src/data/phase2DashboardArtifact.json` 已包含 `reviewPanelsByRange`
  - **When** facade 建立 KPI cards
  - **Then** `Avg Review Score` 應以 review panel 的聚合資料加權回推
  - **And** 文案需明確表達其母體為 reviewed delivered orders

- **Scenario 3: 無真資料契約支撐的 KPI 不再留在首頁**
  - **Given** 目前 artifact metadata 與 KPI schema 未包含 `Avg Delivery Days`
  - **When** P05 P2 完成後重新檢視 KPI row
  - **Then** `Avg Delivery Days` 不應再以 mock card 形式留在首頁
  - **And** 此缺口應被視為後續 artifact extension 議題，而非本 phase 內偷偷保留的 hybrid

- **Scenario 4: UI disclosure 與實際邊界一致**
  - **Given** `src/components/DashboardPage.tsx`
  - **When** 使用者閱讀 hybrid boundary 說明
  - **Then** 文案需反映「KPI cards 已 fully real-backed」
  - **And** 不得再暗示 KPI row 仍含 mock-backed 指標

- **Scenario 5: KPI card 舊比較語意不再殘留**
  - **Given** `src/data/dashboardData.ts` 與 `src/components/KpiCard.tsx`
  - **When** 檢視 app-facing KPI 型別與渲染分支
  - **Then** 不應再保留 `delta`、`comparison`、`tone` 等舊 mock 比較欄位
  - **And** KPI card 應只呈現 real-backed value 與可解釋 caption

## 4. 資料契約

| KPI | 來源 | P05 P2 狀態 | 備註 |
|-----|------|-------------|------|
| Total Orders | `phase2DashboardArtifact.kpisByRange` | real-backed | 沿用既有 facade |
| Total GMV | `phase2DashboardArtifact.kpisByRange` | real-backed | 沿用既有 facade |
| Late Delivery Rate | `phase2DashboardArtifact.kpisByRange` | real-backed | 沿用既有 facade |
| Avg Review Score | `phase2DashboardArtifact.reviewPanelsByRange` | real-backed | 由 bucket `reviewScoreAvg * orderCount` 加權回推 |
| Avg Delivery Days | 無 | out of scope for P2 | 需後續 artifact extension，不能再沿用 mock |

## 5. 實作範圍

- 更新 `src/data/phase2DashboardData.ts`
  - 補上 artifact-backed 的 `Avg Review Score` KPI 建構邏輯
  - 讓 KPI facade 成為單一來源
- 更新 `src/data/dashboardData.ts`
  - 移除 `mockKpiCards` 混搭
- 更新 `src/components/DashboardPage.tsx`
  - 讓 KPI row 版面與 disclosure 文案反映新的真實邊界
- 更新 `src/components/KpiCard.tsx`
  - 移除已失效的 `delta / comparison / tone` 渲染分支
- 更新 `src/data/dashboardMock.ts`
  - 移除不再被 app-facing facade 使用的舊 KPI mock card 定義

## 6. 非目標

- 不在此 phase 內擴充 artifact schema 去支援 `Avg Delivery Days`
- 不在此 phase 內新增 KPI period-over-period delta / comparison copy
- 不在此 phase 內收斂 `Time Trend` 的 daily / weekly mock behavior
- 不在此 phase 內啟用 `Customer State` 或 `Product Category` filters

## 7. 驗證方式

- 檢查 `src/data/dashboardData.ts` 已不再 import 或拼接 `mockKpiCards`
- 檢查 `src/data/phase2DashboardData.ts` 的 KPI facade 僅依賴 artifact data
- 檢查 `src/components/KpiCard.tsx` 與 `src/data/dashboardData.ts` 已不再暴露 `delta / comparison / tone`
- 執行 `npm run build`

## 8. 後續議題

- 若之後需要恢復五張 KPI row，應先擴 artifact 契約，再新增 UI card
- `Avg Delivery Days` 應以獨立 FXX 定義其指標口徑、母體、時間軸與 artifact 來源
