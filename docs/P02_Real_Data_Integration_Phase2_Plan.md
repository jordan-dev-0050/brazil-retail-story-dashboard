---
author: Codex
date: 2026-06-04
title: 真實資料整合第二階段總規劃
uuid: 7b968c39e5ff4d86a7da50a6ac76a73f
version: 0.2
status: synced
---

# 規劃書 - 真實資料整合第二階段

## 1. 同步摘要 (Sync Summary)

本文件已依 2026-06-04 的程式現況同步。

和先前規劃版相比，第二階段目前不是「準備開始」，而是主功能已經落地：

1. `Payment Type` 已從 placeholder 變成可操作的真實 filter。
2. `Freight Distribution`、`Payment Mix`、`On-time vs Delayed` 已接上同一份 dashboard artifact 的 real-backed slices。
3. dashboard 仍維持 hybrid 邊界，`Brazil Map`、`Category Share`、`Delay vs Review` 依然是 mock-backed。
4. phase2 artifact 生成與驗證腳本都已存在，且目前可通過自動驗證。

目前尚未從 repo 中看到第二階段專屬的 screenshot baseline / before-after 對照紀錄，也沒有為 `P2`、`P3`、`P4` 各自補齊獨立 FXX 文件；因此第二階段在「程式功能」層面可視為已完成主路徑，在「驗證紀錄與文件完備度」層面則仍有收尾空間。

## 2. 目前整體目標 (Current Overall Goal)

第二階段的實際目標已從「建立 payment-aware phase」轉成「穩定維護已落地的 payment-aware hybrid dashboard，並把邊界、驗證與後續 phase 的切線記錄清楚」。

以目前程式碼來看，這個目標可拆成兩部分：

1. 維持既有單一 artifact 策略，不另開 payment / delivery 專用 artifact。
2. 明確標記哪些區塊現在已 real-backed，哪些區塊仍刻意保留 mock-backed，避免 UI 看起來像是全頁都已真實化。

## 3. 程式現況對齊 (Codebase Alignment)

| 範圍 | 現況 | 主要證據 |
|------|------|----------|
| artifact schema | 已擴充第二階段資料 | `src/data/phase2DashboardTypes.ts` 定義 `paymentPanelsByRange`、`paymentTypeOptions`、三個 payment-aware panels |
| artifact 生成 | 已完成 | `scripts/generate-phase2-dashboard-artifact.mjs` 會輸出 KPI、monthly series、payment-aware slices |
| artifact 檔案 | 已存在 | `src/data/phase2DashboardArtifact.json`，metadata version 為 `0.3.0`，並在同一份 artifact 上延續 phase2 與 phase3 資料 |
| artifact facade | 已完成 | `src/data/phase2DashboardData.ts` 與 `src/data/dashboardData.ts` 已提供 UI 使用的讀取與轉接函式 |
| Payment Type filter | 已接線 | `src/components/DashboardPage.tsx`、`src/components/FilterBar.tsx` |
| 三個 phase2 panels | 已接線 | `src/components/FreightDistributionPanel.tsx`、`src/components/PaymentMixPanel.tsx`、`src/components/OnTimeDelayPanel.tsx` |
| hybrid boundary 提示 | 已存在 | `src/components/DashboardPage.tsx` 內有明確 boundary 文案 |
| 自動驗證 | 已存在且可通過 | `scripts/verify-phase2-dashboard-artifact.mjs`、`npm run test:phase2-artifact` |
| build 驗證 | 可通過 | `npm run build` |

## 4. 已實作的資料語意 (Implemented Data Semantics)

以下不是「規劃中的口徑」，而是目前程式真正採用的口徑：

