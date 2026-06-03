---
author: Codex
date: 2026-06-03
title: 真實資料第一階段 artifact 生成
uuid: b4d7f9c0c0d34d86b9a1a7d4d62f3e11
version: 0.1
---

# 功能需求書 - 真實資料第一階段 artifact 生成

## 1. 功能概述 (Feature Overview)
本需求承接 [P01 真實資料整合第一階段規劃](../../docs/P01_Real_Data_Integration_Plan.md) 的 `P2`。目標不是直接改寫 dashboard UI，而是先把 Olist 原始 CSV 轉譯成一份可被前端穩定匯入的真資料 artifact，作為 `KPI + Time Trend + Date Range` 的第一版資料來源。

目前專案畫面仍由 `src/data/dashboardMock.ts` 提供資料，前端尚未建立真資料輸入點。`P2` 只處理 `orders` 與 `order_items` 所需的最小聚合，讓後續 `P3` 可以在不解析 CSV、不中途重談指標口徑的前提下，直接接上真資料。

## 2. 需求描述 (Requirement/User Story)
- **As a** dashboard 開發者與資料整合實作者
- **I want** 從 Olist `orders` 與 `order_items` 產出一份可直接匯入前端的真資料 artifact，內含固定日期區間 KPI 與月趨勢
- **So that** 後續前端只需要切換資料來源，就能把 `KPI + Time Trend + Date Range` 接到 real data，而不必在 UI 層重做 CSV 清理、join 與聚合規則

## 3. 驗收準則 (Acceptance Criteria)

- **Scenario 1: 第一版分析母體已正確收斂**
  - **Given** 本地存在 `data/olist_orders_dataset.csv`
  - **When** 生成第一版 dashboard artifact
  - **Then** 只納入 `order_status = delivered`、`order_purchase_timestamp` 非空，且下單日期介於 `2017-01-01` 到 `2018-08-31` 的訂單

- **Scenario 2: 訂單數 KPI 計算規則正確**
  - **Given** artifact 正在計算固定日期區間 KPI
  - **When** 產出 `totalOrders`
  - **Then** 必須以 `orders.order_id` 去重後計算，不因 `order_items` join 造成重複計數

- **Scenario 3: GMV KPI 計算規則正確**
  - **Given** artifact 已完成 `orders` 與 `order_items` 的必要關聯
  - **When** 產出 `totalGmv`
  - **Then** 必須使用 `SUM(order_items.price)`，明確不含 `freight_value`，且時間歸屬以 `order_purchase_timestamp` 為準

- **Scenario 4: 固定日期區間已被實體化**
  - **Given** 第一版只支援固定 `Date Range`
  - **When** artifact 輸出日期區間設定
  - **Then** 必須至少提供 `All Period (2017-01 to 2018-08)`、`2017 Full Year`、`2018 YTD (Jan-Aug)` 三個選項，並附上對應 `start` / `end`

- **Scenario 5: 月趨勢資料已可直接供圖表使用**
  - **Given** artifact 需要提供 `Time Trend` 真資料
  - **When** 輸出 `monthlySeriesByRange`
  - **Then** 每個日期區間都必須提供按月份升冪排列的序列，欄位至少包含 `month`、`label`、`orders`、`gmv`

- **Scenario 6: artifact 為單一可匯入檔案**
  - **Given** 目前專案為 Vite + TypeScript 前端
  - **When** artifact 完成產出
  - **Then** 它必須以單一受版控檔案存在於 repo 中，且可被前端直接匯入，不允許在執行時於瀏覽器端解析原始 CSV

- **Scenario 7: 已具備最小人工對帳說明**
  - **Given** artifact 已生成
  - **When** 交付 `P2` 產出物
  - **Then** 必須附上一份簡短對帳說明，至少記錄全期間 KPI 對帳方式，並抽查至少一個子區間與兩個月份的 `orders / gmv`

- **Scenario 8: 第一版邊界未被擴張**
  - **Given** 本需求屬於 `P2`
  - **When** 檢查 artifact 欄位與計算來源
  - **Then** 不應提前納入 `payments`、`reviews`、`products`、`customers`、`sellers`、`geolocation`，也不應提前承諾 `daily/weekly`、成長率、comparison 或其他圖表資料

## 4. 測試情境 (Test Scenarios / Examples)

| ID  | Scenario | Given | When | Then | Priority |
|-----|----------|-------|------|------|----------|
| TC1 | 收斂分析母體 | 已讀取 `olist_orders_dataset.csv` | 套用第一版資料篩選 | 僅保留 `delivered`、有 `order_purchase_timestamp`、且日期介於 `2017-01-01` 到 `2018-08-31` 的訂單 | High |
| TC2 | 計算 Total Orders | 已取得符合條件的訂單母體 | 產出 `kpisByRange` | `totalOrders` 以去重 `order_id` 計算，不受 `order_items` 筆數影響 | High |
| TC3 | 計算 Total GMV | 已完成 `orders` 與 `order_items` 關聯 | 產出 `totalGmv` | 使用 `SUM(order_items.price)`，不含 `freight_value` | High |
| TC4 | 產出固定日期區間 | artifact 正在輸出 `dateRanges` | 檢查所有 range 定義 | 至少包含 `all`、`2017`、`2018_ytd` 三組固定區間與正確邊界 | High |
| TC5 | 產出月趨勢序列 | artifact 正在輸出 `monthlySeriesByRange` | 檢查任一日期區間 | 月序列按時間升冪排列，且每筆含 `month`、`label`、`orders`、`gmv` | High |
| TC6 | 驗證 artifact 可匯入 | 專案仍為 Vite + TS | 在前端程式碼中匯入 artifact | 可直接匯入單一檔案，無需瀏覽器端 CSV parsing | High |
| TC7 | 驗證人工對帳說明 | artifact 已交付 | 檢視對帳紀錄 | 至少覆蓋全期間 KPI、1 個子區間、2 個月份的抽查方法與結果 | Medium |
| TC8 | 驗證非目標未混入 | 開始審查 artifact schema | 檢查來源資料表與欄位 | 未提前接入其他資料表，未提供 `daily/weekly` 或 comparison 類欄位 | Medium |

