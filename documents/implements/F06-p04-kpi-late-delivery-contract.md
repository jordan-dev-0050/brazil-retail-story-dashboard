---
author: Codex
date: 2026-06-06
title: P04 KPI / Late Delivery artifact contract
uuid: 4d0a8c2e40cc4fc8a7f1f8b7c2b54b56
version: 0.2
status: synced
---

# 實作契約 - P04 KPI / Late Delivery artifact contract

## 1. 背景

本文件承接 [P04 Portfolio Credibility Minimal Real Data Plan](../../docs/P04_Portfolio_Credibility_Minimal_Real_Data_Plan.md) 的 `P2`。
這一階段不直接切 UI，而是先把 KPI 與 `Late Delivery Rate` 的真資料定義正式收進 `script -> artifact -> types -> facade` 這條資料流，避免 `P3` 還要在 component 內重談口徑。

## 2. User Story

- **As a** 要延續 hybrid dashboard 真資料化的開發者
- **I want** artifact 自帶 KPI 與 `Late Delivery Rate` 的定義、欄位與 app-facing facade helper
- **So that** `P3` 可以直接切換 UI 資料來源，而不是把指標語意散落在 component 或 mock 文案裡

## 3. Acceptance Criteria

- **Scenario 1: artifact metadata 攜帶指標定義**
  - **Given** `src/data/phase2DashboardArtifact.json`
  - **When** 讀取 `metadata.metricDefinitions`
  - **Then** 至少存在 `totalOrders`、`totalGmv`、`lateDeliveryRate` 三個定義

- **Scenario 2: `Late Delivery Rate` 口徑在 contract 中可追溯**
  - **Given** `lateDeliveryRate` 指標定義
  - **When** 查看 metadata
  - **Then** 能看到 aggregation、numerator、denominator 與 on-time rule

- **Scenario 3: facade 不再重複硬編碼 KPI 說明**
  - **Given** `src/data/phase2DashboardData.ts` 與 `src/data/dashboardData.ts`
  - **When** 建立 KPI cards 或 trend highlight 文案
  - **Then** 說明文字優先來自 artifact-backed metric definition helper

- **Scenario 4: 既有數值不可回歸**
  - **Given** phase2 artifact verification
  - **When** 重新生成 artifact 並執行驗證
  - **Then** KPI、monthly series、payment slices、geography、category、review checks 皆維持通過

## 4. 實作範圍

- 更新 `scripts/generate-phase2-dashboard-artifact.mjs`
- 更新 `src/data/phase2DashboardTypes.ts`
- 更新 `src/data/phase2DashboardData.ts`
- 更新 `src/data/dashboardData.ts`
- 更新 `scripts/verify-phase2-dashboard-artifact.mjs`
- 重新生成 `src/data/phase2DashboardArtifact.json`

## 5. 非目標

- 不在這一階段改 `DashboardPage` 版面或 component 結構
- 不在這一階段把 `Avg Delivery Days` 或 `Avg Review Score` 改成 real-backed
- 不在這一階段啟用 `Customer State` 或 `Product Category` filter
- 不在這一階段新增 backend / API

## 6. 驗證

- `npm run generate:phase2-artifact`
- `npm run test:phase2-artifact`
- `npm run build`

## 7. 實作同步註記

- `scripts/generate-phase2-dashboard-artifact.mjs` 已補入 `metadata.metricDefinitions`、`kpisByRange` 與 `monthlySeriesByRange` 的 `lateDeliveryRate` contract。
- `src/data/phase2DashboardTypes.ts` 與 `src/data/phase2DashboardData.ts` 已對齊 KPI / monthly series / metric definition typed facade。
- `src/data/dashboardData.ts` 與 `src/components/TimeTrendPanel.tsx` 已切換 KPI cards 與 monthly `Late Delivery Rate` 為 artifact-backed。
- `DashboardPage` 仍維持既有 hybrid boundary，`Customer State` / `Product Category` filters 仍為 disabled，符合 P04 scope。