- 分析母體沿用第一階段，只納入 `order_status = delivered` 且 `order_purchase_timestamp` 介於 `2017-01-01` 到 `2018-08-31` 的訂單。
- 日期切片固定為 `all`、`2017`、`2018_ytd` 三組，時間軸仍以 `order_purchase_timestamp` 為準。
- `Payment Type` 的命中規則是 order membership：只要某筆訂單含有指定 `payment_type`，該訂單就會進入該 slice。
- `Freight Distribution` 走 order-level 聚合，使用 `SUM(order_items.freight_value)` by `order_id`。
- `Payment Mix` 走 payment-row / payment-value 聚合；同一訂單若有多筆付款，會保留多筆付款在 mix 中。
- `On-time vs Delayed` 的判定為 `order_delivered_customer_date <= order_estimated_delivery_date` 視為 `On-time`；若任一日期缺失，依目前實作會落入非 on-time，最後被算進 delayed。
- `payment_type = all` 時，切片會保留全體符合日期區間的訂單；其中 order-level panel 與 payment-level panel 的總數不必相同，這是目前設計的一部分，不是 bug。

## 5. 各階段同步狀態 (Phase Status Sync)

### 總覽

| 階段 | 名稱 | 關聯文檔 / 程式 | 狀態 | 同步說明 |
|------|------|-----------------|------|----------|
| P1 | Payment-aware 基底切片與共享契約 | [F04-phase2-payment-aware-slice-contract.md](/d:/Jordan_Backup/brazil-retail-story-dashboard/documents/implements/F04-phase2-payment-aware-slice-contract.md) | [x] 已完成 | 契約已反映在生成腳本與型別中 |
| P2 | 單一 dashboard artifact 擴充 | [generate-phase2-dashboard-artifact.mjs](/d:/Jordan_Backup/brazil-retail-story-dashboard/scripts/generate-phase2-dashboard-artifact.mjs) | [x] 已完成 | 同一份 artifact 已包含第二階段所需資料 |
| P3 | Hybrid dashboard 接線 | [DashboardPage.tsx](/d:/Jordan_Backup/brazil-retail-story-dashboard/src/components/DashboardPage.tsx) | [x] 已完成 | `Payment Type` 與三個面板已接上 real-backed slices |
| P4 | 測試、對帳與範圍封板 | [verify-phase2-dashboard-artifact.mjs](/d:/Jordan_Backup/brazil-retail-story-dashboard/scripts/verify-phase2-dashboard-artifact.mjs) | [~] 部分完成 | 自動驗證與 build 已通過，但 repo 內尚未見到 screenshot/baseline 紀錄 |

---

### P1 - Payment-aware 基底切片與共享契約

**目前狀態**

此階段已不只是規格討論，實際契約已落在程式內：

- `scripts/generate-phase2-dashboard-artifact.mjs`
- `src/data/phase2DashboardTypes.ts`
- [F04-phase2-payment-aware-slice-contract.md](/d:/Jordan_Backup/brazil-retail-story-dashboard/documents/implements/F04-phase2-payment-aware-slice-contract.md)

**與原規劃相比的同步結論**

- `Date Range -> Payment Type` 切片已實作。
- order-level / payment-level 的分流責任已實作。
- `Payment Type = all` 時的統計差異已透過驗證腳本明確接受。

**備註**

若之後要調整「缺交付日期是否應算 delayed」，那會是口徑變更，不是單純文件修正。

---

### P2 - 單一 dashboard artifact 擴充

**目前狀態**

此階段已完成，且採用的是「加法擴充單一 artifact」而非拆第二份 artifact。

目前 artifact 結構包含：

- `metadata`
- `dateRanges`
- `kpisByRange`
- `monthlySeriesByRange`
- `paymentPanelsByRange`

其中 `paymentPanelsByRange` 內含：

- `paymentTypeOptions`
- `slicesByPaymentType`
- 每個 slice 的 `freightDistribution`
- 每個 slice 的 `paymentMix`
- 每個 slice 的 `onTimeVsDelayed`

**主要證據**

- [generate-phase2-dashboard-artifact.mjs](/d:/Jordan_Backup/brazil-retail-story-dashboard/scripts/generate-phase2-dashboard-artifact.mjs)
- [phase2DashboardArtifact.json](/d:/Jordan_Backup/brazil-retail-story-dashboard/src/data/phase2DashboardArtifact.json)
- [phase2DashboardData.ts](/d:/Jordan_Backup/brazil-retail-story-dashboard/src/data/phase2DashboardData.ts)

**目前 artifact 快照**