## 5. 實作註記 (Implementation Notes)
- **當前程式碼脈絡**
  - dashboard 目前由 `src/data/dashboardMock.ts` 提供 `filterOptions`、`kpiCards`、`timeTrendSeries` 等靜態資料。
  - `src/components/DashboardPage.tsx`、`src/components/FilterBar.tsx`、`src/components/TimeTrendPanel.tsx` 皆直接依賴 mock data 結構。
  - `tsconfig.app.json` 已啟用 `resolveJsonModule`，因此第一版 artifact 可以是 `.json` 或 `.ts`；但無論格式為何，都必須維持「單一可匯入檔」契約。

- **建議 artifact 責任邊界**
  - artifact 應落在前端可直接匯入的位置，建議為 `src/data/` 底下的明確命名檔案。
  - artifact 只承擔「CSV -> dashboard-ready view model」的轉譯責任，不承擔 UI state、互動邏輯或多圖表共用分析層抽象。
  - 若實作需要資料生成腳本，可新增在 repo 內；但最終交付重點是受版控 artifact 本身，而不是執行時動態生成。

- **建議 artifact schema**

```ts
type Phase1DashboardArtifact = {
  metadata: {
    source: 'olist';
    version: string;
    generatedAt: string;
    currency: 'BRL';
    timeAxis: 'order_purchase_timestamp';
    grain: 'month';
    orderPopulation: 'delivered_orders_only';
    coverageStart: '2017-01-01';
    coverageEnd: '2018-08-31';
  };
  dateRanges: Array<{
    id: 'all' | '2017' | '2018_ytd';
    label: string;
    start: string;
    end: string;
  }>;
  kpisByRange: Record<
    'all' | '2017' | '2018_ytd',
    {
      totalOrders: number;
      totalGmv: number;
    }
  >;
  monthlySeriesByRange: Record<
    'all' | '2017' | '2018_ytd',
    Array<{
      month: string;
      label: string;
      orders: number;
      gmv: number;
    }>
  >;
};
```

- **第一版所需最小來源欄位**
  - `data/olist_orders_dataset.csv`
    - `order_id`
    - `order_status`
    - `order_purchase_timestamp`
  - `data/olist_order_items_dataset.csv`
    - `order_id`
    - `price`

- **人工對帳建議**
  - 至少記錄全期間 `totalOrders` / `totalGmv`。
  - 至少抽查一個子區間，例如 `2017 Full Year` 或 `2018 YTD (Jan-Aug)`。
  - 至少抽查兩個月份的 `orders` / `gmv` 月值，確認月序列並非僅總和正確。

- **明確非目標**
  - 不在 `P2` 內調整 `DashboardPage`、`FilterBar`、`TimeTrendPanel` 的真資料接線行為；那些屬於 `P3`。
  - 不處理 map、物流、評論、付款、品類、州別過濾等資料需求。
  - 不新增 API、資料庫、排程或雲端資料管線。

## 6. 補充說明 (Additional Notes)
- 目前 repo 未發現 `CONTEXT.md`，因此本文件術語以 `P01` 與現有程式命名為準。
- 目前 repo 也未發現 `documents/modules/` 內容，建議後續補一份 `documents/modules/dashboard-data-flow.md`，專門記錄 mock、artifact 與前端面板之間的資料責任邊界。
- 若實作過程發現 `orders` 與 `order_items` 之外仍有不可避免的依賴，應先回寫本文件再擴張範圍，而不是直接把 `P3` 或後續 phase 內容吸入 `P2`。

## 附錄：TDD 需求實作流程提醒 (TDD Implementation Checklist)

請依照以下流程進行開發

1. 撰寫並調整需求說明

    使用 User Story 與 Acceptance Criteria 格式清楚描述需求情境與預期結果。

    所有條件應能對應到「可驗證」、「可自動化」的測試案例。

2. 建立測試

    根據驗收準則撰寫對應的失敗測試（紅燈）。

    每個 Scenario 至少對應一筆測試案例（可含邊界條件與例外處理）。

3. 撰寫最簡實作

    僅為通過測試撰寫必要最少的邏輯，避免過度開發。

4. 測試通過（綠燈）

    所有測試案例通過，自動化測試無錯誤。

5. 重構（Refactor）

    在測試綠燈狀態下，優化程式結構與可讀性，保留功能行為一致。

6. 文件與版本同步

    驗證文件內容與實作結果一致，更新需求版本與測試記錄。
    更新該文件內容，增加實作註記
