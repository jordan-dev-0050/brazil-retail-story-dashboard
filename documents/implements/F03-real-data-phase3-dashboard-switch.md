---
author: Codex
date: 2026-06-03
title: P01 第三階段儀表板切換到真實資料 KPI 與時間趨勢
uuid: 7d4d3bc6b8d8491eaf28935a0a0a5b12
version: 0.1
---

# 功能文件 - P01 第三階段儀表板切換

## 1. 功能概觀 (Feature Overview)
本功能對應 [docs/P01_Real_Data_Integration_Plan.md](/d:/Jordan_Backup/brazil-retail-story-dashboard/docs/P01_Real_Data_Integration_Plan.md) 中的 `P01 / P3`。

目前 repository 已經有由 Olist `orders` 與 `order_items` 產出的真實資料 artifact，dashboard 主結構也已經能夠用這份 artifact 呈現 `KPI + Time Trend + Date Range`。`P3` 的目的，是把這條資料路徑正式提升為預設的 dashboard 主路徑，而不是繼續把它當成某個階段中的暫時性實驗。

這一階段的範圍刻意維持精準：
- 將真實資料 artifact 提升為 dashboard KPI 與時間趨勢的穩定資料來源
- 其餘地圖與分析面板先維持 mock data，留待後續 phase 處理
- 尚未實作的維度 filter 保持 disabled 狀態
- 移除 UI placeholder 中帶有 phase 編號的字樣，避免畫面仍暗示這是未來功能

## 2. 需求 / User Story
- **As a** 正在檢視 real-data migration 的 dashboard 利害關係人
- **I want** dashboard 主路徑能透過穩定的 app-facing module，使用真實資料 artifact 呈現 `Date Range`、`Total Orders`、`Total GMV` 與 `Time Trend`
- **So that** dashboard 可以明確進入一種混合模式：上層已驗證區塊先使用 real-backed 輸出，而其餘面板仍維持 mock-backed，且不再帶有誤導性的標示

## 3. 驗收標準 (Acceptance Criteria)

- **Scenario 1: 穩定的 dashboard 資料入口**
  - **Given** repository 中已存在 `src/data/phase2DashboardArtifact.json`
  - **When** dashboard UI 元件需要 KPI、日期範圍或時間趨勢資料
  - **Then** 它們必須改由穩定的 app-facing module 匯入，而不是直接依賴帶有 phase 命名的實作檔

- **Scenario 2: KPI 與時間趨勢持續維持 real-backed**
  - **Given** 使用者開啟 dashboard
  - **When** 切換 `Date Range`
  - **Then** `Total Orders`、`Total GMV` 與 `Time Trend` 都必須反映該範圍對應的真實資料 artifact 值

- **Scenario 3: 尚未完成的 filters 仍然明確，但不造成誤導**
  - **Given** `customerState`、`productCategory` 與 `paymentType` 在此階段尚未實作
  - **When** filter bar 渲染
  - **Then** 這些 filter 必須保持 disabled，且使用中性的 placeholder label，例如 `All States`，而不是仍然顯示 `Phase 3`

- **Scenario 4: mixed-mode dashboard 是刻意保留的狀態**
  - **Given** map、payment mix、category share、freight 與 delivery panels 仍然使用 mock-backed 資料
  - **When** dashboard 渲染
  - **Then** real-backed 與 mock-backed 區塊必須可以持續共存，且不破壞目前版面與互動

## 4. 測試情境 / 範例 (Test Scenarios / Examples)

| ID  | Scenario | Given | When | Then | Priority |
|-----|----------|-------|------|------|----------|
| TC1 | 穩定資料 facade | dashboard UI 會匯入 data helpers | imports 完成更新 | KPI 與 time-trend 元件改用 `src/data/dashboardData.ts` 與 `src/data/dashboardTypes.ts` | High |
| TC2 | 日期範圍切換 | 使用者選擇 `all`、`2017` 或 `2018_ytd` | KPI cards 與圖表重新渲染 | 值必須對應目前 artifact 中各 range 的切片資料 | High |
| TC3 | 中性 placeholder 文案 | disabled filters 可見 | filter bar 渲染 | label 顯示 `All States`、`All Categories`、`All Payment Types` | High |
| TC4 | 混合模式渲染 | mock-backed 側邊與下方分析面板維持不變 | dashboard page 載入 | 版面仍可正常呈現，不出現回歸 | Medium |

## 5. 實作說明 (Implementation Notes)
- 新增穩定的 app-facing data facade：
  - `src/data/dashboardData.ts`
  - `src/data/dashboardTypes.ts`
- `phase2DashboardArtifact.json` 與 phase2 生成腳本目前仍保留為較底層的 artifact 來源。
- 將 `DashboardPage`、`FilterBar`、`TimeTrendPanel` 改走穩定 facade，讓後續 phase 擴充資料契約時，不需要再次進行大範圍 UI rename。
- 本階段不擴大到 state / category / payment 的 join 處理。
- 本階段不處理其餘分析面板從 mock data 轉向 real data。

## 6. 補充說明 (Additional Notes)
- 這一階段除了畫面切換，也包含命名穩定化與整合收斂。
- `P3` 完成後，dashboard 仍然是刻意保留的 hybrid 狀態：上層 KPI 與時間趨勢走 real-backed，其餘分析面板暫時維持 mock-backed。

## TDD 實作檢查清單 (TDD Implementation Checklist)

1. 先確認哪些 UI 元件定義了本 phase 的範圍。
2. 在修改 component imports 前，先建立穩定 facade modules。
3. 更新 imports 與 placeholder labels。
4. 執行 build 驗證。
5. 將仍然使用 mock-backed 的區塊明確記錄為後續 phase 工作，而不是隱性技術債。