- metadata version: `0.3.0`
- generatedAt: `2026-06-04T03:18:43.724Z`
- coverage: `2017-01-01` 到 `2018-08-31`
- KPI:
  - `all`: `96,211` orders / `13,181,027.13` BRL GMV
  - `2017`: `43,428` orders / `5,962,902.01` BRL GMV
  - `2018_ytd`: `52,783` orders / `7,218,125.12` BRL GMV
- 同步說明：phase2 的 `paymentPanelsByRange` 結構仍完整保留，但目前 artifact 已額外包含 phase3 的 geography / category / review 與 dimension options 欄位。

---

### P3 - Hybrid dashboard 接線

**目前狀態**

此階段已完成主路徑接線。

**已完成內容**

- `dashboardData.ts` 已把 phase2 artifact 與既有 mock facade 合併成 app-facing data access layer。
- `FilterBar.tsx` 已顯示可操作的 `Payment Type`。
- `DashboardPage.tsx` 會在切換 `Date Range` 時同步校正 payment type 選項，避免保留失效值。
- `FreightDistributionPanel.tsx`、`PaymentMixPanel.tsx`、`OnTimeDelayPanel.tsx` 已吃 `paymentPanelSlice`。
- 畫面中保留 hybrid boundary 提示文字，明確說明只有三個 panel 會被 `Payment Type` 影響。

**仍維持 mock-backed 的區塊**

- `Brazil Map`
- `Category Share`
- `Delay vs Review`

這個邊界符合 [Real_Data_Integration_UI_Guardrails.md](/d:/Jordan_Backup/brazil-retail-story-dashboard/docs/Real_Data_Integration_UI_Guardrails.md) 的方向。

---

### P4 - 測試、對帳與範圍封板

**目前狀態**

此階段已有自動化基礎，但驗證紀錄還不算完整，因此同步為 `[~] 部分完成`。

**已完成**

- `scripts/verify-phase2-dashboard-artifact.mjs` 會驗證：
  - metadata 與 coverage
  - range month counts
  - KPI 與 monthly totals 對帳
  - `paymentTypeOptions` 與 slices 對應
  - selected sample slices 的數值
- `npm run test:phase2-artifact` 已通過
- `npm run build` 已通過

**目前尚缺**

- screenshot baseline / before-after 比對紀錄
- 第二階段手動對帳紀錄文件
- `P2`、`P3`、`P4` 專屬實作文件

**本次同步時的驗證結果**

- `npm run test:phase2-artifact`：passed
- `npm run build`：passed
- build 仍有 Vite chunk size warning，主 bundle 約 `613.42 kB`，但不影響本次 phase2 文件同步結論

## 6. In Scope / Out of Scope 同步版

### In Scope

- `Payment Type` 真實 filter
- `Freight Distribution` real-backed
- `Payment Mix` real-backed
- `On-time vs Delayed` real-backed
- 單一 artifact 延伸
- artifact 生成腳本與驗證腳本
- hybrid boundary 文案與資料責任維持清楚

### Out of Scope

- `Brazil Map`
- `Category Share`
- `Delay vs Review`
- `Customer State`
- `Product Category`
- `customers`、`products`、`reviews`、`sellers`、`geolocation`
- 第二份 payment / delivery artifact
- 新 API、資料庫或後端服務
- 自由起訖日期

## 7. 下一步建議 (Recommended Next Steps)

如果接下來要讓文件與程式完全一致，建議優先順序如下：

1. 補一份第二階段驗證紀錄，至少包含 artifact sample slice 對帳與 UI screenshot。
2. 決定是否為 `P2`、`P3`、`P4` 補各自的 FXX 文件；若不補，至少要在本文件中維持目前這種同步粒度。
3. 若要啟動第三階段，先明確切題到 `Customer State` / `Product Category` 或 geography / category / review，不要把 phase2 再往外擴。

## 8. 接棒備註 (Handoff Notes)

後續接手者若看到本文件，請先把第二階段視為「功能已落地、驗證文件待補強」，不要再把 `Payment Type` 與三個 payment-aware panels 當成未開始需求重新規劃。

真正還需要決策的，是：

1. 是否把 screenshot / manual reconciliation 正式納入 repo。
2. 是否為 phase2 的 artifact / UI / verification 補獨立實作文件。
3. 第三階段要先擴維度 filter，還是先擴 geography / category / review panels。
